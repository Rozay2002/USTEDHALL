CREATE TABLE public.programs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.programs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone authenticated views programs"
ON public.programs FOR SELECT TO authenticated USING (true);

CREATE POLICY "Anon views programs"
ON public.programs FOR SELECT TO anon USING (true);

CREATE POLICY "Admins manage programs"
ON public.programs FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE INDEX idx_programs_name_lower ON public.programs (lower(name));

INSERT INTO public.programs (name) VALUES
  ('Computer Engineering'),('Electrical Engineering'),('Mechanical Engineering'),
  ('Civil Engineering'),('Biomedical Engineering'),('Telecommunications Engineering'),
  ('Computer Science'),('Information Technology'),('Software Engineering'),
  ('Cyber Security'),('Data Science'),('Artificial Intelligence'),
  ('Business Administration'),('Accounting'),('Finance'),('Marketing'),
  ('Human Resource Management'),('Entrepreneurship'),
  ('Economics'),('Political Science'),('Sociology'),('Psychology'),('Geography'),
  ('Nursing'),('Medicine'),('Pharmacy'),('Public Health'),('Biochemistry'),('Microbiology'),
  ('English'),('History'),('Philosophy'),('Linguistics'),('Communication Studies')
ON CONFLICT (name) DO NOTHING;