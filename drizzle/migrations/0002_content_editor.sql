CREATE TYPE public.app_role AS ENUM ('admin', 'user');
CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role public.app_role NOT NULL,
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role) $$;
CREATE POLICY "own roles select" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE TABLE public.content_entries (
  key text PRIMARY KEY,
  draft jsonb,
  published jsonb,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.content_entries TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.content_entries TO authenticated;
GRANT ALL ON public.content_entries TO service_role;
ALTER TABLE public.content_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "content public read" ON public.content_entries FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "content admin insert" ON public.content_entries FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "content admin update" ON public.content_entries FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "content admin delete" ON public.content_entries FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));