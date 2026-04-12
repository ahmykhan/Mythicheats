
-- Create admin check function
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM auth.users
    WHERE id = auth.uid()
    AND email = 'furyboy4592@gmail.com'
  )
$$;

-- Drop old permissive policies
DROP POLICY IF EXISTS "Anyone can insert courses" ON public.courses;
DROP POLICY IF EXISTS "Anyone can update courses" ON public.courses;
DROP POLICY IF EXISTS "Anyone can delete courses" ON public.courses;

-- Create admin-only policies
CREATE POLICY "Admins can insert courses" ON public.courses
  FOR INSERT TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update courses" ON public.courses
  FOR UPDATE TO authenticated
  USING (public.is_admin());

CREATE POLICY "Admins can delete courses" ON public.courses
  FOR DELETE TO authenticated
  USING (public.is_admin());
