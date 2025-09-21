-- Create demo users if they don't exist
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, raw_user_meta_data, created_at, updated_at)
VALUES 
  ('11111111-1111-1111-1111-111111111111', 'restaurant@foodflow.com', crypt('demo123', gen_salt('bf')), now(), '{"full_name": "Demo Restaurant", "role": "restaurant"}', now(), now()),
  ('22222222-2222-2222-2222-222222222222', 'delivery@foodflow.com', crypt('demo123', gen_salt('bf')), now(), '{"full_name": "Demo Delivery", "role": "delivery"}', now(), now())
ON CONFLICT (id) DO NOTHING;

-- Ensure profiles exist
INSERT INTO public.profiles (user_id, email, full_name, role, restaurant_id)
VALUES 
  ('11111111-1111-1111-1111-111111111111', 'restaurant@foodflow.com', 'Demo Restaurant', 'restaurant', '11111111-1111-1111-1111-111111111111'),
  ('22222222-2222-2222-2222-222222222222', 'delivery@foodflow.com', 'Demo Delivery', 'delivery', null)
ON CONFLICT (user_id) DO UPDATE SET
  email = EXCLUDED.email,
  full_name = EXCLUDED.full_name,
  role = EXCLUDED.role;