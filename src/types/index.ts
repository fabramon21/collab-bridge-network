import type { Database } from "@/integrations/supabase/types";

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type Connection = Database["public"]["Tables"]["connections"]["Row"];
export type Message = Database["public"]["Tables"]["messages"]["Row"];
export type Event = Database["public"]["Tables"]["internships"]["Row"]; 