
-- Create products table
CREATE TABLE public.products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  price numeric NOT NULL,
  original_price numeric,
  rating numeric NOT NULL DEFAULT 4.5,
  reviews integer NOT NULL DEFAULT 0,
  image text NOT NULL DEFAULT '',
  badge text,
  category text NOT NULL CHECK (category IN ('dogs', 'cats')),
  subcategory text NOT NULL DEFAULT '',
  description text NOT NULL DEFAULT '',
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Anyone can view active products
CREATE POLICY "Anyone can view active products"
  ON public.products FOR SELECT
  USING (is_active = true);

-- Admins can view all products (including inactive)
CREATE POLICY "Admins can view all products"
  ON public.products FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

-- Admins can insert products
CREATE POLICY "Admins can insert products"
  ON public.products FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Admins can update products
CREATE POLICY "Admins can update products"
  ON public.products FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));

-- Admins can delete products
CREATE POLICY "Admins can delete products"
  ON public.products FOR DELETE
  USING (public.has_role(auth.uid(), 'admin'));

-- Trigger for updated_at
CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Seed with existing hardcoded products
INSERT INTO public.products (name, price, original_price, rating, reviews, image, badge, category, subcategory, description) VALUES
('Premium Dog Food — Chicken & Rice', 34.99, 42.99, 4.8, 124, 'https://images.unsplash.com/photo-1589924691995-400dc9ecc119?w=400&h=400&fit=crop', 'Best Seller', 'dogs', 'Food', 'High-quality chicken and rice formula for adult dogs. Rich in protein and essential nutrients.'),
('Leather Dog Collar — Gold Buckle', 24.99, NULL, 4.9, 89, 'https://images.unsplash.com/photo-1599839575945-a9e5af0c3fa5?w=400&h=400&fit=crop', 'New', 'dogs', 'Accessories', 'Handcrafted genuine leather collar with premium gold-tone buckle. Adjustable and durable.'),
('Dog Bed — Memory Foam Orthopedic', 89.99, 109.99, 4.9, 142, 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=400&h=400&fit=crop', 'Best Seller', 'dogs', 'Beds', 'Orthopedic memory foam dog bed for ultimate comfort. Machine washable cover.'),
('Interactive Dog Ball Launcher', 44.99, 54.99, 4.6, 67, 'https://images.unsplash.com/photo-1535930749574-1399327ce78f?w=400&h=400&fit=crop', 'Sale', 'dogs', 'Toys', 'Automatic ball launcher for endless fetch fun. Adjustable distance settings.'),
('Dog Grooming Kit — Complete Set', 39.99, NULL, 4.7, 93, 'https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?w=400&h=400&fit=crop', NULL, 'dogs', 'Grooming', 'Professional grooming kit with brushes, nail clippers, and shampoo. Perfect for home grooming.'),
('Retractable Dog Leash — Heavy Duty', 19.99, 27.99, 4.5, 156, 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400&h=400&fit=crop', 'Popular', 'dogs', 'Accessories', '16ft retractable leash with ergonomic handle. Suitable for dogs up to 110 lbs.'),
('Cat Scratching Post — Deluxe Tower', 59.99, 74.99, 4.7, 56, 'https://images.unsplash.com/photo-1545249390-6bdfa286032f?w=400&h=400&fit=crop', 'Sale', 'cats', 'Furniture', 'Multi-level cat tower with sisal scratching posts, plush platforms, and dangling toys.'),
('Interactive Cat Feather Toy Set', 14.99, NULL, 4.6, 78, 'https://images.unsplash.com/photo-1526336024174-e58f5cdd8e13?w=400&h=400&fit=crop', NULL, 'cats', 'Toys', 'Set of 5 feather wand toys with interchangeable attachments. Hours of fun for your cat.'),
('Premium Cat Food — Salmon & Tuna', 29.99, 36.99, 4.8, 97, 'https://images.unsplash.com/photo-1574158622682-e40e69881006?w=400&h=400&fit=crop', 'Popular', 'cats', 'Food', 'Grain-free salmon and tuna formula with real fish as the first ingredient.'),
('Self-Cleaning Cat Litter Box', 149.99, 189.99, 4.5, 203, 'https://images.unsplash.com/photo-1511044568932-338cba0ad803?w=400&h=400&fit=crop', 'Best Seller', 'cats', 'Litter', 'Automatic self-cleaning litter box with odor control. Quiet operation, easy to maintain.'),
('Cozy Cat Bed — Donut Shape', 34.99, NULL, 4.8, 112, 'https://images.unsplash.com/photo-1495360010541-f48722b34f7d?w=400&h=400&fit=crop', 'New', 'cats', 'Beds', 'Ultra-soft donut-shaped cat bed with raised edges for security. Machine washable.'),
('Cat Grooming Brush — Self-Cleaning', 12.99, 16.99, 4.7, 88, 'https://images.unsplash.com/photo-1573865526739-10659fec78a5?w=400&h=400&fit=crop', NULL, 'cats', 'Grooming', 'One-click self-cleaning slicker brush. Removes loose fur and reduces shedding by 90%.');
