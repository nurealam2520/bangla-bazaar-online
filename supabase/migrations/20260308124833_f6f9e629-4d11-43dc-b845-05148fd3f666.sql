
CREATE TABLE public.testimonials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  user_name text NOT NULL DEFAULT '',
  user_avatar text DEFAULT '',
  rating integer NOT NULL DEFAULT 5,
  comment text NOT NULL DEFAULT '',
  pet_info text DEFAULT '',
  location text DEFAULT '',
  is_approved boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;

-- Anyone can view approved testimonials
CREATE POLICY "Anyone can view approved testimonials" ON public.testimonials
  FOR SELECT USING (is_approved = true);

-- Admins can manage all testimonials
CREATE POLICY "Admins can manage all testimonials" ON public.testimonials
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Users can insert their own testimonials
CREATE POLICY "Users can insert own testimonials" ON public.testimonials
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Users can view their own testimonials (even unapproved)
CREATE POLICY "Users can view own testimonials" ON public.testimonials
  FOR SELECT USING (auth.uid() = user_id);
