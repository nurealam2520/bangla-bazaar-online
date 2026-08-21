-- app_config access for admins (currently no policies -> unusable)
GRANT SELECT, INSERT, UPDATE, DELETE ON public.app_config TO authenticated;
GRANT ALL ON public.app_config TO service_role;
ALTER TABLE public.app_config ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins can manage app config" ON public.app_config;
CREATE POLICY "Admins can manage app config"
ON public.app_config FOR ALL TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Orders: shipping phone/state + CJ sync tracking
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS shipping_phone text,
  ADD COLUMN IF NOT EXISTS shipping_state text,
  ADD COLUMN IF NOT EXISTS cj_order_id text,
  ADD COLUMN IF NOT EXISTS cj_sync_status text NOT NULL DEFAULT 'not_synced',
  ADD COLUMN IF NOT EXISTS cj_error text,
  ADD COLUMN IF NOT EXISTS cj_synced_at timestamptz;

-- Products: CJ identifiers
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS cj_variant_id text,
  ADD COLUMN IF NOT EXISTS cj_sku text;

-- Order items: keep CJ identifiers at purchase time
ALTER TABLE public.order_items
  ADD COLUMN IF NOT EXISTS product_id uuid,
  ADD COLUMN IF NOT EXISTS cj_variant_id text,
  ADD COLUMN IF NOT EXISTS cj_sku text;