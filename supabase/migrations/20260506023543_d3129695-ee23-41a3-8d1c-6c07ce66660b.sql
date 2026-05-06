
CREATE TYPE public.complaint_status AS ENUM ('pending', 'in_progress', 'resolved');

CREATE TABLE public.complaints (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT,
  status public.complaint_status NOT NULL DEFAULT 'pending',
  hall_name TEXT,
  block TEXT,
  room_number INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.complaints ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students create own complaints" ON public.complaints
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Students view own complaints" ON public.complaints
  FOR SELECT TO authenticated USING (auth.uid() = student_id);

CREATE POLICY "Admins view all complaints" ON public.complaints
  FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins update complaints" ON public.complaints
  FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins delete complaints" ON public.complaints
  FOR DELETE USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_complaints_updated_at
  BEFORE UPDATE ON public.complaints
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
