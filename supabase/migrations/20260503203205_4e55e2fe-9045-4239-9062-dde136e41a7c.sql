-- Create campus_master_data table for shared admin-uploaded timetable & datesheet
CREATE TABLE IF NOT EXISTS public.campus_master_data (
  key TEXT PRIMARY KEY,
  data JSONB NOT NULL DEFAULT '[]'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_by UUID
);

ALTER TABLE public.campus_master_data ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone authenticated can read campus_master_data"
  ON public.campus_master_data FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can insert campus_master_data"
  ON public.campus_master_data FOR INSERT TO authenticated WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update campus_master_data"
  ON public.campus_master_data FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "Admins can delete campus_master_data"
  ON public.campus_master_data FOR DELETE TO authenticated USING (public.is_admin());