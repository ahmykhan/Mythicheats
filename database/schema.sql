-- =============================================
-- MythicHeats Database Schema
-- Generated for University Submission
-- =============================================

-- Table: usernames
CREATE TABLE public.usernames (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    username TEXT NOT NULL,
    section TEXT,
    enrolled_courses TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table: chat_rooms
CREATE TABLE public.chat_rooms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'group' CHECK (type IN ('global', 'group', 'dm')),
    join_code TEXT UNIQUE,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table: room_participants
CREATE TABLE public.room_participants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_id UUID NOT NULL REFERENCES public.chat_rooms(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'member')),
    joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(room_id, user_id)
);

-- Table: chat_messages
CREATE TABLE public.chat_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    username TEXT NOT NULL,
    message TEXT NOT NULL,
    room_id UUID REFERENCES public.chat_rooms(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table: reports
CREATE TABLE public.reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    message_id UUID NOT NULL REFERENCES public.chat_messages(id) ON DELETE CASCADE,
    reporter_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    reason TEXT DEFAULT '',
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed')),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(message_id, reporter_id)
);

-- Table: courses
CREATE TABLE public.courses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT DEFAULT '',
    is_locked BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table: notifications
CREATE TABLE public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT DEFAULT '',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table: google_sheets_data
CREATE TABLE public.google_sheets_data (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sheet_id TEXT,
    data JSONB,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- =============================================
-- Row-Level Security (RLS) Policies
-- =============================================

-- usernames
ALTER TABLE public.usernames ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read all usernames" ON public.usernames FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can insert own username" ON public.usernames FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own username" ON public.usernames FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- chat_rooms
ALTER TABLE public.chat_rooms ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read chat rooms" ON public.chat_rooms FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can create rooms" ON public.chat_rooms FOR INSERT TO authenticated WITH CHECK (auth.uid() = created_by);

-- room_participants
ALTER TABLE public.room_participants ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can see their own participations" ON public.room_participants FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can join rooms" ON public.room_participants FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can leave rooms" ON public.room_participants FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- chat_messages
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read chat messages" ON public.chat_messages FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can insert own messages" ON public.chat_messages FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own messages" ON public.chat_messages FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- reports
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can report messages" ON public.reports FOR INSERT TO authenticated WITH CHECK (auth.uid() = reporter_id);
CREATE POLICY "Users can see their own reports" ON public.reports FOR SELECT TO authenticated USING (auth.uid() = reporter_id);

-- courses
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read courses" ON public.courses FOR SELECT TO authenticated USING (true);
CREATE POLICY "Anyone can insert courses" ON public.courses FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Anyone can update courses" ON public.courses FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Anyone can delete courses" ON public.courses FOR DELETE TO authenticated USING (true);

-- notifications
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read notifications" ON public.notifications FOR SELECT TO authenticated USING (true);
CREATE POLICY "Anyone can insert notifications" ON public.notifications FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Anyone can update notifications" ON public.notifications FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Anyone can delete notifications" ON public.notifications FOR DELETE TO authenticated USING (true);

-- google_sheets_data
ALTER TABLE public.google_sheets_data ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read sheets data" ON public.google_sheets_data FOR SELECT TO authenticated USING (true);

-- =============================================
-- Realtime
-- =============================================
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_rooms;
ALTER PUBLICATION supabase_realtime ADD TABLE public.room_participants;

-- Default data
INSERT INTO public.chat_rooms (name, type) VALUES ('Global Chat', 'global');
