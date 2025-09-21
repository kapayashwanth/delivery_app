// Image imports for offline storage
import margheritaPizza from '@/assets/margherita-pizza.jpg';
import pepperoniPizza from '@/assets/pepperoni-pizza.jpg';
import classicBurger from '@/assets/classic-burger.jpg';
import burgerBarn from '@/assets/burger-barn.jpg';
import pizzaPalace from '@/assets/pizza-palace.jpg';
import pizzaPalaceHero from '@/assets/pizza-palace-hero.jpg';
import burgerBarnHero from '@/assets/burger-barn-hero.jpg';
import pizzaPalaceMain from '@/assets/pizza-palace-main.jpg';
import burgerBarnMain from '@/assets/burger-barn-main.jpg';

// Map of image filenames to imports
export const IMAGE_MAP: Record<string, string> = {
  'margherita-pizza.jpg': margheritaPizza,
  'pepperoni-pizza.jpg': pepperoniPizza,
  'veggie-pizza.jpg': margheritaPizza, // Fallback for veggie pizza
  'bbq-pizza.jpg': pepperoniPizza, // Fallback for BBQ pizza
  'classic-burger.jpg': classicBurger,
  'chicken-burger.jpg': classicBurger, // Fallback for chicken burger
  'cheese-burger.jpg': classicBurger, // Fallback for cheese burger
  'pizza-palace.jpg': pizzaPalace,
  'burger-barn.jpg': burgerBarn,
  'pizza-palace-hero.jpg': pizzaPalaceHero,
  'burger-barn-hero.jpg': burgerBarnHero,
  'pizza-palace-main.jpg': pizzaPalaceMain,
  'burger-barn-main.jpg': burgerBarnMain,
};

// Helper function to get image URL
export const getImageUrl = (imageName: string | null): string => {
  if (!imageName) return margheritaPizza; // Default fallback
  return IMAGE_MAP[imageName] || margheritaPizza;
};