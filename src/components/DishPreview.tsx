import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { X, Eye, ChevronLeft, ChevronRight } from 'lucide-react';
import { MenuItem } from '@/lib/supabase-service';

// Import real dish images
import margheritaReal1 from '@/assets/margherita-real-1.jpg';
import margheritaReal2 from '@/assets/margherita-real-2.jpg';
import margheritaReal3 from '@/assets/margherita-real-3.jpg';
import pepperoniReal1 from '@/assets/pepperoni-real-1.jpg';
import pepperoniReal2 from '@/assets/pepperoni-real-2.jpg';
import pepperoniReal3 from '@/assets/pepperoni-real-3.jpg';
import burgerReal1 from '@/assets/burger-real-1.jpg';
import burgerReal2 from '@/assets/burger-real-2.jpg';
import burgerReal3 from '@/assets/burger-real-3.jpg';
import veggieReal1 from '@/assets/veggie-real-1.jpg';
import veggieReal2 from '@/assets/veggie-real-2.jpg';
import veggieReal3 from '@/assets/veggie-real-3.jpg';

import { getImageUrl } from '@/lib/images';

interface DishPreviewProps {
  dish: MenuItem;
  onClose: () => void;
}

// Map dish names to real food images
const DISH_3D_IMAGES: Record<string, string[]> = {
  'Margherita Pizza': [margheritaReal1, margheritaReal2, margheritaReal3],
  'Pepperoni Pizza': [pepperoniReal1, pepperoniReal2, pepperoniReal3],
  'Veggie Supreme': [veggieReal1, veggieReal2, veggieReal3],
  'Classic Burger': [burgerReal1, burgerReal2, burgerReal3],
  'Chicken Deluxe': [burgerReal2, burgerReal3, burgerReal1],
  'Chicken BBQ': [burgerReal3, burgerReal1, burgerReal2],
};

export const DishPreview = ({ dish, onClose }: DishPreviewProps) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [viewMode, setViewMode] = useState<'2d' | '3d'>('2d');
  
  const images3D = DISH_3D_IMAGES[dish.name] || [margheritaReal1, margheritaReal2, margheritaReal3];
  const currentImages = viewMode === '3d' ? images3D : [getImageUrl(dish.image)];

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % currentImages.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + currentImages.length) % currentImages.length);
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-hidden">
        <CardContent className="p-0">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b bg-card">
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-bold">{dish.name}</h2>
              <Badge variant="secondary">{dish.category}</Badge>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === '2d' ? 'default' : 'outline'}
                size="sm"
                onClick={() => {
                  setViewMode('2d');
                  setCurrentImageIndex(0);
                }}
              >
                2D View
              </Button>
              <Button
                variant={viewMode === '3d' ? 'default' : 'outline'}
                size="sm"
                onClick={() => {
                  setViewMode('3d');
                  setCurrentImageIndex(0);
                }}
              >
                <Eye className="w-4 h-4 mr-1" />
                3D View
              </Button>
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Image Viewer */}
          <div className="relative">
            <div className="aspect-video bg-muted overflow-hidden">
              <img
                src={currentImages[currentImageIndex]}
                alt={`${dish.name} - ${viewMode.toUpperCase()} view`}
                className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
              />
              
              {/* Image Navigation */}
              {currentImages.length > 1 && (
                <>
                  <Button
                    variant="secondary"
                    size="sm"
                    className="absolute left-4 top-1/2 -translate-y-1/2 opacity-80 hover:opacity-100"
                    onClick={prevImage}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    className="absolute right-4 top-1/2 -translate-y-1/2 opacity-80 hover:opacity-100"
                    onClick={nextImage}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                  
                  {/* Image Indicators */}
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                    {currentImages.map((_, index) => (
                      <button
                        key={index}
                        className={`w-2 h-2 rounded-full transition-colors ${
                          index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                        }`}
                        onClick={() => setCurrentImageIndex(index)}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* View Mode Badge */}
            <Badge
              variant="secondary"
              className="absolute top-4 left-4 bg-black/50 text-white"
            >
              {viewMode.toUpperCase()} View {currentImageIndex + 1}/{currentImages.length}
            </Badge>
          </div>

          {/* Details */}
          <div className="p-6 space-y-4">
            <div>
              <p className="text-muted-foreground mb-2">{dish.description}</p>
              <p className="text-2xl font-bold text-primary">₹{dish.price}</p>
            </div>

            {viewMode === '3d' && (
              <div className="bg-muted/50 p-3 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  📸 <strong>Real Dish Preview:</strong> These are actual photos of our dishes! 
                  Navigate through multiple angles to see exactly how your food will look. 
                  All images are downloaded and work offline for a seamless experience.
                </p>
              </div>
            )}

            <div className="flex gap-4 text-sm text-muted-foreground">
              <div>
                <strong>Category:</strong> {dish.category}
              </div>
              <div>
                <strong>Prep Time:</strong> 15-20 minutes
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};