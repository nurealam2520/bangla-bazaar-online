
-- Add dropshipping supplier fields to products
ALTER TABLE public.products 
  ADD COLUMN IF NOT EXISTS supplier_name text,
  ADD COLUMN IF NOT EXISTS supplier_url text,
  ADD COLUMN IF NOT EXISTS supplier_price numeric DEFAULT 0;
