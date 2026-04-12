
-- Create a security definer function to check room membership (avoids recursion)
CREATE OR REPLACE FUNCTION public.is_room_member(_user_id uuid, _room_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.room_participants
    WHERE user_id = _user_id AND room_id = _room_id
  )
$$;

-- Fix room_participants: restrict SELECT to rooms the user belongs to
DROP POLICY IF EXISTS "Anyone can read room participants" ON public.room_participants;

CREATE POLICY "Users can read participants of their rooms" ON public.room_participants
  FOR SELECT TO authenticated
  USING (
    public.is_room_member(auth.uid(), room_id)
  );
