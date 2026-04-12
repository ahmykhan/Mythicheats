
-- Fix notifications: restrict write operations to admin only
DROP POLICY IF EXISTS "Anyone can insert notifications" ON public.notifications;
DROP POLICY IF EXISTS "Anyone can update notifications" ON public.notifications;
DROP POLICY IF EXISTS "Anyone can delete notifications" ON public.notifications;

CREATE POLICY "Admins can insert notifications" ON public.notifications
  FOR INSERT TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update notifications" ON public.notifications
  FOR UPDATE TO authenticated
  USING (public.is_admin());

CREATE POLICY "Admins can delete notifications" ON public.notifications
  FOR DELETE TO authenticated
  USING (public.is_admin());

-- Fix chat_messages: restrict SELECT to room members or global rooms
DROP POLICY IF EXISTS "Anyone can read chat messages" ON public.chat_messages;

CREATE POLICY "Room members can read messages" ON public.chat_messages
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.chat_rooms
      WHERE chat_rooms.id = chat_messages.room_id
        AND chat_rooms.type = 'global'
    )
    OR
    EXISTS (
      SELECT 1 FROM public.room_participants
      WHERE room_participants.room_id = chat_messages.room_id
        AND room_participants.user_id = auth.uid()
    )
  );
