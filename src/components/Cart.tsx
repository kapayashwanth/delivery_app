import { useState, useEffect } from 'react';
import { storageService } from '@/lib/storage';
import { supabaseService } from '@/lib/supabase-service';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Plus, Minus, Trash2, MapPin, CreditCard } from 'lucide-react';
import { getImageUrl } from '@/lib/images';

interface CartProps {
  onBack: () => void;
  onOrderPlaced: () => void;
}

const Cart = ({ onBack, onOrderPlaced }: CartProps) => {
  const [cart, setCart] = useState<any[]>([]);
  const [address, setAddress] = useState('');
  const [showCheckout, setShowCheckout] = useState(false);
  const [processing, setProcessing] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setCart(storageService.getCart());
  }, []);

  const updateQuantity = (itemId: string, quantity: number) => {
    storageService.updateCartItem(itemId, quantity);
    setCart(storageService.getCart());
  };

  const removeItem = (itemId: string) => {
    storageService.removeFromCart(itemId);
    setCart(storageService.getCart());
    toast({
      title: "Item removed",
      description: "Item has been removed from your cart",
    });
  };

  const subtotal = cart.reduce((total, item) => total + (item.menuItem?.price || item.price || 0) * item.quantity, 0);
  const deliveryFee = 99;
  const tax = subtotal * 0.05;
  const total = subtotal + deliveryFee + tax;

  const handleCheckout = () => {
    if (!address.trim()) {
      toast({
        title: "Address required",
        description: "Please enter your delivery address",
        variant: "destructive"
      });
      return;
    }
    setShowCheckout(true);
  };

  const processPayment = async () => {
    setProcessing(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      if (cart.length > 0) {
        // Get restaurant ID from the first cart item
        const restaurantId = cart[0].menuItem?.restaurant_id || cart[0].restaurant_id || "11111111-1111-1111-1111-111111111111";
        
        const order = {
          customer_name: "Demo Customer",
          customer_phone: "+91 9876543210", 
          customer_address: address,
          restaurant_id: restaurantId,
          items: cart.map(item => ({
            id: item.menuItem?.id || item.id,
            name: item.menuItem?.name || item.name,
            price: item.menuItem?.price || item.price,
            quantity: item.quantity,
          })),
          total: Math.round(total),
          status: 'pending' as const,
          delivery_agent_id: null,
        };

        console.log('Creating order:', order); // Debug log
        
        await supabaseService.createOrder(order);
        storageService.clearCart();
        
        toast({
          title: "Payment successful!",
          description: "Your order has been placed successfully",
        });

        onOrderPlaced();
      }
    } catch (error) {
      console.error('Error placing order:', error);
      toast({
        title: "Error", 
        description: "Failed to place order. Please try again.",
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <header className="bg-card shadow-sm border-b">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center gap-4">
              <Button variant="ghost" onClick={onBack}>
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <h1 className="text-2xl font-bold">Your Cart</h1>
            </div>
          </div>
        </header>
        
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
          <div className="text-muted-foreground">
            <div className="w-16 h-16 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
              <Trash2 className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-medium mb-2">Your cart is empty</h3>
            <p className="mb-6">Add some delicious items to get started</p>
            <Button onClick={onBack} className="btn-hero">
              Browse Restaurants
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (showCheckout) {
    return (
      <div className="min-h-screen bg-background">
        <header className="bg-card shadow-sm border-b">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center gap-4">
              <Button variant="ghost" onClick={() => setShowCheckout(false)}>
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <h1 className="text-2xl font-bold">Payment</h1>
            </div>
          </div>
        </header>

        <div className="max-w-md mx-auto px-4 py-8">
          <Card className="card-elevated">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                UPI Payment Gateway
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-secondary/50 p-4 rounded-lg">
                <h3 className="font-medium mb-2">Order Summary</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>₹{subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Delivery</span>
                    <span>₹{deliveryFee.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>GST (5%)</span>
                    <span>₹{tax.toFixed(2)}</span>
                  </div>
                  <div className="border-t pt-2 flex justify-between font-semibold">
                    <span>Total</span>
                    <span>₹{total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <Input placeholder="UPI ID: yourname@paytm" />
                <Input placeholder="Mobile Number: +91 9876543210" />
              </div>

              <Button 
                onClick={processPayment}
                disabled={processing}
                className="w-full btn-hero"
              >
                {processing ? 'Processing Payment...' : `Pay ₹${total.toFixed(2)} via UPI`}
              </Button>

              <p className="text-xs text-muted-foreground text-center">
                This is a demo UPI payment. No real charges will be made.
              </p>
            </CardContent>
          </Card>
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
            <h1 className="text-2xl font-bold">Your Cart</h1>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cart.map((item) => (
              <Card key={item.menuItem?.id || item.id} className="card-elevated">
                <CardContent className="p-4">
                  <div className="flex gap-4">
                    <img 
                      src={getImageUrl(item.menuItem?.image || item.image)} 
                      alt={item.menuItem?.name || item.name}
                      className="w-16 h-16 rounded-lg object-cover bg-muted"
                    />
                    <div className="flex-1">
                      <h4 className="font-medium">{item.menuItem?.name || item.name}</h4>
                      <p className="text-sm text-muted-foreground">{item.menuItem?.description || item.description}</p>
                      
                      {/* Show customization details if present */}
                      {item.customization && (
                        <div className="mt-2 text-xs text-muted-foreground space-y-1">
                          <div>Size: <span className="capitalize">{item.customization.size}</span></div>
                          <div>Spice: <span className="capitalize">{item.customization.spiceLevel}</span></div>
                          {item.customization.extraToppings.length > 0 && (
                            <div>Extras: {item.customization.extraToppings.map(id => 
                              id.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
                            ).join(', ')}</div>
                          )}
                        </div>
                      )}
                      
                      <p className="font-semibold text-primary mt-2">₹{item.menuItem?.price || item.price}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateQuantity(item.menuItem?.id || item.id, item.quantity - 1)}
                      >
                        <Minus className="w-4 h-4" />
                      </Button>
                      <span className="w-8 text-center font-medium">{item.quantity}</span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateQuantity(item.menuItem?.id || item.id, item.quantity + 1)}
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeItem(item.menuItem?.id || item.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Order Summary */}
          <div className="space-y-6">
            <Card className="card-elevated">
              <CardHeader>
                <CardTitle>Delivery Address</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-start gap-2">
                  <MapPin className="w-5 h-5 mt-0.5 text-muted-foreground" />
                  <Input
                    placeholder="Enter your delivery address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="flex-1"
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="card-elevated">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>₹{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery Fee</span>
                  <span>₹{deliveryFee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>GST (5%)</span>
                  <span>₹{tax.toFixed(2)}</span>
                </div>
                <hr />
                <div className="flex justify-between font-semibold text-lg">
                  <span>Total</span>
                  <span>₹{total.toFixed(2)}</span>
                </div>
                <Button 
                  onClick={handleCheckout}
                  className="w-full btn-hero mt-4"
                >
                  Proceed to Checkout
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;