-- Create enum for target hall
CREATE TYPE public.announcement_target AS ENUM ('all', 'Opoku Ware Hall', 'Autonomy Hall', 'Atwima Hall');

-- Announcements table
CREATE TABLE public.announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  target_hall public.announcement_target NOT NULL DEFAULT 'all',
  created_by UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;

-- Admins full management
CREATE POLICY "Admins manage announcements"
ON public.announcements
FOR ALL
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Students/authenticated users view announcements relevant to them
-- (all-hall announcements, OR target hall matches one they've booked)
CREATE POLICY "Students view relevant announcements"
ON public.announcements
FOR SELECT
TO authenticated
USING (
  target_hall = 'all'
  OR public.has_role(auth.uid(), 'admin')
  OR EXISTS (
    SELECT 1 FROM public.bookings b
    WHERE b.student_id = auth.uid()
      AND b.hall_name = announcements.target_hall::text
  )
);

CREATE INDEX idx_announcements_created_at ON public.announcements (created_at DESC);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.announcements;
ALTER TABLE public.announcements REPLICA IDENTITY FULL;