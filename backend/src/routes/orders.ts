import { randomInt } from 'node:crypto';
import { Router } from 'express';
import { supabaseAdmin } from '../lib/supabase';
import { getUser, optionalAuth } from '../middleware/auth';
import { asyncHandler, HttpError } from '../middleware/error';
import { Database, ProductRow, ProductVariantRow, VoucherRow } from '../types/database';

type OrderItemInsert = Database['public']['Tables']['order_items']['Insert'];

export const ordersRouter = Router();

interface IncomingItem {
    productId?: unknown;
    variantId?: unknown;
    quantity?: unknown;
}

interface CreateOrderBody {
    items?: unknown;
    deliveryAreaId?: unknown;
    deliveryAddress?: unknown;
    voucherCode?: unknown;
    paymentMethod?: unknown;
}

const round2 = (value: number): number => Math.round(value * 100) / 100;

const generateOrderNumber = (): string => {
    const now = new Date();
    const stamp = [
        now.getFullYear(),
        String(now.getMonth() + 1).padStart(2, '0'),
        String(now.getDate()).padStart(2, '0'),
    ].join('');
    const suffix = randomInt(0, 36 ** 4).toString(36).toUpperCase().padStart(4, '0');
    return `COCO-${stamp}-${suffix}`;
};

const parseItems = (raw: unknown): IncomingItem[] => {
    if (!Array.isArray(raw) || raw.length === 0) {
        throw HttpError.badRequest('Cart is empty');
    }
    if (raw.length > 50) {
        throw HttpError.badRequest('Too many line items');
    }
    return raw as IncomingItem[];
};

const resolveUnitPrice = (product: ProductRow): number =>
    product.sale_price !== null ? product.sale_price : product.price;

const validateVoucher = (
    voucher: VoucherRow,
    subtotal: number,
    lines: { product: ProductRow }[]
): VoucherRow => {
    if (!voucher.is_active) {
        throw HttpError.badRequest('Voucher is not active');
    }
    if (voucher.expiry_date && new Date(voucher.expiry_date) < new Date()) {
        throw HttpError.badRequest('Voucher has expired');
    }
    if (voucher.usage_limit !== null && voucher.usage_count >= voucher.usage_limit) {
        throw HttpError.badRequest('Voucher has been fully used');
    }
    if (subtotal < Number(voucher.min_purchase)) {
        throw HttpError.badRequest(`Voucher requires a minimum purchase of ${voucher.min_purchase}`);
    }
    if (voucher.product_id && !lines.some((l) => l.product.id === voucher.product_id)) {
        throw HttpError.badRequest('Voucher does not apply to these items');
    }
    if (voucher.category_id && !lines.some((l) => l.product.category_id === voucher.category_id)) {
        throw HttpError.badRequest('Voucher does not apply to these items');
    }
    return voucher;
};

const computeTotals = (
    voucher: VoucherRow | null,
    subtotal: number,
    deliveryFee: number
): { discount: number; delivery: number } => {
    if (!voucher) {
        return { discount: 0, delivery: deliveryFee };
    }
    if (voucher.discount_type === 'FREE_DELIVERY') {
        return { discount: 0, delivery: 0 };
    }

    const value = voucher.discount_value ?? 0;
    if (voucher.discount_type === 'PERCENTAGE') {
        return { discount: round2((subtotal * value) / 100), delivery: deliveryFee };
    }
    return { discount: Math.min(round2(value), subtotal), delivery: deliveryFee };
};

ordersRouter.post(
    '/',
    optionalAuth,
    asyncHandler(async (req, res) => {
        const body = (req.body ?? {}) as CreateOrderBody;
        const items = parseItems(body.items);
        const user = getUser(res);

        const productIds = [...new Set(items.map((i) => String(i.productId ?? '')))];
        if (productIds.some((id) => !id)) {
            throw HttpError.badRequest('Every line item needs a productId');
        }

        const { data: products, error: productsError } = await supabaseAdmin()
            .from('products')
            .select('*')
            .in('id', productIds);

        if (productsError) {
            throw new HttpError(500, 'Failed to load products');
        }

        const byId = new Map((products ?? []).map((p) => [p.id, p]));

        interface Line {
            product: ProductRow;
            variant: ProductVariantRow | null;
            quantity: number;
            unitPrice: number;
        }

        const lines: Line[] = [];
        let subtotal = 0;

        for (const item of items) {
            const productId = String(item.productId);
            const product = byId.get(productId);
            if (!product || product.status !== 'ACTIVE') {
                throw HttpError.badRequest(`Product ${productId} is unavailable`);
            }

            const quantity = Number.parseInt(String(item.quantity ?? ''), 10);
            if (!Number.isFinite(quantity) || quantity < 1 || quantity > 100) {
                throw HttpError.badRequest(`Invalid quantity for product ${productId}`);
            }

            let variant: ProductVariantRow | null = null;
            if (item.variantId) {
                const { data } = await supabaseAdmin()
                    .from('product_variants')
                    .select('*')
                    .eq('id', String(item.variantId))
                    .maybeSingle();

                if (!data || data.product_id !== productId) {
                    throw HttpError.badRequest(`Variant does not belong to product ${productId}`);
                }
                if (data.stock_quantity < quantity) {
                    throw HttpError.conflict(
                        `Only ${data.stock_quantity} left of ${product.name}`
                    );
                }
                variant = data;
            }

            const unitPrice = resolveUnitPrice(product);
            subtotal = round2(subtotal + unitPrice * quantity);
            lines.push({ product, variant, quantity, unitPrice });
        }

        let deliveryFee = 0;
        if (body.deliveryAreaId) {
            const { data: area } = await supabaseAdmin()
                .from('delivery_areas')
                .select('id, fee, is_free')
                .eq('id', String(body.deliveryAreaId))
                .maybeSingle();

            if (!area) {
                throw HttpError.badRequest('Unknown delivery area');
            }
            deliveryFee = area.is_free ? 0 : Number(area.fee);
        }

        let voucher: VoucherRow | null = null;
        if (body.voucherCode) {
            const code = String(body.voucherCode).trim().toUpperCase();
            const { data } = await supabaseAdmin()
                .from('vouchers')
                .select('*')
                .eq('code', code)
                .maybeSingle();

            if (data) {
                voucher = validateVoucher(data, subtotal, lines);
            }
        }

        const { discount, delivery } = computeTotals(voucher, subtotal, deliveryFee);
        const totalAmount = round2(subtotal - discount + delivery);

        const { data: order, error: orderError } = await supabaseAdmin()
            .from('orders')
            .insert({
                order_number: generateOrderNumber(),
                customer_id: user?.id ?? null,
                status: 'PENDING',
                payment_status: 'PENDING',
                total_amount: totalAmount,
                discount_amount: discount,
                delivery_fee: delivery,
                delivery_address: body.deliveryAddress ? String(body.deliveryAddress) : null,
                delivery_area_id: body.deliveryAreaId ? String(body.deliveryAreaId) : null,
                payment_method: body.paymentMethod ? String(body.paymentMethod) : 'WHATSAPP',
                whatsapp_confirmed: false,
            })
            .select('id, order_number, total_amount, discount_amount, delivery_fee, status, payment_status')
            .single();

        if (orderError || !order) {
            throw new HttpError(500, 'Failed to create order');
        }

        const orderItems: OrderItemInsert[] = lines.map((line) => ({
            order_id: order.id,
            product_id: line.product.id,
            variant_id: line.variant?.id ?? null,
            quantity: line.quantity,
            unit_price: line.unitPrice,
            total_price: round2(line.unitPrice * line.quantity),
        }));

        const { error: itemsError } = await supabaseAdmin().from('order_items').insert(orderItems);

        if (itemsError) {
            await supabaseAdmin().from('orders').delete().eq('id', order.id);
            throw new HttpError(500, 'Failed to save order lines');
        }

        for (const line of lines) {
            if (line.variant) {
                await supabaseAdmin()
                    .from('product_variants')
                    .update({ stock_quantity: line.variant.stock_quantity - line.quantity })
                    .eq('id', line.variant.id);
            }
        }

        if (voucher) {
            await supabaseAdmin()
                .from('vouchers')
                .update({ usage_count: voucher.usage_count + 1 })
                .eq('id', voucher.id);
        }

        res.status(201).json({ data: order });
    })
);
