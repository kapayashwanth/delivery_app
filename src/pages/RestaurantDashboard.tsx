import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LogOut, Package, Clock, CheckCircle, Utensils, Plus, Edit } from 'lucide-react';
import { supabaseService, type Order, type MenuItem } from '@/lib/supabase-service';
import { storageService } from '@/lib/storage';
import { toast } from '@/hooks/use-toast';
import { getImageUrl } from '@/lib/images';
import OrderStatusTest from '@/components/OrderStatusTest';

const RestaurantDashboard = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [menu, setMenu] = useState<MenuItem[]>([]);

  useEffect(() => {
    loadOrders();

    // Subscribe to real-time updates and reload filtered orders
    const unsubscribe = supabaseService.subscribeToOrders(() => {
      loadOrders(); // This ensures proper filtering for this restaurant
    });
    return () => {
      unsubscribe();
    };
  }, []);

  const loadOrders = async () => {
    const user = storageService.getCurrentUser();
    console.log('Current user:', user); // Debug log
    
    try {
      // Get all orders for the demo restaurant
      const allOrders = await supabaseService.getOrders();
      console.log('All orders:', allOrders); // Debug log
      
      // Filter orders for Pizza Palace (restaurant ID from our seed data)
      const restaurantOrders = allOrders.filter(order => 
        order.restaurant_id === "11111111-1111-1111-1111-111111111111"
      );
      console.log('Restaurant orders:', restaurantOrders); // Debug log
      
      setOrders(restaurantOrders);
      
      const menuItems = await supabaseService.getMenuItems("11111111-1111-1111-1111-111111111111");
      setMenu(menuItems);
    } catch (error) {
      console.error('Error loading orders:', error);
      toast({
        title: "Error",
        description: "Failed to load orders.",
        variant: "destructive",
      });
    }
  };

  const updateOrderStatus = async (orderId: string, status: string) => {
    try {
      await supabaseService.updateOrderStatus(orderId, status);
      toast({
        title: "Order Updated",
        description: `Order status updated to ${status}.`,
      });
    } catch (error) {
      console.error('Error updating order status:', error);
      toast({
        title: "Error",
        description: "Failed to update order status.",
        variant: "destructive",
      });
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'pending': return 'status-pending';
      case 'confirmed': return 'status-confirmed';
      case 'preparing': return 'status-preparing';
      case 'ready': return 'status-ready';
      default: return 'status-pending';
    }
  };

  const getNextStatus = (currentStatus: string): string | null => {
    switch (currentStatus) {
      case 'pending': return 'confirmed';
      case 'confirmed': return 'preparing';
      case 'preparing': return 'ready';
      default: return null;
    }
  };

  const getNextStatusText = (currentStatus: string): string => {
    switch (currentStatus) {
      case 'pending': return 'Confirm Order';
      case 'confirmed': return 'Start Preparing';
      case 'preparing': return 'Mark Ready';
      default: return '';
    }
  };

  const handleLogout = () => {
    storageService.logout();
    window.location.reload();
  };

  const pendingOrders = orders.filter(o => ['pending', 'confirmed', 'preparing'].includes(o.status));
  const readyOrders = orders.filter(o => o.status === 'ready');
  const completedOrders = orders.filter(o => ['out_for_delivery', 'delivered'].includes(o.status));

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Utensils className="w-8 h-8 text-primary" />
              <div>
                <h1 className="text-2xl font-bold text-primary">Restaurant Dashboard</h1>
                <p className="text-sm text-muted-foreground">Pizza Palace</p>
              </div>
            </div>
            <Button variant="ghost" onClick={handleLogout}>
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Real-time Test Panel */}
        <OrderStatusTest />
        
        <Tabs defaultValue="orders" className="space-y-6">
          <TabsList>
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="menu">Menu Management</TabsTrigger>
          </TabsList>

          <TabsContent value="orders" className="space-y-6">
            {/* Order Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="card-elevated">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-warning/20 rounded-lg">
                      <Clock className="w-6 h-6 text-warning-foreground" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{pendingOrders.length}</p>
                      <p className="text-sm text-muted-foreground">Pending Orders</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="card-elevated">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-success/20 rounded-lg">
                      <CheckCircle className="w-6 h-6 text-success-foreground" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{readyOrders.length}</p>
                      <p className="text-sm text-muted-foreground">Ready for Pickup</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="card-elevated">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/20 rounded-lg">
                      <Utensils className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{completedOrders.length}</p>
                      <p className="text-sm text-muted-foreground">Completed Today</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Active Orders */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Active Orders</h3>
              <div className="grid gap-4">
                {pendingOrders.length === 0 ? (
                  <Card className="card-elevated">
                    <CardContent className="p-8 text-center">
                      <div className="text-muted-foreground">
                        <Clock className="w-12 h-12 mx-auto mb-4" />
                        <h4 className="text-lg font-medium mb-2">No active orders</h4>
                        <p>New orders will appear here when customers place them</p>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  pendingOrders.map((order) => (
                    <Card key={order.id} className="card-order">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h4 className="font-semibold">Order #{order.id.slice(-8)}</h4>
                            <p className="text-sm text-muted-foreground">
                              {new Date(order.created_at).toLocaleTimeString()}
                            </p>
                          </div>
                          <div className="text-right">
                            <Badge className={getStatusBadgeClass(order.status)}>
                              {order.status}
                            </Badge>
                            <p className="text-lg font-semibold mt-1">₹{order.total}</p>
                          </div>
                        </div>

                        <div className="space-y-2 mb-4">
                          {Array.isArray(order.items) && order.items.map((item: any, index: number) => (
                            <div key={index} className="flex justify-between text-sm">
                              <span>{item.quantity}x {item.name}</span>
                              <span>₹{(item.price * item.quantity)}</span>
                            </div>
                          ))}
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="text-sm text-muted-foreground">
                            <p>Delivery to: {order.customer_address}</p>
                          </div>
                          
                          {getNextStatus(order.status) && (
                            <Button
                              onClick={() => updateOrderStatus(order.id, getNextStatus(order.status)!)}
                              className="btn-accent"
                            >
                              {getNextStatusText(order.status)}
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </div>

            {/* Ready Orders */}
            {readyOrders.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-4">Ready for Pickup</h3>
                <div className="grid gap-4">
                  {readyOrders.map((order) => (
                    <Card key={order.id} className="card-order border-success/50">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-center">
                          <div>
                            <h4 className="font-semibold">Order #{order.id.slice(-8)}</h4>
                            <p className="text-sm text-muted-foreground">
                              Ready since {new Date(order.created_at).toLocaleTimeString()}
                            </p>
                          </div>
                          <div className="text-right">
                            <Badge className="status-ready">Ready</Badge>
                            <p className="text-lg font-semibold mt-1">₹{order.total}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="menu" className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Menu Items</h3>
              <Button className="btn-hero flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Add Item
              </Button>
            </div>

            <div className="grid gap-4">
              {menu.map((item) => (
                <Card key={item.id} className="card-elevated">
                  <CardContent className="p-4">
                    <div className="flex gap-4">
                       <img 
                         src={getImageUrl(item.image)} 
                         alt={item.name}
                         className="w-16 h-16 rounded-lg object-cover bg-muted"
                       />
                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h4 className="font-medium">{item.name}</h4>
                            <p className="text-sm text-muted-foreground">{item.description}</p>
                            <Badge variant="secondary" className="mt-1 capitalize">{item.category}</Badge>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-semibold text-primary">₹{item.price}</p>
                            <Button variant="ghost" size="sm">
                              <Edit className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default RestaurantDashboard;