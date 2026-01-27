// This wrapper ensures the app uses a single Supabase client instance everywhere.
// The actual client (with auth/storage config) lives in src/lib/supabase.ts.
import { supabase as sharedSupabase } from "@/lib/supabase";
import type { Database } from "./types";

export const supabase = sharedSupabase;
export type { Database };
