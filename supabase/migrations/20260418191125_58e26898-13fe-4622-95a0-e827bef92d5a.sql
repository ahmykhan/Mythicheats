
-- Update status check to allow new statuses
ALTER TABLE public.lost_found_items DROP CONSTRAINT IF EXISTS lost_found_items_status_check;
ALTER TABLE public.lost_found_items ADD CONSTRAINT lost_found_items_status_check
  CHECK (status = ANY (ARRAY['open'::text, 'resolved'::text, 'at_admin_desk'::text, 'claim_pending'::text]));

-- Add reference_id column for drop-off tracking
ALTER TABLE public.lost_found_items ADD COLUMN IF NOT EXISTS reference_id TEXT;
ALTER TABLE public.lost_found_items ADD COLUMN IF NOT EXISTS dropped_by UUID;

-- Claims table
CREATE TABLE IF NOT EXISTS public.lost_found_claims (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id UUID NOT NULL REFERENCES public.lost_found_items(id) ON DELETE CASCADE,
  claimer_id UUID NOT NULL,
  proof_message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.lost_found_claims ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can create their own claims" ON public.lost_found_claims
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = claimer_id);

CREATE POLICY "Claimer and item owner can read claims" ON public.lost_found_claims
  FOR SELECT TO authenticated USING (
    auth.uid() = claimer_id
    OR EXISTS (SELECT 1 FROM public.lost_found_items i WHERE i.id = item_id AND i.user_id = auth.uid())
  );

CREATE POLICY "Item owner can update claim status" ON public.lost_found_claims
  FOR UPDATE TO authenticated USING (
    EXISTS (SELECT 1 FROM public.lost_found_items i WHERE i.id = item_id AND i.user_id = auth.uid())
  );

-- Per-user in-app notifications
CREATE TABLE IF NOT EXISTS public.user_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  link TEXT,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.user_notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own notifications" ON public.user_notifications
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Authenticated users can create notifications" ON public.user_notifications
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Users can update own notifications" ON public.user_notifications
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own notifications" ON public.user_notifications
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_user_notifications_user_id ON public.user_notifications(user_id, created_at DESC);
