
import React, { createContext, useContext } from "react";
import { useNavigate } from 'react-router-dom';
import { useToast } from "@/hooks/use-toast";
import { useAuthState } from "@/hooks/useAuthState";
import { authService } from "@/services/authService";
import { AuthContextType, Profile } from "@/types/auth.types";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { user, profile, loading, setProfile } = useAuthState();
  const navigate = useNavigate();
  const { toast } = useToast();

  const signIn = async (email: string, password: string) => {
    try {
      await authService.signIn(email, password);
      
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
      throw error;
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
      await authService.signUp(data);

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
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await authService.signOut();
      
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
    }
  };

  const updateProfile = async (profileData: Partial<Profile>) => {
    if (!user) throw new Error('No user logged in');

    try {
      const updatedProfile = await authService.updateProfile(user.id, profileData);
      setProfile(updatedProfile);
      
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
