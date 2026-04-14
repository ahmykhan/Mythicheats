
-- 1. Search function that queries both usernames and auth emails
CREATE OR REPLACE FUNCTION public.search_users(search_query text)
RETURNS TABLE(user_id uuid, username text, email text)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT u.user_id, u.username, a.email::text
  FROM public.usernames u
  JOIN auth.users a ON a.id = u.user_id
  WHERE u.username ILIKE '%' || search_query || '%'
     OR a.email ILIKE '%' || search_query || '%'
  LIMIT 10;
$$;

-- 2. Fix room_participants INSERT policy to allow DM creators to add the other user
DROP POLICY IF EXISTS "Users can join rooms" ON public.room_participants;
CREATE POLICY "Users can join rooms"
  ON public.room_participants
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id
    OR EXISTS (
      SELECT 1 FROM public.chat_rooms
      WHERE id = room_id AND created_by = auth.uid() AND type = 'dm'
    )
  );
