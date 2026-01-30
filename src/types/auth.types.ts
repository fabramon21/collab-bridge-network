
import { User } from '@supabase/supabase-js';

export type ProfileEducation = {
  id: string;
  school: string;
  degree?: string | null;
  field?: string | null;
  location?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  graduationDate?: string | null;
  notes?: string | null;
};

export type ProfileExperience = {
  id: string;
  company: string;
  role: string;
  location?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  current?: boolean | null;
  description?: string | null;
};

export type ProfileProject = {
  id: string;
  name: string;
  description?: string | null;
  link?: string | null;
  technologies?: string[] | null;
};

export type Profile = {
  id: string;
  full_name: string | null;
  email: string | null;
  school: string | null;
  university: string | null;
  linkedin: string | null;
  linkedin_url: string | null;
  address: string | null;
  avatar_url: string | null;
  profile_image_url: string | null;
  location: string | null;
  bio: string | null;
  education: ProfileEducation[] | null;
  experience: ProfileExperience[] | null;
  skills: string[] | null;
  projects: ProfileProject[] | null;
  created_at: string;
  updated_at: string;
};

export type AuthContextType = {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (data: {
    email: string;
    password: string;
    full_name: string;
    university: string;
    linkedin_url?: string;
  }) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (profile: Partial<Profile>) => Promise<void>;
};
