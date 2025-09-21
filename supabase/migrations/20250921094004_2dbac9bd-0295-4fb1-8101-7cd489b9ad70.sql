-- Fix RLS policies to allow updates without authentication for demo purposes
-- Add public update policy for orders table

-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Restaurant owners can update order status" ON public.orders;
DROP POLICY IF EXISTS "Delivery agents can update assigned orders" ON public.orders;

-- Create a permissive update policy for demo purposes (allows anyone to update)
CREATE POLICY "Allow public updates for demo" 
ON public.orders 
FOR UPDATE 
USING (true);

-- Also ensure public can view all orders for demo
DROP POLICY IF EXISTS "Restaurant owners can view orders for their restaurant" ON public.orders;
DROP POLICY IF EXISTS "Delivery agents can view available orders" ON public.orders; 
DROP POLICY IF EXISTS "Customers can view their own orders" ON public.orders;

-- Create permissive select policy
CREATE POLICY "Allow public reads for demo"
ON public.orders
FOR SELECT
USING (true);