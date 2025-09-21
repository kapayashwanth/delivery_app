-- Update restaurants to use proper image names
UPDATE restaurants 
SET image = CASE
  WHEN name = 'Pizza Palace' THEN 'pizza-palace.jpg'
  WHEN name = 'Burger Barn' THEN 'burger-barn.jpg'
  ELSE image
END;