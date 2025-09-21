import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, Star, Clock, Plus, Minus, Eye, Settings, ShoppingCart } from 'lucide-react';
import { supabaseService, type Restaurant, type MenuItem, type CartItem } from '@/lib/supabase-service';
import { storageService } from '@/lib/storage';
import { toast } from '@/hooks/use-toast';
import { DishCustomization, type DishCustomization as DishCustomizationType } from './DishCustomization';
import { DishPreview } from './DishPreview';
import { getImageUrl } from '@/lib/images';

interface RestaurantDetailsProps {
  restaurant: Restaurant;
  onBack: () => void;
  onCartUpdate: () => void;
}

const RestaurantDetails = ({ restaurant, onBack, onCartUpdate }: RestaurantDetailsProps) => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [selectedDishForCustomization, setSelectedDishForCustomization] = useState<MenuItem | null>(null);
  const [selectedDishForPreview, setSelectedDishForPreview] = useState<MenuItem | null>(null);

  useEffect(() => {
    loadMenuItems();

    const unsubscribe = supabaseService.subscribeToMenuItems(restaurant.id, setMenuItems);
    return () => {
      unsubscribe();
    };
  }, [restaurant.id]);

  const loadMenuItems = async () => {
    try {
      const items = await supabaseService.getMenuItems(restaurant.id);
      setMenuItems(items);
    } catch (error) {
      console.error('Error loading menu items:', error);
      toast({
        title: "Error",
        description: "Failed to load menu items.",
        variant: "destructive",
      });
    }
  };

  const handleQuantityChange = (itemId: string, change: number) => {
    setQuantities(prev => ({
      ...prev,
      [itemId]: Math.max(0, (prev[itemId] || 0) + change)
    }));
  };

  const addToCart = (item: MenuItem, customization?: DishCustomizationType) => {
    const quantity = quantities[item.id] || 1;
    const finalPrice = customization?.totalPrice || item.price;
    
    const cartItem = { 
      menuItem: { ...item, price: finalPrice }, 
      quantity,
      restaurantId: restaurant.id,
      restaurant_id: restaurant.id,
      customization // Store customization details
    };
    console.log('Adding to cart:', cartItem); // Debug log
    storageService.addToCart(cartItem);
    onCartUpdate();
    
    toast({
      title: "Added to Cart",
      description: customization 
        ? `Customized ${item.name} has been added to your cart.`
        : `${item.name} has been added to your cart.`,
    });
    
    setQuantities(prev => ({ ...prev, [item.id]: 0 }));
  };

  const handleCustomizationComplete = (customization: DishCustomizationType) => {
    if (selectedDishForCustomization) {
      addToCart(selectedDishForCustomization, customization);
      setSelectedDishForCustomization(null);
    }
  };

  const menuCategories = [...new Set(menuItems.map(item => item.category))];

  // Cart Button Component
  const CartButton = ({ onCartUpdate }: { onCartUpdate: () => void }) => {
    const [cart, setCart] = useState<any[]>([]);

    useEffect(() => {
      setCart(storageService.getCart());
    }, []);

    useEffect(() => {
      const updateCart = () => setCart(storageService.getCart());
      updateCart(); // Initial load
      const interval = setInterval(updateCart, 1000); // Refresh every second
      return () => clearInterval(interval);
    }, []);

    const cartItemCount = cart.reduce((total, item) => total + item.quantity, 0);
    const cartTotal = cart.reduce((total, item) => total + (item.menuItem.price * item.quantity), 0);

    if (cartItemCount === 0) return null;

    return (
      <Card className="card-elevated bg-primary text-primary-foreground">
        <CardContent className="p-3">
          <div className="flex items-center gap-3">
            <div className="text-sm">
              <div className="font-medium">{cartItemCount} items</div>
              <div className="text-primary-foreground/80">₹{cartTotal}</div>
            </div>
            <Button 
              size="sm"
              className="bg-primary-foreground text-primary hover:bg-primary-foreground/90"
            >
              <ShoppingCart className="w-4 h-4 mr-1" />
              View Cart
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" onClick={onBack}>
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold">{restaurant.name}</h1>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-accent text-accent" />
                    <span>{restaurant.rating}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>{restaurant.delivery_time}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span>₹{restaurant.delivery_fee} delivery</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Cart Button */}
            <CartButton onCartUpdate={onCartUpdate} />
          </div>
        </div>
      </header>

      {/* Restaurant Hero */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="aspect-video bg-muted rounded-xl overflow-hidden mb-6">
          <img 
            src={getImageUrl(restaurant.image)} 
            alt={restaurant.name}
            className="w-full h-full object-cover"
          />
        </div>

        <div className="mb-6">
          <Badge variant="secondary" className="mb-2">{restaurant.cuisine}</Badge>
          <h2 className="text-xl font-semibold mb-2">Menu</h2>
        </div>

        {/* Menu */}
        <div className="space-y-8">
          {menuCategories.map(category => (
            <div key={category}>
              <h3 className="text-lg font-semibold mb-4 capitalize">{category}</h3>
              <div className="grid gap-4">
                {menuItems
                  .filter(item => item.category === category)
                  .map(item => (
                    <Card key={item.id} className="card-elevated">
                      <CardContent className="p-4">
                        <div className="flex gap-4">
                          <img 
                            src={getImageUrl(item.image)} 
                            alt={item.name}
                            className="w-20 h-20 rounded-lg object-cover bg-muted"
                          />
                          <div className="flex-1">
                            <h4 className="font-medium mb-1">{item.name}</h4>
                            <p className="text-sm text-muted-foreground mb-2">{item.description}</p>
                            <p className="font-semibold text-primary">₹{item.price}</p>
                          </div>
                          <div className="flex flex-col gap-2">
                            {/* Action Buttons Row */}
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  console.log('3D View clicked for:', item.name);
                                  setSelectedDishForPreview(item);
                                }}
                                className="flex items-center gap-1"
                              >
                                <Eye className="w-3 h-3" />
                                3D View
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  console.log('Customize clicked for:', item.name);
                                  setSelectedDishForCustomization(item);
                                }}
                                className="flex items-center gap-1"
                              >
                                <Settings className="w-3 h-3" />
                                Customize
                              </Button>
                            </div>
                            
                            {/* Add to Cart Section */}
                            <div className="flex items-center gap-2">
                              {quantities[item.id] > 0 ? (
                                <div className="flex items-center gap-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleQuantityChange(item.id, -1)}
                                  >
                                    <Minus className="w-4 h-4" />
                                  </Button>
                                  <span className="w-8 text-center font-medium">
                                    {quantities[item.id]}
                                  </span>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleQuantityChange(item.id, 1)}
                                  >
                                    <Plus className="w-4 h-4" />
                                  </Button>
                                  <Button
                                    onClick={() => addToCart(item)}
                                    className="btn-accent ml-2"
                                  >
                                    Add to Cart
                                  </Button>
                                </div>
                              ) : (
                                <Button
                                  onClick={() => {
                                    setQuantities(prev => ({ ...prev, [item.id]: 1 }));
                                  }}
                                  className="btn-accent flex items-center gap-2"
                                >
                                  <Plus className="w-4 h-4" />
                                  Add
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modals */}
      {selectedDishForCustomization && (
        <DishCustomization
          dish={selectedDishForCustomization}
          onClose={() => setSelectedDishForCustomization(null)}
          onAddToCart={handleCustomizationComplete}
        />
      )}

      {selectedDishForPreview && (
        <DishPreview
          dish={selectedDishForPreview}
          onClose={() => setSelectedDishForPreview(null)}
        />
      )}
    </div>
  );
};

export default RestaurantDetails;