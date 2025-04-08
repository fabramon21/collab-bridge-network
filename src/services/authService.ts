
import { supabase } from "@/lib/supabase";
import { Profile } from "@/types/auth.types";

export const authService = {
  /**
   * Sign in with email and password
   */
  signIn: async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  },

  /**
   * Sign up with email and password
   */
  signUp: async (data: {
    email: string;
    password: string;
    full_name: string;
    university: string;
    linkedin_url?: string;
  }) => {
    const { error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          full_name: data.full_name,
          university: data.university,
          linkedin_url: data.linkedin_url,
        },
      },
    });
    
    if (error) throw error;
  },

  /**
   * Sign out the current user
   */
  signOut: async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  /**
   * Fetch the current session
   */
  getSession: async () => {
    return await supabase.auth.getSession();
  },

  /**
   * Fetch the user profile by ID
   */
  fetchProfile: async (userId: string): Promise<Profile | null> => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        return null;
      }
      
      return data as Profile;
    } catch (error) {
      console.error('Exception fetching profile:', error);
      return null;
    }
  },

  /**
   * Update user profile
   */
  updateProfile: async (userId: string, profileData: Partial<Profile>) => {
    const { error } = await supabase
      .from('profiles')
      .update(profileData)
      .eq('id', userId);
    
    if (error) throw error;
  },
};
