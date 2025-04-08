import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "https://wikbqrasvmggxbhlwazz.supabase.co";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indpa2JxcmFzdm1nZ3hiaGx3YXp6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzgwMDMyOTksImV4cCI6MjA1MzU3OTI5OX0.L0lGB_dTO8ANKfUNtWI8Yyip6VYxOTnfldidDkP0-M8";

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
