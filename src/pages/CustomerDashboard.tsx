import { useState, useEffect } from 'react';
import { supabaseService, type Restaurant, type Order } from '@/lib/supabase-service';
import { storageService } from '@/lib/storage';
import { getImageUrl } from '@/lib/images';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { 
  ShoppingCart, 
  Star, 
  Clock, 
  DollarSign, 
  Plus, 
  Minus,
  Search,
  MapPin,
  User,
  LogOut
} from 'lucide-react';
import RestaurantDetails from '@/components/RestaurantDetails';
import Cart from '@/components/Cart';
import OrderTracking from '@/components/OrderTracking';
import { FloatingChatButton } from '@/components/AIChat';

const CustomerDashboard = () => {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [cart, setCart] = useState<any[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);
  const [showCart, setShowCart] = useState(false);
  const [showOrders, setShowOrders] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    loadData();

    // Subscribe to real-time updates
    const unsubscribeRestaurants = supabaseService.subscribeToRestaurants(setRestaurants);
    const unsubscribeOrders = supabaseService.subscribeToOrders(setOrders);

    return () => {
      unsubscribeRestaurants();
      unsubscribeOrders();
    };
  }, []);

  const loadData = async () => {
    try {
      const [restaurantsData, ordersData] = await Promise.all([
        supabaseService.getRestaurants(),
        supabaseService.getOrders()
      ]);
      setRestaurants(restaurantsData);
      setOrders(ordersData);
      setCart(storageService.getCart()); // Keep cart in localStorage for now
    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: "Error",
        description: "Failed to load data. Please refresh the page.",
        variant: "destructive",
      });
    }
  };

  const filteredRestaurants = restaurants.filter(restaurant =>
    restaurant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    restaurant.cuisine.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const cartTotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  const cartItemCount = cart.reduce((total, item) => total + item.quantity, 0);

  const handleLogout = () => {
    storageService.logout();
    window.location.reload();
  };

  if (selectedRestaurant) {
    return (
      <RestaurantDetails
        restaurant={selectedRestaurant}
        onBack={() => setSelectedRestaurant(null)}
        onCartUpdate={() => setCart(storageService.getCart())}
      />
    );
  }

  if (showCart) {
    return (
      <Cart
        onBack={() => setShowCart(false)}
        onOrderPlaced={() => {
          setShowCart(false);
          loadData();
          toast({
            title: "Order placed!",
            description: "Your order has been placed successfully",
          });
        }}
      />
    );
  }

  if (showOrders) {
    return (
      <OrderTracking
        onBack={() => setShowOrders(false)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-primary">FoodFlow</h1>
              <p className="text-sm text-muted-foreground">Discover delicious food near you</p>
            </div>
            <div className="flex items-center gap-4">
              <Button 
                variant="outline" 
                onClick={() => setShowOrders(true)}
                className="flex items-center gap-2"
              >
                <Clock className="w-4 h-4" />
                Orders
              </Button>
              <Button 
                onClick={() => setShowCart(true)}
                className="btn-accent flex items-center gap-2 relative"
              >
                <ShoppingCart className="w-4 h-4" />
                Cart
                {cartItemCount > 0 && (
                  <Badge className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground text-xs">
                    {cartItemCount}
                  </Badge>
                )}
              </Button>
              <Button variant="ghost" onClick={handleLogout}>
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Search */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
          <Input
            placeholder="Search restaurants, cuisines..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Restaurants Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRestaurants.map((restaurant) => (
            <Card 
              key={restaurant.id} 
              className="card-restaurant cursor-pointer"
              onClick={() => setSelectedRestaurant(restaurant)}
            >
              <div className="aspect-video bg-muted rounded-t-xl overflow-hidden">
                <img 
                  src={getImageUrl(restaurant.image)} 
                  alt={restaurant.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-lg">{restaurant.name}</h3>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-accent text-accent" />
                    <span className="text-sm font-medium">{restaurant.rating}</span>
                  </div>
                </div>
                <p className="text-muted-foreground text-sm mb-3">{restaurant.cuisine}</p>
                <div className="flex justify-between items-center text-sm">
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>{restaurant.delivery_time}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span>₹{restaurant.delivery_fee}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredRestaurants.length === 0 && (
          <div className="text-center py-12">
            <div className="text-muted-foreground">
              <Search className="w-12 h-12 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No restaurants found</h3>
              <p>Try adjusting your search criteria</p>
            </div>
          </div>
        )}
      </div>

      {/* Cart summary sticky bottom */}
      {cartItemCount > 0 && (
        <div className="fixed bottom-4 left-4 right-4 z-50">
          <Card className="card-elevated bg-primary text-primary-foreground">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{cartItemCount} items in cart</p>
                  <p className="text-primary-foreground/80">₹{cartTotal.toFixed(2)}</p>
                </div>
                <Button 
                  onClick={() => setShowCart(true)}
                  className="bg-primary-foreground text-primary hover:bg-primary-foreground/90"
                >
                  View Cart
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Floating AI Chat */}
      <FloatingChatButton />
    </div>
  );
};

export default CustomerDashboard;