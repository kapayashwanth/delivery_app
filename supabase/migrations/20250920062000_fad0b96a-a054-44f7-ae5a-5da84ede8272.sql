-- Create restaurants table
CREATE TABLE public.restaurants (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  image TEXT NOT NULL,
  cuisine TEXT NOT NULL,
  rating DECIMAL(2,1) NOT NULL DEFAULT 4.0,
  delivery_time TEXT NOT NULL,
  delivery_fee INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create menu_items table
CREATE TABLE public.menu_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  price INTEGER NOT NULL,
  image TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'main',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create orders table
CREATE TABLE public.orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_address TEXT NOT NULL,
  restaurant_id UUID NOT NULL REFERENCES public.restaurants(id),
  items JSONB NOT NULL,
  total INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  delivery_agent_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security (but allow all access for testing)
ALTER TABLE public.restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Create permissive policies for testing (no auth required)
CREATE POLICY "Allow all operations on restaurants" 
ON public.restaurants 
FOR ALL 
USING (true) 
WITH CHECK (true);

CREATE POLICY "Allow all operations on menu_items" 
ON public.menu_items 
FOR ALL 
USING (true) 
WITH CHECK (true);

CREATE POLICY "Allow all operations on orders" 
ON public.orders 
FOR ALL 
USING (true) 
WITH CHECK (true);

-- Enable realtime for all tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.restaurants;
ALTER PUBLICATION supabase_realtime ADD TABLE public.menu_items;
ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;

-- Set replica identity for realtime updates
ALTER TABLE public.restaurants REPLICA IDENTITY FULL;
ALTER TABLE public.menu_items REPLICA IDENTITY FULL;
ALTER TABLE public.orders REPLICA IDENTITY FULL;

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_restaurants_updated_at
BEFORE UPDATE ON public.restaurants
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_menu_items_updated_at
BEFORE UPDATE ON public.menu_items
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_orders_updated_at
BEFORE UPDATE ON public.orders
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert demo restaurants with higher prices
INSERT INTO public.restaurants (id, name, image, cuisine, rating, delivery_time, delivery_fee) VALUES
('11111111-1111-1111-1111-111111111111', 'Pizza Palace', '/src/assets/pizza-palace.jpg', 'Italian', 4.5, '25-30 min', 199),
('22222222-2222-2222-2222-222222222222', 'Burger Barn', '/src/assets/burger-barn.jpg', 'American', 4.2, '20-25 min', 149);

-- Insert demo menu items with higher prices (in hundreds)
INSERT INTO public.menu_items (restaurant_id, name, description, price, image, category) VALUES
-- Pizza Palace items
('11111111-1111-1111-1111-111111111111', 'Margherita Pizza', 'Fresh tomatoes, mozzarella, and basil', 599, '/src/assets/margherita-pizza.jpg', 'pizza'),
('11111111-1111-1111-1111-111111111111', 'Pepperoni Pizza', 'Pepperoni with mozzarella cheese', 699, '/src/assets/pepperoni-pizza.jpg', 'pizza'),
('11111111-1111-1111-1111-111111111111', 'Veggie Supreme', 'Bell peppers, onions, mushrooms, olives', 799, '/src/assets/margherita-pizza.jpg', 'pizza'),
('11111111-1111-1111-1111-111111111111', 'Chicken BBQ', 'BBQ chicken with red onions and cilantro', 899, '/src/assets/pepperoni-pizza.jpg', 'pizza'),

-- Burger Barn items  
('22222222-2222-2222-2222-222222222222', 'Classic Burger', 'Beef patty with lettuce, tomato, and cheese', 499, '/src/assets/classic-burger.jpg', 'burger'),
('22222222-2222-2222-2222-222222222222', 'Chicken Deluxe', 'Grilled chicken with avocado and bacon', 649, '/src/assets/classic-burger.jpg', 'burger'),
('22222222-2222-2222-2222-222222222222', 'Veggie Burger', 'Plant-based patty with fresh vegetables', 549, '/src/assets/classic-burger.jpg', 'burger'),
('22222222-2222-2222-2222-222222222222', 'Double Cheese', 'Double beef patty with extra cheese', 799, '/src/assets/classic-burger.jpg', 'burger');