export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type SettingsRow = {
    id: string;
    brand_name: string | null;
    tagline: string | null;
    whatsapp: string | null;
    email: string | null;
    location: string | null;
    currency: string | null;
    default_theme: string | null;
    updated_at: string;
};

export type DeliveryAreaRow = {
    id: string;
    name: string;
    fee: number;
    is_free: boolean;
    created_at: string;
};

export type AdminRow = {
    id: string;
    email: string;
    full_name: string | null;
    created_at: string;
};

export type CustomerRow = {
    id: string;
    email: string;
    full_name: string | null;
    phone: string | null;
    referral_code: string | null;
    referred_by: string | null;
    created_at: string;
};

export type CategoryType = 'physical' | 'digital';
export type ProductStatus = 'ACTIVE' | 'DRAFT' | 'SOLD_OUT';

export type CategoryRow = {
    id: string;
    name: string;
    slug: string;
    type: CategoryType;
    image_url: string | null;
    created_at: string;
};

export type ProductRow = {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    category_id: string | null;
    price: number;
    sale_price: number | null;
    fabric: string | null;
    occasion: string | null;
    sku: string | null;
    status: ProductStatus;
    is_featured: boolean;
    is_new_arrival: boolean;
    is_pre_order: boolean;
    created_at: string;
    updated_at: string;
};

export type ProductImageRow = {
    id: string;
    product_id: string;
    image_url: string;
    is_primary: boolean;
    display_order: number;
};

export type ProductVariantRow = {
    id: string;
    product_id: string;
    size: string | null;
    color: string | null;
    stock_quantity: number;
};

export type OrderStatus =
    | 'PENDING'
    | 'CONFIRMED'
    | 'PROCESSING'
    | 'SHIPPED'
    | 'DELIVERED'
    | 'CANCELLED';

export type PaymentStatus = 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';

export type OrderRow = {
    id: string;
    order_number: string | null;
    customer_id: string | null;
    status: OrderStatus;
    total_amount: number;
    discount_amount: number;
    delivery_fee: number;
    delivery_address: string | null;
    delivery_area_id: string | null;
    payment_method: string | null;
    payment_status: PaymentStatus;
    whatsapp_confirmed: boolean;
    created_at: string;
    updated_at: string;
};

export type OrderItemRow = {
    id: string;
    order_id: string;
    product_id: string | null;
    variant_id: string | null;
    quantity: number;
    unit_price: number;
    total_price: number;
};

export type ReviewRow = {
    id: string;
    product_id: string;
    customer_id: string | null;
    rating: number;
    comment: string | null;
    image_url: string | null;
    is_verified_purchase: boolean;
    created_at: string;
};

export type CustomerWishlistRow = {
    id: string;
    customer_id: string;
    product_id: string;
    created_at: string;
};

export type DiscountType = 'PERCENTAGE' | 'FIXED' | 'FREE_DELIVERY';

export type VoucherRow = {
    id: string;
    code: string;
    discount_type: DiscountType;
    discount_value: number | null;
    min_purchase: number;
    expiry_date: string | null;
    usage_limit: number | null;
    usage_count: number;
    product_id: string | null;
    category_id: string | null;
    is_active: boolean;
    created_at: string;
};

export type ReferralRow = {
    id: string;
    referrer_id: string | null;
    referred_id: string | null;
    status: 'PENDING' | 'SUCCESSFUL';
    created_at: string;
};

export type ReferralEarningRow = {
    id: string;
    customer_id: string | null;
    amount: number;
    status: 'PENDING' | 'PAID';
    referral_id: string | null;
    created_at: string;
};

export type PaymentTransactionRow = {
    id: string;
    order_id: string | null;
    transaction_reference: string | null;
    amount: number;
    currency: string;
    payment_method: string | null;
    status: string | null;
    gateway_response: string | null;
    created_at: string;
};

export type WaitlistRow = {
    id: string;
    product_id: string | null;
    variant_id: string | null;
    email: string | null;
    phone: string | null;
    notified: boolean;
    created_at: string;
};

export type NotificationRow = {
    id: string;
    user_id: string;
    title: string;
    message: string;
    is_read: boolean;
    created_at: string;
};

type Table<Row> = {
    Row: Row;
    Insert: Partial<Row>;
    Update: Partial<Row>;
    Relationships: [];
};

export type Database = {
    public: {
        Tables: {
            settings: Table<SettingsRow>;
            delivery_areas: Table<DeliveryAreaRow>;
            admins: Table<AdminRow>;
            customers: Table<CustomerRow>;
            categories: Table<CategoryRow>;
            products: Table<ProductRow>;
            product_images: Table<ProductImageRow>;
            product_variants: Table<ProductVariantRow>;
            orders: Table<OrderRow>;
            order_items: Table<OrderItemRow>;
            reviews: Table<ReviewRow>;
            customer_wishlists: Table<CustomerWishlistRow>;
            vouchers: Table<VoucherRow>;
            referrals: Table<ReferralRow>;
            referral_earnings: Table<ReferralEarningRow>;
            payment_transactions: Table<PaymentTransactionRow>;
            waitlists: Table<WaitlistRow>;
            notifications: Table<NotificationRow>;
        };
        Views: Record<string, never>;
        Functions: Record<string, never>;
        Enums: {
            category_type: CategoryType;
            product_status: ProductStatus;
            order_status: OrderStatus;
            payment_status: PaymentStatus;
            discount_type: DiscountType;
        };
        CompositeTypes: Record<string, never>;
    };
};

export type TableRow<T extends keyof Database['public']['Tables']> =
    Database['public']['Tables'][T]['Row'];
