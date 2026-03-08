
-- Add fulfillment/tracking fields to orders table
ALTER TABLE public.orders 
  ADD COLUMN IF NOT EXISTS tracking_number text,
  ADD COLUMN IF NOT EXISTS tracking_url text,
  ADD COLUMN IF NOT EXISTS supplier_order_id text,
  ADD COLUMN IF NOT EXISTS fulfillment_status text NOT NULL DEFAULT 'unfulfilled';

-- Add comment for clarity
COMMENT ON COLUMN public.orders.fulfillment_status IS 'unfulfilled, ordered_from_supplier, shipped, delivered';
