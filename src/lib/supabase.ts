
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

// Single Supabase client instance with explicit auth configuration
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    storage: localStorage,
  }
});

// Types for our database tables
export type Profile = {
  id: string;
  full_name: string;
  email: string;
  school: string;
  linkedin: string;
  address: string;
  created_at: string;
  updated_at: string;
};

export type Message = {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  created_at: string;
  read_at: string | null;
};

export type Connection = {
  id: string;
  user_id: string;
  connected_user_id: string;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
  updated_at: string;
};

export type Event = {
  id: string;
  creator_id: string;
  title: string;
  description: string | null;
  event_type: 'social' | 'roommate' | 'professional';
  location: string | null;
  start_time: string;
  end_time: string;
  max_participants: number | null;
  created_at: string;
  updated_at: string;
};

export type EventParticipant = {
  id: string;
  event_id: string;
  user_id: string;
  status: 'interested' | 'attending' | 'not_attending';
  created_at: string;
};
