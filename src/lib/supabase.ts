import { createClient } from '@supabase/supabase-js';

const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL || "https://zpiihnwkiapprhnqjzkm.supabase.co";
const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpwaWlobndraWFwcHJobnFqemttIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk0MDUxNzAsImV4cCI6MjA4NDk4MTE3MH0.pOunWkc7PVZ--qQRd96viEtwnHydGk3pm5D_VGMAz-I";

// Single Supabase client instance with explicit auth configuration
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    storage: localStorage,
  }
});

// Export types for profiles and other tables
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

// Other types can be exported as needed
