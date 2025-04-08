
import { supabase } from "@/lib/supabase";
import { Profile } from "@/types/auth.types";

export const authService = {
  /**
   * Sign in with email and password
   */
  signIn: async (email: string, password: string) => {
    console.log('Auth service: signing in user', email);
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
    console.log('Auth service: signing up new user', data.email);
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
    console.log('Auth service: signing out user');
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  /**
   * Fetch the current session
   */
  getSession: async () => {
    console.log('Auth service: getting current session');
    return await supabase.auth.getSession();
  },

  /**
   * Fetch the user profile by ID
   */
  fetchProfile: async (userId: string): Promise<Profile | null> => {
    console.log('Auth service: fetching profile for user', userId);
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
      
      console.log('Auth service: profile fetched successfully', data);
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
    console.log('Auth service: updating profile for user', userId);
    const { error } = await supabase
      .from('profiles')
      .update(profileData)
      .eq('id', userId);
    
    if (error) throw error;
  },
};
