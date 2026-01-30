-- Add structured profile sections for education, experience, skills, and projects
BEGIN;

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS education JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS experience JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS skills JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS projects JSONB DEFAULT '[]'::jsonb;

COMMENT ON COLUMN public.profiles.education IS 'Array of education entries stored as JSONB';
COMMENT ON COLUMN public.profiles.experience IS 'Array of experience entries stored as JSONB';
COMMENT ON COLUMN public.profiles.skills IS 'Array of skills stored as JSONB';
COMMENT ON COLUMN public.profiles.projects IS 'Array of project entries stored as JSONB';

COMMIT;
