
-- Create usernames table to store unique usernames
CREATE TABLE public.usernames (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  username TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT username_length CHECK (char_length(username) >= 3 AND char_length(username) <= 30),
  CONSTRAINT username_format CHECK (username ~ '^[a-zA-Z0-9_]+$')
);

-- Create chat messages table
CREATE TABLE public.chat_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  username TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create google_sheets_data table to cache Google Sheets data
CREATE TABLE public.google_sheets_data (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN ('section', 'folder', 'file')),
  title TEXT NOT NULL,
  link TEXT,
  parent_section TEXT,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.usernames ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.google_sheets_data ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for usernames
CREATE POLICY "Users can view all usernames" ON public.usernames FOR SELECT USING (true);
CREATE POLICY "Users can insert their own username" ON public.usernames FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own username" ON public.usernames FOR UPDATE USING (auth.uid() = user_id);

-- Create RLS policies for chat messages
CREATE POLICY "Everyone can view chat messages" ON public.chat_messages FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert chat messages" ON public.chat_messages FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for google sheets data (read-only for users)
CREATE POLICY "Everyone can view google sheets data" ON public.google_sheets_data FOR SELECT USING (true);
CREATE POLICY "Only admin can modify google sheets data" ON public.google_sheets_data FOR ALL USING (
  EXISTS (
    SELECT 1 FROM auth.users 
    WHERE auth.users.id = auth.uid() 
    AND auth.users.email = 'furyboy4592@gmail.com'
  )
);

-- Enable realtime for chat messages
ALTER TABLE public.chat_messages REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages;

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_google_sheets_data_updated_at 
  BEFORE UPDATE ON public.google_sheets_data 
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
