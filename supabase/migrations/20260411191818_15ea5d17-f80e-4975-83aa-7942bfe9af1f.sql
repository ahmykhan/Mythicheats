
-- Add role column to room_participants
ALTER TABLE public.room_participants 
ADD COLUMN role text NOT NULL DEFAULT 'member' 
CONSTRAINT room_participants_role_check CHECK (role IN ('admin', 'member'));

-- Add section and enrolled_courses to usernames table
ALTER TABLE public.usernames
ADD COLUMN section text,
ADD COLUMN enrolled_courses text[] DEFAULT '{}';

-- Allow all authenticated users to see all participants (for member lists)
CREATE POLICY "Anyone can read room participants"
ON public.room_participants
FOR SELECT
TO authenticated
USING (true);

-- Drop the old restrictive select policy
DROP POLICY IF EXISTS "Users can see their own participations" ON public.room_participants;

-- Allow admins to remove members (delete others' participation)
CREATE POLICY "Admins can kick members"
ON public.room_participants
FOR DELETE
TO authenticated
USING (
  auth.uid() = user_id 
  OR EXISTS (
    SELECT 1 FROM public.room_participants rp 
    WHERE rp.room_id = room_participants.room_id 
    AND rp.user_id = auth.uid() 
    AND rp.role = 'admin'
  )
);

-- Drop old delete policy
DROP POLICY IF EXISTS "Users can leave rooms" ON public.room_participants;
