import { createClient } from '@supabase/supabase-js';

// @ts-ignore - Supabase secrets are injected at runtime
const supabaseUrl = window.env?.SUPABASE_URL;
// @ts-ignore - Supabase secrets are injected at runtime
const supabaseKey = window.env?.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase configuration. Please make sure you have set up your Supabase project correctly.');
}

export const supabase = createClient(supabaseUrl, supabaseKey);