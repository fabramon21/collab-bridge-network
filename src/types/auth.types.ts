
import { User } from '@supabase/supabase-js';

export type Profile = {
  id: string;
  full_name: string;
  university: string;
  linkedin_url: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
  address: string;
  bio: string;
  interests: string[];
  is_online: boolean;
  last_active: string;
  location: string;
  profile_image_url: string;
  skills: string[];
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
