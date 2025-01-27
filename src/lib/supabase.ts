import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://iqfbvgvvwxjvwqtlxvqm.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlxZmJ2Z3Z2d3hqdndxdGx4dnFtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDc4MjI5NzcsImV4cCI6MjAyMzM5ODk3N30.0I8dMKUMjhzTZQDVuqFOXDxP5Yw1RxHDfZHDVGkGQ8Y';

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase configuration. Please make sure you have set up your Supabase project correctly.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);