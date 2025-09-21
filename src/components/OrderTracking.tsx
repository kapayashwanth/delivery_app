import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Clock, CheckCircle, Truck, MapPin, User } from 'lucide-react';
import { supabaseService, type Order } from '@/lib/supabase-service';
import { toast } from '@/hooks/use-toast';

interface OrderTrackingProps {
  onBack: () => void;
}

const OrderTracking = ({ onBack }: OrderTrackingProps) => {
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    loadOrders();

    const unsubscribe = supabaseService.subscribeToOrders(setOrders);
    return () => {
      unsubscribe();
    };
  }, []);

  const loadOrders = async () => {
    try {
      const ordersData = await supabaseService.getOrders();
      setOrders(ordersData);
    } catch (error) {
      console.error('Error loading orders:', error);
      toast({
        title: "Error",
        description: "Failed to load orders.",
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
      case 'out_for_delivery': return 'status-confirmed';
      case 'delivered': return 'status-delivered';
      default: return 'status-pending';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Order Pending';
      case 'confirmed': return 'Order Confirmed';
      case 'preparing': return 'Preparing';
      case 'ready': return 'Ready for Pickup';
      case 'out_for_delivery': return 'Out for Delivery';
      case 'delivered': return 'Delivered';
      default: return status;
    }
  };

  const OrderProgressBar = ({ status }: { status: string }) => {
    const steps = [
      { key: 'confirmed', label: 'Confirmed', icon: CheckCircle },
      { key: 'preparing', label: 'Preparing', icon: Clock },
      { key: 'ready', label: 'Ready', icon: CheckCircle },
      { key: 'out_for_delivery', label: 'Out for Delivery', icon: Truck },
      { key: 'delivered', label: 'Delivered', icon: CheckCircle }
    ];

    const currentStepIndex = steps.findIndex(step => step.key === status);

    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isCompleted = index <= currentStepIndex;
            const isCurrent = index === currentStepIndex;

            return (
              <div key={step.key} className="flex flex-col items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  isCompleted 
                    ? 'bg-success text-success-foreground' 
                    : isCurrent
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground'
                }`}>
                  <Icon className="w-4 h-4" />
                </div>
                <span className="text-xs mt-1 text-center">{step.label}</span>
              </div>
            );
          })}
        </div>
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-muted"></div>
          </div>
          <div className="relative flex justify-between">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`w-3 h-3 rounded-full ${
                  index <= currentStepIndex ? 'bg-success' : 'bg-muted'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    );
  };

  if (orders.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <header className="bg-card shadow-sm border-b">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center gap-4">
              <Button variant="ghost" onClick={onBack}>
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <h1 className="text-2xl font-bold">Your Orders</h1>
            </div>
          </div>
        </header>
        
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
          <div className="text-muted-foreground">
            <Clock className="w-12 h-12 mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No orders yet</h3>
            <p className="mb-6">When you place an order, you'll see it here</p>
            <Button onClick={onBack} className="btn-hero">
              Start Shopping
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={onBack}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-2xl font-bold">Your Orders</h1>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="space-y-6">
          {orders.map((order) => (
            <Card key={order.id} className="card-elevated">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">Order #{order.id.slice(-8)}</CardTitle>
                    <p className="text-xs text-muted-foreground">
                      {new Date(order.created_at).toLocaleDateString()} at{' '}
                      {new Date(order.created_at).toLocaleTimeString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <Badge className={getStatusBadgeClass(order.status)}>
                      {getStatusText(order.status)}
                    </Badge>
                    <p className="text-lg font-semibold mt-1">₹{order.total}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Order Progress */}
                <OrderProgressBar status={order.status} />

                {/* Order Items */}
                <div>
                  <h4 className="font-medium mb-2">Items Ordered</h4>
                  <div className="space-y-2">
                    {Array.isArray(order.items) && order.items.map((item: any, index: number) => (
                      <div key={index} className="flex justify-between text-sm">
                        <span>{item.quantity}x {item.name}</span>
                        <span>₹{(item.price * item.quantity)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Delivery Address */}
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  <span>{order.customer_address}</span>
                </div>

                {/* Live Updates */}
                {order.status !== 'delivered' && (
                  <div className="bg-secondary/50 p-3 rounded-lg">
                    <p className="text-sm">
                      {order.status === 'pending' && "Your order has been placed and is waiting for confirmation."}
                      {order.status === 'confirmed' && "Your order has been confirmed and is being prepared."}
                      {order.status === 'preparing' && "Your order is being prepared with care."}
                      {order.status === 'ready' && "Your order is ready for pickup!"}
                      {order.status === 'out_for_delivery' && "Your order is on the way to you!"}
                    </p>
                  </div>
                )}

                {order.status === 'delivered' && (
                  <div className="bg-success/20 p-3 rounded-lg">
                    <p className="text-sm text-success-foreground">
                      Your order has been delivered! We hope you enjoyed your meal.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default OrderTracking;