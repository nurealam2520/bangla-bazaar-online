
CREATE TABLE public.contact_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

-- Admins can view and manage all messages
CREATE POLICY "Admins can manage contact messages"
  ON public.contact_messages FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- Anyone can insert (submit contact form)
CREATE POLICY "Anyone can submit contact form"
  ON public.contact_messages FOR INSERT
  WITH CHECK (true);
