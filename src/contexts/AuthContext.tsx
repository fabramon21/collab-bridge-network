
import React, { createContext, useState, useEffect, useContext } from "react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { User } from '@supabase/supabase-js';
import { useNavigate } from 'react-router-dom';

type Profile = {
  id: string;
  full_name: string;
  university: string;
  linkedin_url: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
  address: string;
  bio: string;
  interests: string[];
  is_online: boolean;
  last_active: string;
  location: string;
  profile_image_url: string;
  skills: string[];
};

type AuthContextType = {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (data: {
    email: string;
    password: string;
    full_name: string;
    university: string;
    linkedin_url?: string;
  }) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (profile: Partial<Profile>) => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Fetch profile data for a user
  const fetchProfile = async (userId: string) => {
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
  };

  useEffect(() => {
    // Set initial loading state
    setLoading(true);
    console.log('Auth context initializing...');

    // Setup auth state change listener first (before getting session)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session?.user?.id);
      
      // Update user state synchronously
      setUser(session?.user ?? null);
      
      // If session exists, fetch profile asynchronously
      if (session?.user) {
        const profileData = await fetchProfile(session.user.id);
        setProfile(profileData);
      } else {
        setProfile(null);
      }
      
      // Ensure loading is set to false after auth state change
      setLoading(false);
    });

    // Then check for existing session
    const initializeAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        console.log('Initial session check:', session?.user?.id);
        
        if (session?.user) {
          setUser(session.user);
          const profileData = await fetchProfile(session.user.id);
          setProfile(profileData);
        }
      } catch (error) {
        console.error('Error during auth initialization:', error);
      } finally {
        // Set loading to false if no session exists or after fetching profile
        setLoading(false);
      }
    };

    initializeAuth();

    // Cleanup subscription on unmount
    return () => {
      console.log('Cleaning up auth subscription');
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      
      // Navigate will be handled by auth state change listener
      toast({
        title: 'Success',
        description: 'You have successfully signed in',
      });
    } catch (error) {
      console.error('Error signing in:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to sign in',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (data: {
    email: string;
    password: string;
    full_name: string;
    university: string;
    linkedin_url?: string;
  }) => {
    try {
      setLoading(true);
      const { error: signUpError } = await supabase.auth.signUp({
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

      if (signUpError) throw signUpError;

      toast({
        title: 'Success',
        description: 'Please check your email to verify your account.',
      });
      navigate('/login');
    } catch (error) {
      console.error('Error signing up:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to sign up',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      // Clear local state
      setUser(null);
      setProfile(null);
      
      navigate('/');
      toast({
        title: 'Signed out',
        description: 'You have been successfully signed out',
      });
    } catch (error) {
      console.error('Error signing out:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to sign out',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (profileData: Partial<Profile>) => {
    if (!user) throw new Error('No user logged in');

    try {
      setLoading(true);
      const { error } = await supabase
        .from('profiles')
        .update(profileData)
        .eq('id', user.id);
      
      if (error) throw error;
      
      // Update local profile state
      setProfile(prev => prev ? { ...prev, ...profileData } : null);
      
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Error updating profile",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    profile,
    loading,
    signIn,
    signUp,
    signOut,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
