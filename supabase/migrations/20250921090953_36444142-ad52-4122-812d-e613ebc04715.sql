-- Create demo auth users for restaurant and delivery accounts
-- Note: These will create actual auth users that can log in

-- First, let's update the restaurant images to use the new main images
UPDATE public.restaurants 
SET image = CASE
  WHEN name = 'Pizza Palace' THEN 'pizza-palace-main.jpg'
  WHEN name = 'Burger Barn' THEN 'burger-barn-main.jpg'
  ELSE image
END;