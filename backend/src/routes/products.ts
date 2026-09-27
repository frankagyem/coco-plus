import { Router } from 'express';
import { supabase } from '../lib/supabase';
import { asyncHandler, HttpError } from '../middleware/error';

export const productsRouter = Router();

const MAX_LIMIT = 60;
const DEFAULT_LIMIT = 24;

const parsePositiveInt = (value: unknown, fallback: number, max: number): number => {
    const parsed = Number.parseInt(String(value ?? ''), 10);
    if (!Number.isFinite(parsed) || parsed < 1) {
        return fallback;
    }
    return Math.min(parsed, max);
};

const asString = (value: unknown): string =>
    Array.isArray(value) ? String(value[0] ?? '') : String(value ?? '');

interface CategoryRef {
    id: string;
    name: string;
    slug: string;
}

interface ImageRef {
    id?: string;
    image_url: string;
    is_primary?: boolean;
    display_order?: number;
}

interface VariantRef {
    id: string;
    size: string | null;
    color: string | null;
    stock_quantity: number;
}

interface ProductListItem {
    id: string;
    name: string;
    slug: string;
    price: number;
    sale_price: number | null;
    fabric: string | null;
    occasion: string | null;
    status: string;
    is_featured: boolean;
    is_new_arrival: boolean;
    is_pre_order: boolean;
    category_id: string | null;
    category: CategoryRef | null;
    product_images: ImageRef[] | null;
}

productsRouter.get(
    '/',
    asyncHandler(async (req, res) => {
        const page = parsePositiveInt(req.query.page, 1, 10000);
        const limit = parsePositiveInt(req.query.limit, DEFAULT_LIMIT, MAX_LIMIT);
        const from = (page - 1) * limit;

        let query = supabase()
            .from('products')
            .select(
                'id, name, slug, price, sale_price, fabric, occasion, status, is_featured, is_new_arrival, is_pre_order, category_id, category:categories(id, name, slug), product_images(image_url, is_primary, display_order)',
                { count: 'exact' }
            )
            .eq('status', 'ACTIVE')
            .order('created_at', { ascending: false })
            .range(from, from + limit - 1);

        const categorySlug = typeof req.query.category === 'string' ? req.query.category : '';
        if (categorySlug) {
            const { data: category } = await supabase()
                .from('categories')
                .select('id')
                .eq('slug', categorySlug)
                .maybeSingle();

            if (!category) {
                res.json({ data: [], total: 0, page, limit });
                return;
            }
            query = query.eq('category_id', category.id);
        }

        if (req.query.featured === 'true') {
            query = query.eq('is_featured', true);
        }
        if (req.query.new === 'true') {
            query = query.eq('is_new_arrival', true);
        }

        const search = typeof req.query.search === 'string' ? req.query.search.trim() : '';
        if (search) {
            const escaped = search.replace(/[%,()]/g, ' ');
            query = query.or(
                `name.ilike.%${escaped}%,description.ilike.%${escaped}%,fabric.ilike.%${escaped}%`
            );
        }

        const { data, error, count } = await query;

        if (error) {
            throw new HttpError(500, 'Failed to load products');
        }

        res.json({ data: (data ?? []) as ProductListItem[], total: count ?? 0, page, limit });
    })
);

interface ProductDetail extends Omit<ProductListItem, 'product_images'> {
    description: string | null;
    sku: string | null;
    product_images: ImageRef[] | null;
    product_variants: VariantRef[] | null;
}

productsRouter.get(
    '/:slug',
    asyncHandler(async (req, res) => {
        const slug = asString(req.params.slug);

        const { data, error } = await supabase()
            .from('products')
            .select(
                'id, name, slug, description, price, sale_price, fabric, occasion, sku, status, is_featured, is_new_arrival, is_pre_order, category_id, category:categories(id, name, slug), product_images(id, image_url, is_primary, display_order), product_variants(id, size, color, stock_quantity)'
            )
            .eq('slug', slug)
            .eq('status', 'ACTIVE')
            .maybeSingle();

        if (error) {
            throw new HttpError(500, 'Failed to load product');
        }
        if (!data) {
            throw HttpError.notFound('Product not found');
        }

        const product = data as ProductDetail;

        const { data: reviews } = await supabase()
            .from('reviews')
            .select('rating')
            .eq('product_id', product.id);

        const ratings = (reviews ?? [])
            .map((r) => (r as { rating: number | null }).rating)
            .filter((r): r is number => typeof r === 'number');

        const average =
            ratings.length > 0
                ? Math.round((ratings.reduce((a, b) => a + b, 0) / ratings.length) * 10) / 10
                : null;

        res.json({
            data: {
                ...product,
                rating: { average, count: ratings.length },
            },
        });
    })
);
