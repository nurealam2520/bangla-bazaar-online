
-- Add weight to products
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS weight numeric DEFAULT 0;

-- Shipping zones table
CREATE TABLE public.shipping_zones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  countries text[] NOT NULL DEFAULT '{}',
  flat_rate numeric DEFAULT 0,
  free_shipping_threshold numeric DEFAULT 0,
  per_kg_rate numeric DEFAULT 0,
  estimated_days_min integer DEFAULT 10,
  estimated_days_max integer DEFAULT 20,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.shipping_zones ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view active shipping zones" ON public.shipping_zones FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can manage shipping zones" ON public.shipping_zones FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Payment settings table
CREATE TABLE public.payment_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider text NOT NULL UNIQUE,
  is_enabled boolean NOT NULL DEFAULT false,
  config jsonb DEFAULT '{}',
  min_order numeric DEFAULT 0,
  max_order numeric DEFAULT 0,
  allowed_countries text[] DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.payment_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view enabled payment settings" ON public.payment_settings FOR SELECT USING (is_enabled = true);
CREATE POLICY "Admins can manage payment settings" ON public.payment_settings FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Reviews table
CREATE TABLE public.reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title text DEFAULT '',
  comment text DEFAULT '',
  is_verified boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view reviews" ON public.reviews FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create reviews" ON public.reviews FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own reviews" ON public.reviews FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage reviews" ON public.reviews FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Coupons table
CREATE TABLE public.coupons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  type text NOT NULL DEFAULT 'percentage',
  value numeric NOT NULL DEFAULT 0,
  min_order numeric DEFAULT 0,
  max_uses integer DEFAULT 0,
  used_count integer NOT NULL DEFAULT 0,
  expires_at timestamptz,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can manage coupons" ON public.coupons FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Anyone can view active coupons by code" ON public.coupons FOR SELECT USING (is_active = true);

-- Wishlists table
CREATE TABLE public.wishlists (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, product_id)
);
ALTER TABLE public.wishlists ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own wishlist" ON public.wishlists FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Insert default shipping zones
INSERT INTO public.shipping_zones (name, countries, flat_rate, free_shipping_threshold, per_kg_rate, estimated_days_min, estimated_days_max) VALUES
('United States', '{US}', 5.99, 50, 2.00, 10, 20),
('Canada', '{CA}', 7.99, 60, 2.50, 12, 22),
('Australia', '{AU}', 8.99, 65, 3.00, 12, 25),
('New Zealand', '{NZ}', 9.99, 70, 3.50, 14, 28);

-- Insert default payment settings
INSERT INTO public.payment_settings (provider, is_enabled, config, allowed_countries) VALUES
('stripe', false, '{"description": "Credit/Debit Cards via Stripe"}', '{US,CA,AU,NZ}'),
('paypal', false, '{"description": "PayPal Checkout"}', '{US,CA,AU,NZ}'),
('afterpay', false, '{"description": "Buy Now, Pay Later"}', '{AU,NZ,US}'),
('klarna', false, '{"description": "Buy Now, Pay Later"}', '{US,CA}'),
('cod', false, '{"description": "Cash on Delivery"}', '{US}');
