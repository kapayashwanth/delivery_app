import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { X, Plus } from 'lucide-react';
import { MenuItem } from '@/lib/supabase-service';
import { getImageUrl } from '@/lib/images';

interface DishCustomizationProps {
  dish: MenuItem;
  onClose: () => void;
  onAddToCart: (customizations: DishCustomization) => void;
}

export interface DishCustomization {
  size: 'regular' | 'large';
  spiceLevel: 'mild' | 'medium' | 'hot';
  extraToppings: string[];
  specialRequests: string;
  totalPrice: number;
}

const CUSTOMIZATION_OPTIONS = {
  sizes: [
    { id: 'regular', label: 'Regular', priceModifier: 0 },
    { id: 'large', label: 'Large', priceModifier: 50 }
  ],
  spiceLevels: [
    { id: 'mild', label: 'Mild', icon: '🌶️' },
    { id: 'medium', label: 'Medium', icon: '🌶️🌶️' },
    { id: 'hot', label: 'Hot', icon: '🌶️🌶️🌶️' }
  ],
  extraToppings: [
    { id: 'extra-cheese', label: 'Extra Cheese', price: 30 },
    { id: 'mushrooms', label: 'Mushrooms', price: 25 },
    { id: 'pepperoni', label: 'Pepperoni', price: 40 },
    { id: 'bell-peppers', label: 'Bell Peppers', price: 20 },
    { id: 'onions', label: 'Onions', price: 15 },
    { id: 'olives', label: 'Olives', price: 25 },
    { id: 'jalapenos', label: 'Jalapeños', price: 20 },
    { id: 'tomatoes', label: 'Tomatoes', price: 15 }
  ]
};

export const DishCustomization = ({ dish, onClose, onAddToCart }: DishCustomizationProps) => {
  const [customization, setCustomization] = useState<DishCustomization>({
    size: 'regular',
    spiceLevel: 'medium',
    extraToppings: [],
    specialRequests: '',
    totalPrice: dish.price
  });

  const calculateTotalPrice = (size: string, toppings: string[]) => {
    const sizePrice = CUSTOMIZATION_OPTIONS.sizes.find(s => s.id === size)?.priceModifier || 0;
    const toppingsPrice = toppings.reduce((total, toppingId) => {
      const topping = CUSTOMIZATION_OPTIONS.extraToppings.find(t => t.id === toppingId);
      return total + (topping?.price || 0);
    }, 0);
    return dish.price + sizePrice + toppingsPrice;
  };

  const handleSizeChange = (size: string) => {
    const newCustomization = { ...customization, size: size as 'regular' | 'large' };
    newCustomization.totalPrice = calculateTotalPrice(size, customization.extraToppings);
    setCustomization(newCustomization);
  };

  const handleSpiceLevelChange = (spiceLevel: string) => {
    setCustomization({ ...customization, spiceLevel: spiceLevel as 'mild' | 'medium' | 'hot' });
  };

  const handleToppingToggle = (toppingId: string, checked: boolean) => {
    const newToppings = checked 
      ? [...customization.extraToppings, toppingId]
      : customization.extraToppings.filter(id => id !== toppingId);
    
    const newCustomization = { 
      ...customization, 
      extraToppings: newToppings 
    };
    newCustomization.totalPrice = calculateTotalPrice(customization.size, newToppings);
    setCustomization(newCustomization);
  };

  const handleAddToCart = () => {
    onAddToCart(customization);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl">Customize {dish.name}</CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
          <div className="flex items-center gap-3">
            <img 
              src={getImageUrl(dish.image)} 
              alt={dish.name}
              className="w-16 h-16 rounded-lg object-cover"
            />
            <div>
              <p className="text-sm text-muted-foreground">{dish.description}</p>
              <p className="font-semibold text-primary">Base Price: ₹{dish.price}</p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Size Selection */}
          <div>
            <h3 className="font-semibold mb-3">Size</h3>
            <RadioGroup 
              value={customization.size} 
              onValueChange={handleSizeChange}
              className="grid grid-cols-2 gap-3"
            >
              {CUSTOMIZATION_OPTIONS.sizes.map((size) => (
                <div key={size.id} className="flex items-center space-x-2">
                  <RadioGroupItem value={size.id} id={size.id} />
                  <Label htmlFor={size.id} className="flex-1 cursor-pointer">
                    <div className="flex justify-between items-center">
                      <span>{size.label}</span>
                      {size.priceModifier > 0 && (
                        <Badge variant="secondary">+₹{size.priceModifier}</Badge>
                      )}
                    </div>
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          <Separator />

          {/* Spice Level */}
          <div>
            <h3 className="font-semibold mb-3">Spice Level</h3>
            <RadioGroup 
              value={customization.spiceLevel} 
              onValueChange={handleSpiceLevelChange}
              className="grid grid-cols-3 gap-3"
            >
              {CUSTOMIZATION_OPTIONS.spiceLevels.map((level) => (
                <div key={level.id} className="flex items-center space-x-2">
                  <RadioGroupItem value={level.id} id={level.id} />
                  <Label htmlFor={level.id} className="cursor-pointer text-center">
                    <div className="flex flex-col items-center">
                      <span className="text-lg">{level.icon}</span>
                      <span className="text-sm">{level.label}</span>
                    </div>
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          <Separator />

          {/* Extra Toppings */}
          <div>
            <h3 className="font-semibold mb-3">Extra Toppings</h3>
            <div className="grid grid-cols-2 gap-3">
              {CUSTOMIZATION_OPTIONS.extraToppings.map((topping) => (
                <div key={topping.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={topping.id}
                    checked={customization.extraToppings.includes(topping.id)}
                    onCheckedChange={(checked) => handleToppingToggle(topping.id, checked as boolean)}
                  />
                  <Label htmlFor={topping.id} className="flex-1 cursor-pointer">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">{topping.label}</span>
                      <Badge variant="outline">+₹{topping.price}</Badge>
                    </div>
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Total Price */}
          <div className="bg-muted p-4 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="font-semibold">Total Price:</span>
              <span className="text-xl font-bold text-primary">₹{customization.totalPrice}</span>
            </div>
          </div>

          {/* Add to Cart Button */}
          <Button onClick={handleAddToCart} className="w-full btn-accent">
            <Plus className="w-4 h-4 mr-2" />
            Add to Cart - ₹{customization.totalPrice}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};