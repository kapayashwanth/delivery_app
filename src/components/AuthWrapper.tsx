import { useState, useEffect, ReactNode } from 'react';
import { Session } from '@supabase/supabase-js';
import { authService, UserProfile } from '@/lib/auth';
import CustomerLoginPage from '@/pages/CustomerLoginPage';

interface AuthWrapperProps {
  children: ReactNode;
  requiredRole?: UserProfile['role'];
}

export const AuthWrapper = ({ children, requiredRole }: AuthWrapperProps) => {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = authService.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        
        if (session?.user) {
          // Fetch user profile
          setTimeout(async () => {
            const { profile } = await authService.getUserProfile(session.user.id);
            setProfile(profile);
          }, 0);
        } else {
          setProfile(null);
        }
        
        setLoading(false);
      }
    );

    // Check for existing session
    authService.getSession().then(async ({ session }) => {
      setSession(session);
      
      if (session?.user) {
        const { profile } = await authService.getUserProfile(session.user.id);
        setProfile(profile);
      }
      
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogin = () => {
    // Auth state change will handle the login
  };

  const handleLogout = async () => {
    await authService.signOut();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!session || !profile) {
    return <CustomerLoginPage onLogin={handleLogin} />;
  }

  if (requiredRole && profile.role !== requiredRole) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-destructive mb-4">Access Denied</h1>
          <p className="text-muted-foreground mb-4">
            You don't have permission to access this area.
          </p>
          <button 
            onClick={handleLogout}
            className="btn-hero"
          >
            Logout
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      {children}
    </div>
  );
};