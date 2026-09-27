-- COCO+ hardening: RLS, timestamps, indexes, integrity constraints
--
-- Ordering note: the initial migration creates tables with no policies, so it
-- leaves the database open. Everything below closes that.

-- ---------------------------------------------------------------------------
-- updated_at maintenance
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER products_set_updated_at
    BEFORE UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER orders_set_updated_at
    BEFORE UPDATE ON orders
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER settings_set_updated_at
    BEFORE UPDATE ON settings
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ---------------------------------------------------------------------------
-- settings must be a single row
--
-- The app reads branding, currency and default_theme from a lone record, so a
-- second row would make that read non-deterministic. Pinning the id makes the
-- primary key itself the guard.
-- ---------------------------------------------------------------------------

ALTER TABLE settings
    ALTER COLUMN id SET DEFAULT '00000000-0000-0000-0000-000000000000'::uuid;

ALTER TABLE settings
    ADD CONSTRAINT settings_singleton
    CHECK (id = '00000000-0000-0000-0000-000000000000'::uuid);

INSERT INTO settings (id)
VALUES ('00000000-0000-0000-0000-000000000000'::uuid)
ON CONFLICT DO NOTHING;

-- ---------------------------------------------------------------------------
-- Integrity constraints
--
-- The initial migration documented these value sets in comments only, so a bad
-- write could still land.
-- ---------------------------------------------------------------------------

ALTER TABLE categories
    ADD CONSTRAINT categories_type_check CHECK (type IN ('physical', 'digital'));

ALTER TABLE products
    ADD CONSTRAINT products_status_check CHECK (status IN ('ACTIVE', 'DRAFT', 'SOLD_OUT')),
    ADD CONSTRAINT products_price_check CHECK (price >= 0),
    ADD CONSTRAINT products_sale_price_check CHECK (sale_price IS NULL OR sale_price >= 0);

ALTER TABLE product_variants
    ADD CONSTRAINT product_variants_stock_check CHECK (stock_quantity >= 0);

ALTER TABLE orders
    ADD CONSTRAINT orders_status_check CHECK (status IN
        ('PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED')),
    ADD CONSTRAINT orders_payment_status_check CHECK (payment_status IN
        ('PENDING', 'PAID', 'FAILED', 'REFUNDED')),
    ADD CONSTRAINT orders_total_check CHECK (total_amount >= 0),
    ADD CONSTRAINT orders_discount_check CHECK (discount_amount >= 0),
    ADD CONSTRAINT orders_delivery_fee_check CHECK (delivery_fee >= 0);

ALTER TABLE order_items
    ADD CONSTRAINT order_items_quantity_check CHECK (quantity > 0),
    ADD CONSTRAINT order_items_unit_price_check CHECK (unit_price >= 0),
    ADD CONSTRAINT order_items_total_price_check CHECK (total_price >= 0);

ALTER TABLE vouchers
    ADD CONSTRAINT vouchers_discount_type_check CHECK (discount_type IN
        ('PERCENTAGE', 'FIXED', 'FREE_DELIVERY')),
    ADD CONSTRAINT vouchers_min_purchase_check CHECK (min_purchase >= 0),
    ADD CONSTRAINT vouchers_usage_count_check CHECK (usage_count >= 0);

ALTER TABLE referrals
    ADD CONSTRAINT referrals_status_check CHECK (status IN ('PENDING', 'SUCCESSFUL'));

ALTER TABLE referral_earnings
    ADD CONSTRAINT referral_earnings_status_check CHECK (status IN ('PENDING', 'PAID')),
    ADD CONSTRAINT referral_earnings_amount_check CHECK (amount >= 0);

-- An order item must reference either a plain product or a specific variant.
ALTER TABLE order_items
    ADD CONSTRAINT order_items_variant_check CHECK (variant_id IS NULL OR product_id IS NOT NULL);

-- ---------------------------------------------------------------------------
-- Indexes
--
-- Every foreign key gets one; Postgres does not create these automatically, and
-- without them joins and cascade deletes scan the whole table.
-- ---------------------------------------------------------------------------

CREATE INDEX idx_products_category_id ON products (category_id);
CREATE INDEX idx_products_status ON products (status);
CREATE INDEX idx_products_is_featured ON products (is_featured) WHERE is_featured;
CREATE INDEX idx_products_created_at ON products (created_at DESC);

CREATE INDEX idx_product_images_product_id ON product_images (product_id);
CREATE INDEX idx_product_variants_product_id ON product_variants (product_id);

CREATE INDEX idx_orders_customer_id ON orders (customer_id);
CREATE INDEX idx_orders_delivery_area_id ON orders (delivery_area_id);
CREATE INDEX idx_orders_created_at ON orders (created_at DESC);
CREATE INDEX idx_orders_status ON orders (status);

CREATE INDEX idx_order_items_order_id ON order_items (order_id);
CREATE INDEX idx_order_items_product_id ON order_items (product_id);
CREATE INDEX idx_order_items_variant_id ON order_items (variant_id);

CREATE INDEX idx_reviews_product_id ON reviews (product_id);
CREATE INDEX idx_reviews_customer_id ON reviews (customer_id);

CREATE INDEX idx_wishlists_customer_id ON customer_wishlists (customer_id);
CREATE INDEX idx_wishlists_product_id ON customer_wishlists (product_id);

CREATE INDEX idx_vouchers_product_id ON vouchers (product_id);
CREATE INDEX idx_vouchers_category_id ON vouchers (category_id);
CREATE INDEX idx_vouchers_code ON vouchers (code);

CREATE INDEX idx_referrals_referrer_id ON referrals (referrer_id);
CREATE INDEX idx_referrals_referred_id ON referrals (referred_id);
CREATE INDEX idx_referral_earnings_customer_id ON referral_earnings (customer_id);
CREATE INDEX idx_referral_earnings_referral_id ON referral_earnings (referral_id);

CREATE INDEX idx_payment_transactions_order_id ON payment_transactions (order_id);
CREATE INDEX idx_waitlists_product_id ON waitlists (product_id);
CREATE INDEX idx_waitlists_variant_id ON waitlists (variant_id);
CREATE INDEX idx_notifications_user_id ON notifications (user_id);

-- ---------------------------------------------------------------------------
-- Row level security
--
-- The browser talks to Supabase directly with the anon key, so this is the only
-- thing standing between a leaked key and the whole database.
--
-- Reads of public catalogue data are intentionally open. Orders, customers,
-- vouchers and referrals are not: those are written by the API using the
-- service role key, which bypasses RLS entirely, so no insert policy is granted
-- to the client and totals can never be forged from the browser.
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
    SELECT EXISTS (SELECT 1 FROM public.admins WHERE id = AUTH.UID());
$$ LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public;

ALTER TABLE settings          ENABLE ROW LEVEL SECURITY;
ALTER TABLE delivery_areas    ENABLE ROW LEVEL SECURITY;
ALTER TABLE admins            ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers         ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories        ENABLE ROW LEVEL SECURITY;
ALTER TABLE products          ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_images    ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_variants  ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders            ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items       ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews           ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_wishlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE vouchers          ENABLE ROW LEVEL SECURITY;
ALTER TABLE referrals         ENABLE ROW LEVEL SECURITY;
ALTER TABLE referral_earnings ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE waitlists         ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications     ENABLE ROW LEVEL SECURITY;

-- Public catalogue reads -----------------------------------------------------

CREATE POLICY settings_public_read ON settings
    FOR SELECT USING (true);

CREATE POLICY delivery_areas_public_read ON delivery_areas
    FOR SELECT USING (true);

CREATE POLICY categories_public_read ON categories
    FOR SELECT USING (true);

CREATE POLICY products_public_read ON products
    FOR SELECT USING (status = 'ACTIVE');

CREATE POLICY product_images_public_read ON product_images
    FOR SELECT USING (true);

CREATE POLICY product_variants_public_read ON product_variants
    FOR SELECT USING (true);

CREATE POLICY reviews_public_read ON reviews
    FOR SELECT USING (true);

-- A visitor can join a waitlist for a sold-out product without an account.
-- waitlists has no customer_id, so a signed-in visitor cannot be tied to their
-- own rows; reads stay closed to the client and the API handles those.
CREATE POLICY waitlists_public_insert ON waitlists
    FOR INSERT WITH CHECK (email IS NOT NULL OR phone IS NOT NULL);

-- Customer-owned data -------------------------------------------------------

CREATE POLICY customers_own_read ON customers
    FOR SELECT USING (id = AUTH.UID());

CREATE POLICY customers_own_update ON customers
    FOR UPDATE USING (id = AUTH.UID()) WITH CHECK (id = AUTH.UID());

CREATE POLICY orders_own_read ON orders
    FOR SELECT USING (customer_id = AUTH.UID());

CREATE POLICY order_items_own_read ON order_items
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM orders o
            WHERE o.id = order_items.order_id AND o.customer_id = AUTH.UID()
        )
    );

CREATE POLICY wishlists_own_all ON customer_wishlists
    FOR ALL USING (customer_id = AUTH.UID()) WITH CHECK (customer_id = AUTH.UID());

CREATE POLICY reviews_own_insert ON reviews
    FOR INSERT WITH CHECK (customer_id = AUTH.UID());

CREATE POLICY reviews_own_update ON reviews
    FOR UPDATE USING (customer_id = AUTH.UID()) WITH CHECK (customer_id = AUTH.UID());

CREATE POLICY referrals_own_read ON referrals
    FOR SELECT USING (referrer_id = AUTH.UID() OR referred_id = AUTH.UID());

CREATE POLICY referral_earnings_own_read ON referral_earnings
    FOR SELECT USING (customer_id = AUTH.UID());

CREATE POLICY payment_transactions_own_read ON payment_transactions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM orders o
            WHERE o.id = payment_transactions.order_id AND o.customer_id = AUTH.UID()
        )
    );

CREATE POLICY notifications_own_all ON notifications
    FOR ALL USING (user_id = AUTH.UID()) WITH CHECK (user_id = AUTH.UID());

-- Admin ---------------------------------------------------------------------

CREATE POLICY admins_own_read ON admins
    FOR SELECT USING (id = AUTH.UID());

CREATE POLICY admins_all ON admins
    FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY customers_admin_all ON customers
    FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY delivery_areas_admin_all ON delivery_areas
    FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY settings_admin_all ON settings
    FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY categories_admin_all ON categories
    FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY products_admin_all ON products
    FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY product_images_admin_all ON product_images
    FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY product_variants_admin_all ON product_variants
    FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY orders_admin_all ON orders
    FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY order_items_admin_all ON order_items
    FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY reviews_admin_all ON reviews
    FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY customer_wishlists_admin_all ON customer_wishlists
    FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY vouchers_admin_all ON vouchers
    FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY referrals_admin_all ON referrals
    FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY referral_earnings_admin_all ON referral_earnings
    FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY payment_transactions_admin_all ON payment_transactions
    FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY waitlists_admin_all ON waitlists
    FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY notifications_admin_all ON notifications
    FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());
