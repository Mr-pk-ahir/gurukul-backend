INSERT INTO roles (role_code, role_name, permissions)
VALUES
(
  'SUPER_ADMIN',
  'super-admin',
  jsonb_build_object(
    'Department', jsonb_build_object('create', true, 'edit', true, 'view', true, 'delete', true),
    'Permission', jsonb_build_object('edit', false),
    'Users', jsonb_build_object('create', true, 'edit', true, 'view', true, 'delete', true),
    'Section', jsonb_build_object('create', true, 'edit', true, 'view', true, 'delete', true),
    'Roles & Permissions', jsonb_build_object('create', true, 'edit', true, 'view', true, 'delete', true),
    'overview-management', jsonb_build_object('create', true, 'edit', true, 'view', true, 'delete', true)
  )
),
(
  'HEAD100',
  'department_head',
  jsonb_build_object(
    'Department', jsonb_build_object('create', false, 'edit', false, 'view', false, 'delete', false),
    'Permission', jsonb_build_object('edit', false),
    'Users', jsonb_build_object('create', false, 'edit', false, 'view', false, 'delete', false),
    'Section', jsonb_build_object('create', true, 'edit', true, 'view', true, 'delete', false),
    'Roles & Permissions', jsonb_build_object('create', false, 'edit', false, 'view', false, 'delete', false),
    'overview-management', jsonb_build_object('create', true, 'edit', true, 'view', true, 'delete', false)
  )
),
(
  'USER',
  'user',
  jsonb_build_object(
    'Department', jsonb_build_object('create', false, 'edit', false, 'view', true, 'delete', false),
    'Permission', jsonb_build_object('edit', false),
    'Users', jsonb_build_object('create', false, 'edit', false, 'view', false, 'delete', false),
    'Section', jsonb_build_object('create', false, 'edit', false, 'view', true, 'delete', false),
    'Roles & Permissions', jsonb_build_object('create', false, 'edit', false, 'view', false, 'delete', false),
    'overview-management', jsonb_build_object('create', false, 'edit', false, 'view', true, 'delete', false)
  )
)
ON CONFLICT (role_code) DO UPDATE SET
  role_name = EXCLUDED.role_name,
  permissions = EXCLUDED.permissions;

INSERT INTO users (
  suid, name, username, password, department_id, joining_date, status, role_code
)
VALUES (
  334512,
  '112233',
  'super-admin',
  '$2b$10$OnjfTcPSp6Og6tl5oGdKYeqkM.Z0bggYYnfz0jpTu7KTJV1TncAkS',
  1,
  CURRENT_DATE,
  'APPROVED',
  'SUPER_ADMIN'
)
ON CONFLICT (suid) DO NOTHING;
