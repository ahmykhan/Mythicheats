-- Allow room admins (and group creators) to insert other participants
CREATE OR REPLACE FUNCTION public.is_room_admin(_user_id uuid, _room_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.room_participants
    WHERE room_id = _room_id AND user_id = _user_id AND role = 'admin'
  ) OR EXISTS (
    SELECT 1 FROM public.chat_rooms
    WHERE id = _room_id AND created_by = _user_id
  )
$$;

DROP POLICY IF EXISTS "Users can join rooms" ON public.room_participants;

CREATE POLICY "Users can join rooms"
ON public.room_participants
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = user_id
  OR public.is_room_admin(auth.uid(), room_id)
  OR EXISTS (
    SELECT 1 FROM public.chat_rooms
    WHERE chat_rooms.id = room_participants.room_id
      AND chat_rooms.created_by = auth.uid()
      AND chat_rooms.type = 'dm'
  )
);