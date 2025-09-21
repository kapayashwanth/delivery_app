-- First, let's create proper RLS policies for role-based access
-- Drop existing overly permissive policies
DROP POLICY IF EXISTS "Allow all operations on restaurants" ON public.restaurants;
DROP POLICY IF EXISTS "Allow all operations on menu_items" ON public.menu_items;
DROP POLICY IF EXISTS "Allow all operations on orders" ON public.orders;

-- Create role-based policies for restaurants table
CREATE POLICY "Everyone can view restaurants" ON public.restaurants
FOR SELECT USING (true);

CREATE POLICY "Restaurant owners can update their own restaurant" ON public.restaurants
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.user_id = auth.uid() 
    AND profiles.role = 'restaurant' 
    AND profiles.restaurant_id = restaurants.id
  )
);

-- Create role-based policies for menu_items table
CREATE POLICY "Everyone can view menu items" ON public.menu_items
FOR SELECT USING (true);

CREATE POLICY "Restaurant owners can manage their menu items" ON public.menu_items
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.user_id = auth.uid() 
    AND profiles.role = 'restaurant' 
    AND profiles.restaurant_id = menu_items.restaurant_id
  )
);

-- Create role-based policies for orders table
CREATE POLICY "Customers can view their own orders" ON public.orders
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.user_id = auth.uid() 
    AND profiles.role = 'customer'
  )
);

CREATE POLICY "Restaurant owners can view orders for their restaurant" ON public.orders
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.user_id = auth.uid() 
    AND profiles.role = 'restaurant' 
    AND profiles.restaurant_id = orders.restaurant_id
  )
);

CREATE POLICY "Delivery agents can view available orders" ON public.orders
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.user_id = auth.uid() 
    AND profiles.role = 'delivery'
  )
);

CREATE POLICY "Restaurant owners can update order status" ON public.orders
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.user_id = auth.uid() 
    AND profiles.role = 'restaurant' 
    AND profiles.restaurant_id = orders.restaurant_id
  )
);

CREATE POLICY "Delivery agents can update assigned orders" ON public.orders
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.user_id = auth.uid() 
    AND profiles.role = 'delivery'
    AND orders.delivery_agent_id = auth.uid()::text
  )
);

CREATE POLICY "Customers can create orders" ON public.orders
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.user_id = auth.uid() 
    AND profiles.role = 'customer'
  )
);

-- Update restaurants with proper image references
UPDATE public.restaurants 
SET image = CASE
  WHEN name = 'Pizza Palace' THEN 'pizza-palace-hero.jpg'
  WHEN name = 'Burger Barn' THEN 'burger-barn-hero.jpg'
  ELSE image
END;