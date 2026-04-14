
-- Create lost_found_items table
CREATE TABLE public.lost_found_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  item_type TEXT NOT NULL CHECK (item_type IN ('lost', 'found')),
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  image_url TEXT,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'resolved')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.lost_found_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read items" ON public.lost_found_items
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can insert own items" ON public.lost_found_items
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own items" ON public.lost_found_items
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- Storage bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('lost-and-found', 'lost-and-found', true);

CREATE POLICY "Anyone can view lost-and-found images" ON storage.objects
  FOR SELECT USING (bucket_id = 'lost-and-found');

CREATE POLICY "Authenticated users can upload lost-and-found images" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (bucket_id = 'lost-and-found' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update own lost-and-found images" ON storage.objects
  FOR UPDATE TO authenticated USING (bucket_id = 'lost-and-found' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete own lost-and-found images" ON storage.objects
  FOR DELETE TO authenticated USING (bucket_id = 'lost-and-found' AND auth.uid()::text = (storage.foldername(name))[1]);
