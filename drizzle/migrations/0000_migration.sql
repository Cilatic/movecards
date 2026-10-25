CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL DEFAULT '',
  mode text NOT NULL DEFAULT 'me' CHECK (mode IN ('me','helping')),
  text_size text NOT NULL DEFAULT 'normal' CHECK (text_size IN ('normal','large','largest')),
  high_contrast boolean NOT NULL DEFAULT false,
  voice_speed text NOT NULL DEFAULT 'normal' CHECK (voice_speed IN ('slow','normal')),
  video_level text NOT NULL DEFAULT 'standard' CHECK (video_level IN ('easier','standard')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own profile select" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "own profile insert" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "own profile update" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);

CREATE TABLE public.completions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  exercise_id text NOT NULL,
  version text NOT NULL CHECK (version IN ('easier','standard','harder')),
  mode text NOT NULL CHECK (mode IN ('me','helping')),
  done_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX completions_user_idx ON public.completions(user_id, done_at DESC);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.completions TO authenticated;
GRANT ALL ON public.completions TO service_role;
ALTER TABLE public.completions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own completions select" ON public.completions FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "own completions insert" ON public.completions FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own completions update" ON public.completions FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "own completions delete" ON public.completions FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, name, mode)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.raw_user_meta_data->>'full_name', ''),
    CASE WHEN NEW.raw_user_meta_data->>'mode' = 'helping' THEN 'helping' ELSE 'me' END
  ) ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END; $$;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();