import { useEffect, useState } from 'react';
import { storageService } from '@/lib/storage';
import { authService } from '@/lib/auth';
import { AuthWrapper } from '@/components/AuthWrapper';
import CustomerDashboard from './CustomerDashboard';
import RestaurantDashboard from './RestaurantDashboard';
import DeliveryDashboard from './DeliveryDashboard';

const Index = () => {
  useEffect(() => {
    // Initialize demo data when app loads
    storageService.initializeDemoData();
  }, []);

  return (
    <AuthWrapper>
      <RoleBasedDashboard />
    </AuthWrapper>
  );
};

const RoleBasedDashboard = () => {
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    const getProfile = async () => {
      const { session } = await authService.getSession();
      if (session?.user) {
        const { profile } = await authService.getUserProfile(session.user.id);
        setProfile(profile);
      }
    };
    getProfile();
  }, []);

  if (!profile) return null;

  switch (profile.role) {
    case 'customer':
      return <CustomerDashboard />;
    case 'restaurant':
      return <RestaurantDashboard />;
    case 'delivery':
      return <DeliveryDashboard />;
    default:
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-destructive mb-4">Unknown Role</h1>
            <p className="text-muted-foreground">Please contact support.</p>
          </div>
        </div>
      );
  }
};

export default Index;
