-- First, let's clean up any existing auth users for demo accounts to avoid conflicts
DELETE FROM auth.users WHERE email IN ('restaurant@foodflow.com', 'delivery@foodflow.com');

-- Create the demo auth users properly
INSERT INTO auth.users (
  id, 
  email, 
  encrypted_password, 
  email_confirmed_at, 
  created_at, 
  updated_at,
  raw_user_meta_data,
  confirmation_token,
  email_change_token_new,
  recovery_token
) VALUES 
(
  '550e8400-e29b-41d4-a716-446655440001'::uuid,
  'restaurant@foodflow.com',
  crypt('demo123', gen_salt('bf')),
  now(),
  now(),
  now(),
  '{"full_name": "Pizza Palace Manager", "role": "restaurant"}'::jsonb,
  '',
  '',
  ''
),
(
  '550e8400-e29b-41d4-a716-446655440002'::uuid,
  'delivery@foodflow.com', 
  crypt('demo123', gen_salt('bf')),
  now(),
  now(),
  now(),
  '{"full_name": "Delivery Agent", "role": "delivery"}'::jsonb,
  '',
  '',
  ''
);