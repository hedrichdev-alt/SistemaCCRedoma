-- Assigns roles to pre-created users in Supabase Auth.
-- 1. Create the users in the Supabase Auth dashboard first.
-- 2. Run this entire script in the Supabase SQL Editor.

-- Assign SystemDeveloper role to hedrichdev@gmail.com
DO $$
DECLARE
  user_id_dev uuid;
  role_id_dev uuid;
BEGIN
  -- Get the user ID from the email
  SELECT id INTO user_id_dev FROM auth.users WHERE email = 'hedrichdev@gmail.com';

  -- Get the role ID for SystemDeveloper
  SELECT id INTO role_id_dev FROM roles WHERE nombre_rol = 'SystemDeveloper';

  -- Insert into the usuarios table if the user exists and doesn't have a role yet
  IF user_id_dev IS NOT NULL AND role_id_dev IS NOT NULL THEN
    INSERT INTO usuarios (id, rol_id, datos_personales, estado)
    VALUES (user_id_dev, role_id_dev, '{"nombre": "Hedrich", "apellido": "Developer"}', 'activo')
    ON CONFLICT (id) DO NOTHING;
    RAISE NOTICE 'Assigned SystemDeveloper role to hedrichdev@gmail.com';
  ELSE
    RAISE WARNING 'User hedrichdev@gmail.com or role SystemDeveloper not found. Please create the user first.';
  END IF;
END $$;

-- Assign CentroComercialAdmin role to admin@example.com
DO $$
DECLARE
  user_id_admin uuid;
  role_id_admin uuid;
BEGIN
  SELECT id INTO user_id_admin FROM auth.users WHERE email = 'admin@example.com';
  SELECT id INTO role_id_admin FROM roles WHERE nombre_rol = 'CentroComercialAdmin';
  IF user_id_admin IS NOT NULL AND role_id_admin IS NOT NULL THEN
    INSERT INTO usuarios (id, rol_id, datos_personales, estado)
    VALUES (user_id_admin, role_id_admin, '{"nombre": "Admin", "apellido": "User"}', 'activo')
    ON CONFLICT (id) DO NOTHING;
    RAISE NOTICE 'Assigned CentroComercialAdmin role to admin@example.com';
  ELSE
    RAISE WARNING 'User admin@example.com or role CentroComercialAdmin not found. Please create the user first.';
  END IF;
END $$;

-- Assign LocalOwner role to owner@example.com
DO $$
DECLARE
  user_id_owner uuid;
  role_id_owner uuid;
BEGIN
  SELECT id INTO user_id_owner FROM auth.users WHERE email = 'owner@example.com';
  SELECT id INTO role_id_owner FROM roles WHERE nombre_rol = 'LocalOwner';
  IF user_id_owner IS NOT NULL AND role_id_owner IS NOT NULL THEN
    INSERT INTO usuarios (id, rol_id, datos_personales, estado)
    VALUES (user_id_owner, role_id_owner, '{"nombre": "Owner", "apellido": "User"}', 'activo')
    ON CONFLICT (id) DO NOTHING;
    RAISE NOTICE 'Assigned LocalOwner role to owner@example.com';
  ELSE
    RAISE WARNING 'User owner@example.com or role LocalOwner not found. Please create the user first.';
  END IF;
END $$;

-- Assign VisitanteExterno role to visitor@example.com
DO $$
DECLARE
  user_id_visitor uuid;
  role_id_visitor uuid;
BEGIN
  SELECT id INTO user_id_visitor FROM auth.users WHERE email = 'visitor@example.com';
  SELECT id INTO role_id_visitor FROM roles WHERE nombre_rol = 'VisitanteExterno';
  IF user_id_visitor IS NOT NULL AND role_id_visitor IS NOT NULL THEN
    INSERT INTO usuarios (id, rol_id, datos_personales, estado)
    VALUES (user_id_visitor, role_id_visitor, '{"nombre": "Visitor", "apellido": "User"}', 'activo')
    ON CONFLICT (id) DO NOTHING;
    RAISE NOTICE 'Assigned VisitanteExterno role to visitor@example.com';
  ELSE
    RAISE WARNING 'User visitor@example.com or role VisitanteExterno not found. Please create the user first.';
  END IF;
END $$;
