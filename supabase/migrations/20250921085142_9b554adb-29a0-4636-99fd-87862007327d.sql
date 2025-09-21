-- Update menu items to use proper image imports
UPDATE menu_items 
SET image = CASE
  WHEN name = 'Margherita Pizza' THEN 'margherita-pizza.jpg'
  WHEN name = 'Pepperoni Pizza' THEN 'pepperoni-pizza.jpg'
  WHEN name = 'Veggie Supreme' THEN 'veggie-pizza.jpg'
  WHEN name = 'Chicken BBQ' THEN 'bbq-pizza.jpg'
  WHEN name = 'Classic Burger' THEN 'classic-burger.jpg'
  WHEN name = 'Chicken Deluxe' THEN 'chicken-burger.jpg'
  WHEN name = 'Cheese Burger' THEN 'cheese-burger.jpg'
  ELSE image
END;

-- Add nutritional information to menu items
ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS calories INTEGER DEFAULT 0;
ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS protein INTEGER DEFAULT 0;
ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS carbs INTEGER DEFAULT 0;
ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS fat INTEGER DEFAULT 0;

-- Update with realistic nutrition data
UPDATE menu_items 
SET 
  calories = CASE
    WHEN name = 'Margherita Pizza' THEN 280
    WHEN name = 'Pepperoni Pizza' THEN 320
    WHEN name = 'Veggie Supreme' THEN 250
    WHEN name = 'Chicken BBQ' THEN 350
    WHEN name = 'Classic Burger' THEN 540
    WHEN name = 'Chicken Deluxe' THEN 680
    WHEN name = 'Cheese Burger' THEN 600
    ELSE 300
  END,
  protein = CASE
    WHEN name = 'Margherita Pizza' THEN 12
    WHEN name = 'Pepperoni Pizza' THEN 15
    WHEN name = 'Veggie Supreme' THEN 10
    WHEN name = 'Chicken BBQ' THEN 25
    WHEN name = 'Classic Burger' THEN 28
    WHEN name = 'Chicken Deluxe' THEN 35
    WHEN name = 'Cheese Burger' THEN 30
    ELSE 15
  END,
  carbs = CASE
    WHEN name = 'Margherita Pizza' THEN 30
    WHEN name = 'Pepperoni Pizza' THEN 32
    WHEN name = 'Veggie Supreme' THEN 28
    WHEN name = 'Chicken BBQ' THEN 35
    WHEN name = 'Classic Burger' THEN 45
    WHEN name = 'Chicken Deluxe' THEN 50
    WHEN name = 'Cheese Burger' THEN 48
    ELSE 35
  END,
  fat = CASE
    WHEN name = 'Margherita Pizza' THEN 10
    WHEN name = 'Pepperoni Pizza' THEN 14
    WHEN name = 'Veggie Supreme' THEN 8
    WHEN name = 'Chicken BBQ' THEN 12
    WHEN name = 'Classic Burger' THEN 24
    WHEN name = 'Chicken Deluxe' THEN 28
    WHEN name = 'Cheese Burger' THEN 26
    ELSE 15
  END;