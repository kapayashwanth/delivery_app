import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LogOut, Package, Clock, CheckCircle, Truck, MapPin, Navigation } from 'lucide-react';
import { supabaseService, type Order } from '@/lib/supabase-service';
import { storageService } from '@/lib/storage';
import { toast } from '@/hooks/use-toast';

const DeliveryDashboard = () => {
  const [availableOrders, setAvailableOrders] = useState<Order[]>([]);
  const [myOrders, setMyOrders] = useState<Order[]>([]);

  useEffect(() => {
    loadOrders();

    const unsubscribe = supabaseService.subscribeToOrders(() => loadOrders());
    return () => {
      unsubscribe();
    };
  }, []);

  const loadOrders = async () => {
    const user = storageService.getCurrentUser();
    if (user && user.role === 'delivery') {
      try {
        const [available, assigned] = await Promise.all([
          supabaseService.getAvailableOrdersForDelivery(),
          supabaseService.getOrdersByDeliveryAgent(user.id)
        ]);
        setAvailableOrders(available);
        setMyOrders(assigned);
      } catch (error) {
        console.error('Error loading orders:', error);
        toast({
          title: "Error",
          description: "Failed to load orders.",
          variant: "destructive",
        });
      }
    }
  };

  const acceptOrder = async (orderId: string) => {
    const user = storageService.getCurrentUser();
    if (user) {
      try {
        await supabaseService.updateOrderStatus(orderId, 'out_for_delivery', user.id);
        toast({
          title: "Order Accepted",
          description: "You have accepted this delivery order.",
        });
      } catch (error) {
        console.error('Error accepting order:', error);
        toast({
          title: "Error",
          description: "Failed to accept order.",
          variant: "destructive",
        });
      }
    }
  };

  const completeDelivery = async (orderId: string) => {
    try {
      await supabaseService.updateOrderStatus(orderId, 'delivered');
      toast({
        title: "Delivery Completed",
        description: "Order has been marked as delivered.",
      });
    } catch (error) {
      console.error('Error completing delivery:', error);
      toast({
        title: "Error",
        description: "Failed to complete delivery.",
        variant: "destructive",
      });
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'out_for_delivery': return 'status-confirmed';
      case 'delivered': return 'status-delivered';
      default: return 'status-pending';
    }
  };

  const handleLogout = () => {
    storageService.logout();
    window.location.reload();
  };

  const activeOrders = myOrders.filter(o => o.status === 'out_for_delivery');
  const completedOrders = myOrders.filter(o => o.status === 'delivered');

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Truck className="w-8 h-8 text-primary" />
              <div>
                <h1 className="text-2xl font-bold text-primary">Delivery Dashboard</h1>
                <p className="text-sm text-muted-foreground">Ready to deliver</p>
              </div>
            </div>
            <Button variant="ghost" onClick={handleLogout}>
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Tabs defaultValue="available" className="space-y-6">
          <TabsList>
            <TabsTrigger value="available">Available Orders</TabsTrigger>
            <TabsTrigger value="active">Active Deliveries</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
          </TabsList>

          {/* Delivery Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="card-elevated">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-accent/20 rounded-lg">
                    <Package className="w-6 h-6 text-accent-foreground" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{availableOrders.length}</p>
                    <p className="text-sm text-muted-foreground">Available Orders</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="card-elevated">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-warning/20 rounded-lg">
                    <Truck className="w-6 h-6 text-warning-foreground" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{activeOrders.length}</p>
                    <p className="text-sm text-muted-foreground">Active Deliveries</p>
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
                    <p className="text-2xl font-bold">{completedOrders.length}</p>
                    <p className="text-sm text-muted-foreground">Completed Today</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <TabsContent value="available" className="space-y-4">
            <h3 className="text-lg font-semibold">Orders Ready for Pickup</h3>
            
            {availableOrders.length === 0 ? (
              <Card className="card-elevated">
                <CardContent className="p-8 text-center">
                  <div className="text-muted-foreground">
                    <Package className="w-12 h-12 mx-auto mb-4" />
                    <h4 className="text-lg font-medium mb-2">No orders available</h4>
                    <p>New delivery orders will appear here when restaurants mark them as ready</p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              availableOrders.map((order) => (
                <Card key={order.id} className="card-elevated">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h4 className="font-semibold">Order #{order.id.slice(-8)}</h4>
                        <p className="text-xs text-muted-foreground">
                          Ready since {new Date(order.created_at).toLocaleTimeString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <Badge className="status-ready">Ready</Badge>
                        <p className="text-lg font-semibold mt-1">₹{order.total}</p>
                      </div>
                    </div>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="w-4 h-4 text-muted-foreground" />
                        <span>{order.customer_address}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Package className="w-4 h-4 text-muted-foreground" />
                        <span>{Array.isArray(order.items) ? order.items.length : 0} items</span>
                      </div>
                    </div>

                    <div className="flex justify-between items-center">
                      <div className="text-sm text-success-foreground">
                        <span className="font-medium">Estimated earnings: ₹150</span>
                      </div>
                      <Button
                        onClick={() => acceptOrder(order.id)}
                        className="btn-accent flex items-center gap-2"
                      >
                        <Truck className="w-4 h-4" />
                        Accept Delivery
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="active" className="space-y-4">
            <h3 className="text-lg font-semibold">Active Deliveries</h3>
            
            {activeOrders.length === 0 ? (
              <Card className="card-elevated">
                <CardContent className="p-8 text-center">
                  <div className="text-muted-foreground">
                    <Truck className="w-12 h-12 mx-auto mb-4" />
                    <h4 className="text-lg font-medium mb-2">No active deliveries</h4>
                    <p>Accept orders from the available tab to start delivering</p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              activeOrders.map((order) => (
                <Card key={order.id} className="card-elevated border-primary/50">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h4 className="font-semibold">Order #{order.id.slice(-8)}</h4>
                      </div>
                      <div className="text-right">
                        <Badge className={getStatusBadgeClass(order.status)}>
                          Out for Delivery
                        </Badge>
                        <p className="text-lg font-semibold mt-1">₹{order.total}</p>
                      </div>
                    </div>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="w-4 h-4 text-muted-foreground" />
                        <span>{order.customer_address}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Package className="w-4 h-4 text-muted-foreground" />
                        <span>{Array.isArray(order.items) ? order.items.length : 0} items</span>
                      </div>
                    </div>

                    <div className="flex justify-between items-center">
                      <Button
                        variant="outline"
                        className="flex items-center gap-2"
                      >
                        <Navigation className="w-4 h-4" />
                        Navigate
                      </Button>
                      
                      <Button
                        onClick={() => completeDelivery(order.id)}
                        className="btn-hero"
                      >
                        Mark Delivered
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="completed" className="space-y-4">
            <h3 className="text-lg font-semibold">Completed Deliveries</h3>
            
            {completedOrders.length === 0 ? (
              <Card className="card-elevated">
                <CardContent className="p-8 text-center">
                  <div className="text-muted-foreground">
                    <CheckCircle className="w-12 h-12 mx-auto mb-4" />
                    <h4 className="text-lg font-medium mb-2">No completed deliveries</h4>
                    <p>Your completed deliveries will appear here</p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              completedOrders.map((order) => (
                <Card key={order.id} className="card-elevated">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-semibold">Order #{order.id.slice(-8)}</h4>
                        <p className="text-xs text-muted-foreground">
                          Delivered at {new Date(order.updated_at).toLocaleString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <Badge className="status-delivered">Delivered</Badge>
                        <p className="text-sm text-success-foreground font-medium mt-1">
                          Earned: ₹150
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default DeliveryDashboard;