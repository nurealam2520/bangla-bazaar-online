
-- Create blog_posts table
CREATE TABLE public.blog_posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  excerpt TEXT NOT NULL DEFAULT '',
  content TEXT NOT NULL DEFAULT '',
  cover_image TEXT NOT NULL DEFAULT '',
  author_id UUID NOT NULL,
  is_published BOOLEAN NOT NULL DEFAULT false,
  published_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

-- Anyone can read published posts
CREATE POLICY "Anyone can view published posts"
ON public.blog_posts FOR SELECT
USING (is_published = true);

-- Admins full access
CREATE POLICY "Admins can manage all posts"
ON public.blog_posts FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Blog managers can view all posts (including drafts)
CREATE POLICY "Blog managers can view all posts"
ON public.blog_posts FOR SELECT
USING (public.has_role(auth.uid(), 'blog_manager'));

-- Blog managers can insert posts
CREATE POLICY "Blog managers can insert posts"
ON public.blog_posts FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'blog_manager') AND auth.uid() = author_id);

-- Blog managers can update own posts
CREATE POLICY "Blog managers can update own posts"
ON public.blog_posts FOR UPDATE
USING (public.has_role(auth.uid(), 'blog_manager') AND auth.uid() = author_id);

-- Blog managers can delete own posts
CREATE POLICY "Blog managers can delete own posts"
ON public.blog_posts FOR DELETE
USING (public.has_role(auth.uid(), 'blog_manager') AND auth.uid() = author_id);

-- Updated_at trigger
CREATE TRIGGER update_blog_posts_updated_at
BEFORE UPDATE ON public.blog_posts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
