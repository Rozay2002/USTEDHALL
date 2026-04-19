CREATE OR REPLACE FUNCTION public.get_email_by_index(_index_number text)
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT email FROM public.profiles WHERE index_number = _index_number LIMIT 1;
$$;

GRANT EXECUTE ON FUNCTION public.get_email_by_index(text) TO anon, authenticated;