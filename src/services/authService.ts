
import { supabase } from "@/lib/supabase";
import { Profile } from "@/types/auth.types";

const PROFILE_COLUMN_MAP: Record<string, string> = {
  full_name: "full_name",
  email: "email",
  school: "school",
  university: "school",
  linkedin: "linkedin",
  linkedin_url: "linkedin",
  address: "address",
};

type DatabaseProfile = {
  id: string;
  full_name: string | null;
  email: string | null;
  school: string | null;
  linkedin: string | null;
  address: string | null;
  created_at: string;
  updated_at: string;
  [key: string]: any;
};

const mapProfileFromDb = (data: DatabaseProfile): Profile => ({
  id: data.id,
  full_name: data.full_name ?? null,
  email: data.email ?? null,
  school: data.school ?? null,
  university: data.school ?? null,
  linkedin: data.linkedin ?? null,
  linkedin_url: data.linkedin ?? null,
  address: data.address ?? null,
  avatar_url: data.avatar_url ?? null,
  profile_image_url: data.profile_image_url ?? null,
  location: data.location ?? null,
  bio: data.bio ?? null,
  created_at: data.created_at,
  updated_at: data.updated_at,
});

const mapProfileToDb = (profileData: Partial<Profile>) => {
  const dbPayload: Record<string, string | null> = {};
  for (const [key, value] of Object.entries(profileData)) {
    if (value === undefined) continue;
    const column = PROFILE_COLUMN_MAP[key];
    if (!column) continue;
    const normalized = typeof value === 'string' ? value.trim() : value;
    const finalValue = normalized === '' || normalized === undefined ? null : normalized;
    dbPayload[column] = finalValue as string | null;
  }
  return dbPayload;
};

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
  // fetchProfile: async (userId: string): Promise<Profile | null> => {
  //   console.log('Auth service: fetching profile for user', userId);
  //   try {
  //     const { data, error } = await supabase
  //       .from('profiles')
  //       .select('*')
  //       .eq('id', userId)
  //       .single();

  //     if (error) {
  //       console.error('Error fetching profile:', error);
  //       return null;
  //     }
      
  //     console.log('Auth service: profile fetched successfully', data);
  //     return data as Profile;
  //   } catch (error) {
  //     console.error('Exception fetching profile:', error);
  //     return null;
  //   }
  // },

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

    const mapped = mapProfileFromDb(data as DatabaseProfile);
    console.log('Auth service: profile fetched successfully', mapped);
    return mapped;
  } catch (error) {
    console.error('Exception fetching profile:', error);
    return null;
  }
},


  updateProfile: async (userId: string, profileData: Partial<Profile>) => {
    const cleanData = mapProfileToDb(profileData);

    if (!Object.keys(cleanData).length) {
      console.warn('No valid profile fields provided for update', profileData);
      const existing = await authService.fetchProfile(userId);
      if (!existing) throw new Error('Unable to load profile for update');
      return existing;
    }

    cleanData.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from('profiles')
      .update(cleanData)
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      console.error('Error updating profile:', error, cleanData);
      throw error;
    }

    return mapProfileFromDb(data as DatabaseProfile);
  },
};
