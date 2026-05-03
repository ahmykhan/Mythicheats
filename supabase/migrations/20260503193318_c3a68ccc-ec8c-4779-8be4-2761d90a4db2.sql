
-- 1. Roles system
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

CREATE POLICY "Users can read own roles"
  ON public.user_roles FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can read all roles"
  ON public.user_roles FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage roles"
  ON public.user_roles FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Seed existing admin
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::public.app_role FROM auth.users WHERE email = 'furyboy4592@gmail.com'
ON CONFLICT DO NOTHING;

-- 2. Update is_admin() to use roles
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT public.has_role(auth.uid(), 'admin')
$$;

-- 3. Restrict usernames table SELECT to own row + create safe public view
DROP POLICY IF EXISTS "Users can read all usernames" ON public.usernames;

CREATE POLICY "Users can read own username row"
  ON public.usernames FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE OR REPLACE VIEW public.public_usernames
WITH (security_invoker = true) AS
SELECT user_id, username FROM public.usernames;

GRANT SELECT ON public.public_usernames TO authenticated, anon;

-- Allow public_usernames view to bypass the strict per-row policy by
-- creating a permissive read on (user_id, username) only via a SECURITY DEFINER function used by RPC search.
-- The view uses security_invoker so it still respects RLS; we add a permissive
-- SELECT policy that exposes ONLY safe columns through the view by allowing all rows
-- but client code must select via the view (no sensitive cols are projected).
-- To make the view actually return rows for other users, add a column-aware approach:
DROP POLICY IF EXISTS "Users can read own username row" ON public.usernames;

CREATE POLICY "Authenticated can read usernames base"
  ON public.usernames FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- For lookups of others' display names, expose via SECURITY DEFINER function
CREATE OR REPLACE FUNCTION public.get_usernames_by_ids(_user_ids uuid[])
RETURNS TABLE(user_id uuid, username text)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT user_id, username FROM public.usernames WHERE user_id = ANY(_user_ids)
$$;

CREATE OR REPLACE FUNCTION public.search_usernames(search_query text)
RETURNS TABLE(user_id uuid, username text)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT user_id, username FROM public.usernames
  WHERE username ILIKE '%' || search_query || '%'
  LIMIT 20
$$;

-- 4. Realtime channel authorization
ALTER TABLE realtime.messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can subscribe to allowed chat rooms"
  ON realtime.messages FOR SELECT TO authenticated
  USING (
    -- room-changes channel: open to authenticated users
    realtime.topic() = 'room-changes'
    OR
    -- chat-room-<uuid> channel: must be a member, or room is global
    (
      realtime.topic() LIKE 'chat-room-%'
      AND (
        EXISTS (
          SELECT 1 FROM public.chat_rooms
          WHERE id::text = substring(realtime.topic() from 'chat-room-(.+)')
            AND type = 'global'
        )
        OR EXISTS (
          SELECT 1 FROM public.room_participants
          WHERE room_id::text = substring(realtime.topic() from 'chat-room-(.+)')
            AND user_id = auth.uid()
        )
      )
    )
  );
