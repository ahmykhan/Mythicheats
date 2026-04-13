
-- Create valid_sections table
CREATE TABLE public.valid_sections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.valid_sections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read sections" ON public.valid_sections FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can insert sections" ON public.valid_sections FOR INSERT TO authenticated WITH CHECK (public.is_admin());
CREATE POLICY "Admins can update sections" ON public.valid_sections FOR UPDATE TO authenticated USING (public.is_admin());
CREATE POLICY "Admins can delete sections" ON public.valid_sections FOR DELETE TO authenticated USING (public.is_admin());

-- Create valid_courses table
CREATE TABLE public.valid_courses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.valid_courses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read valid courses" ON public.valid_courses FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can insert valid courses" ON public.valid_courses FOR INSERT TO authenticated WITH CHECK (public.is_admin());
CREATE POLICY "Admins can update valid courses" ON public.valid_courses FOR UPDATE TO authenticated USING (public.is_admin());
CREATE POLICY "Admins can delete valid courses" ON public.valid_courses FOR DELETE TO authenticated USING (public.is_admin());

-- Add has_registered_courses to usernames
ALTER TABLE public.usernames ADD COLUMN has_registered_courses BOOLEAN NOT NULL DEFAULT false;

-- Update chat_rooms type check constraint to allow section and course types
ALTER TABLE public.chat_rooms DROP CONSTRAINT IF EXISTS chat_rooms_type_check;
ALTER TABLE public.chat_rooms ADD CONSTRAINT chat_rooms_type_check CHECK (type IN ('global', 'group', 'dm', 'section', 'course'));
