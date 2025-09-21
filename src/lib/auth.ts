import { supabase } from '@/integrations/supabase/client';
import { User, Session } from '@supabase/supabase-js';

export interface UserProfile {
  id: string;
  user_id: string;
  email: string;
  full_name: string | null;
  role: 'customer' | 'restaurant' | 'delivery';
  restaurant_id: string | null;
  phone: string | null;
  created_at: string;
  updated_at: string;
}

export const authService = {
  // Sign up new user with role
  async signUp(email: string, password: string, fullName: string, role: 'customer' | 'restaurant' | 'delivery' = 'customer') {
    const redirectUrl = `${window.location.origin}/`;
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          full_name: fullName,
          role: role
        }
      }
    });
    
    return { data, error };
  },

  // Sign in
  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    return { data, error };
  },

  // Sign out
  async signOut() {
    const { error } = await supabase.auth.signOut();
    // Clear any local storage
    localStorage.clear();
    // Redirect to home page after logout
    window.location.href = '/';
    return { error };
  },

  // Get current session
  async getSession() {
    const { data: { session }, error } = await supabase.auth.getSession();
    return { session, error };
  },

  // Get user profile
  async getUserProfile(userId: string): Promise<{ profile: UserProfile | null; error: any }> {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    return { profile: profile as UserProfile, error };
  },

  // Listen to auth changes
  onAuthStateChange(callback: (event: string, session: Session | null) => void) {
    return supabase.auth.onAuthStateChange(callback);
  }
};