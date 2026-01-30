import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Supabase env vars missing. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    storage: localStorage,
  },
});

export type Profile = {
  id: string;
  full_name: string;
  university: string;
  linkedin_url: string | null;
  address: string | null;
  bio: string | null;
  interests: string[] | null;
  skills: string[] | null;
  is_online: boolean;
  last_active: string;
  created_at: string;
  updated_at: string;
  location: string | null;
  profile_image_url: string | null;
};
