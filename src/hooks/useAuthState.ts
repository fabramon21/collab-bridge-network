
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { User } from '@supabase/supabase-js';
import { Profile } from "@/types/auth.types";
import { authService } from "@/services/authService";

export function useAuthState() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set initial loading state
    setLoading(true);
    console.log('Auth state initializing...');

    // Setup auth state change listener first (before getting session)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session?.user?.id);
      
      // Update user state synchronously
      setUser(session?.user ?? null);
      
      // If session exists, fetch profile asynchronously
      if (session?.user) {
        // Use setTimeout to prevent potential deadlocks with Supabase client
        setTimeout(async () => {
          const profileData = await authService.fetchProfile(session.user.id);
          console.log('Profile fetched after auth change:', profileData);
          setProfile(profileData);
        }, 0);
      } else {
        setProfile(null);
      }
      
      // Ensure loading is set to false after auth state change
      setLoading(false);
    });

    // Then check for existing session
    const initializeAuth = async () => {
      try {
        const { data: { session } } = await authService.getSession();
        console.log('Initial session check:', session?.user?.id);
        
        if (session?.user) {
          setUser(session.user);
          const profileData = await authService.fetchProfile(session.user.id);
          console.log('Initial profile loaded:', profileData);
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

  return { user, profile, loading, setUser, setProfile };
}
