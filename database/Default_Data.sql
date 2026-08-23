INSERT INTO roles (role_code, role_name, description, permissions)
VALUES (
    'HEAD100',
    'department_head',
    NULL,
    '{
        "Users": { "edit": false, "view": false, "create": false, "delete": false },
        "Section": { "edit": true, "view": true, "create": true, "delete": false },
        "Student": { "edit": false, "view": true, "create": true, "delete": false },
        "Dashboard": { "edit": false, "view": true, "create": false, "delete": false },
        "Department": { "edit": false, "view": false, "create": false, "delete": false },
        "Permissions": { "edit": false, "view": false, "create": false, "delete": false },
        "DailyDarshan": { "edit": false, "view": false, "create": false, "delete": false },
        "OverviewEdit": { "edit": false, "view": false, "create": false, "delete": false },
        "AmrutNuAachaman": { "edit": false, "view": false, "create": false, "delete": false },
        "RolesPermissions": { "edit": false, "view": false, "create": false, "delete": false }
    }'::jsonb
)
ON CONFLICT (role_code) DO UPDATE SET
    role_name = EXCLUDED.role_name,
    description = EXCLUDED.description,
    permissions = EXCLUDED.permissions;

INSERT INTO roles (role_code, role_name, description, permissions)
VALUES (
    'SECHEAD101',
    'section_head',
    'Section Head - manages a specific section within a department',
    '{
        "Users": { "edit": false, "view": false, "create": false, "delete": false },
        "Section": { "edit": false, "view": false, "create": false, "delete": false },
        "Student": { "edit": false, "view": false, "create": false, "delete": false },
        "Dashboard": { "edit": false, "view": true, "create": false, "delete": false },
        "Department": { "edit": false, "view": false, "create": false, "delete": false },
        "Permissions": { "edit": false, "view": false, "create": false, "delete": false },
        "DailyDarshan": { "edit": false, "view": false, "create": false, "delete": false },
        "OverviewEdit": { "edit": false, "view": false, "create": false, "delete": false },
        "AmrutNuAachaman": { "edit": false, "view": false, "create": false, "delete": false },
        "RolesPermissions": { "edit": false, "view": false, "create": false, "delete": false }
    }'::jsonb
)
ON CONFLICT (role_code) DO UPDATE SET
    role_name = EXCLUDED.role_name,
    description = EXCLUDED.description,
    permissions = EXCLUDED.permissions;


INSERT INTO roles (role_code, role_name, description, permissions)
VALUES (
    'STUDENT',
    'student',
    'Student account - no admin panel access',
    '{}'::jsonb
)
ON CONFLICT (role_code) DO UPDATE SET
    role_name = EXCLUDED.role_name,
    description = EXCLUDED.description,
    permissions = EXCLUDED.permissions;

INSERT INTO roles (role_code, role_name, description, permissions)
VALUES (
    'SUPER_ADMIN',
    'super-admin',
    NULL,
    '{
        "Users": { "edit": true, "view": true, "create": true, "delete": true },
        "Section": { "edit": true, "view": true, "create": true, "delete": true },
        "Student": { "edit": true, "view": true, "create": true, "delete": true },
        "Dashboard": { "edit": true, "view": true, "create": true, "delete": true },
        "Department": { "edit": true, "view": true, "create": true, "delete": true },
        "Permissions": { "edit": true, "view": true, "create": true, "delete": true },
        "DailyDarshan": { "edit": true, "view": true, "create": true, "delete": true },
        "OverviewEdit": { "edit": true, "view": true, "create": true, "delete": true },
        "AmrutNuAachaman": { "edit": true, "view": true, "create": true, "delete": true },
        "RolesPermissions": { "edit": true, "view": true, "create": true, "delete": true }
    }'::jsonb
)
ON CONFLICT (role_code) DO UPDATE SET
    role_name = EXCLUDED.role_name,
    description = EXCLUDED.description,
    permissions = EXCLUDED.permissions;


INSERT INTO roles (role_code, role_name, description, permissions)
VALUES (
    'USER',
    'user',
    NULL,
    '{
        "Users": { "edit": false, "view": false, "create": false, "delete": false },
        "Section": { "edit": false, "view": false, "create": false, "delete": false },
        "Student": { "edit": false, "view": false, "create": false, "delete": false },
        "Dashboard": { "edit": false, "view": true, "create": false, "delete": false },
        "Department": { "edit": false, "view": false, "create": false, "delete": false },
        "Permissions": { "edit": false, "view": false, "create": false, "delete": false },
        "DailyDarshan": { "edit": false, "view": false, "create": false, "delete": false },
        "OverviewEdit": { "edit": false, "view": false, "create": false, "delete": false },
        "AmrutNuAachaman": { "edit": false, "view": false, "create": false, "delete": false },
        "RolesPermissions": { "edit": false, "view": false, "create": false, "delete": false }
    }'::jsonb
)
ON CONFLICT (role_code) DO UPDATE SET
    role_name = EXCLUDED.role_name,
    description = EXCLUDED.description,
    permissions = EXCLUDED.permissions;


-- 🎯 SUPER_ADMIN — Group module ni badhi permissions true
UPDATE roles
SET permissions = permissions || '{"Group": {"edit": true, "view": true, "create": true, "delete": true}}'::jsonb
WHERE role_code = 'SUPER_ADMIN';

-- 🎯 HEAD100 (department head) — Group module ni create + view true
UPDATE roles
SET permissions = permissions || '{"Group": {"edit": false, "view": true, "create": true, "delete": false}}'::jsonb
WHERE role_code = 'HEAD100';

-- ⚠️ SECHEAD101, STUDENT, USER — Group access NATHI joiti, explicit false rakhyu
UPDATE roles
SET permissions = permissions || '{"Group": {"edit": false, "view": false, "create": false, "delete": false}}'::jsonb
WHERE role_code = 'SECHEAD101';

UPDATE roles
SET permissions = permissions || '{"Group": {"edit": false, "view": false, "create": false, "delete": false}}'::jsonb
WHERE role_code = 'USER';

UPDATE roles
SET permissions = permissions || '{"Group": {"edit": false, "view": false, "create": false, "delete": false}}'::jsonb
WHERE role_code = 'STUDENT';
INSERT INTO users (
    suid,
    name,
    username,
    password,
    department_id,
    joining_date,
    status,
    role_code
)
VALUES (
    334512,
    'Super Admin',
    'super-admin',
    'admin123',
    1,
    CURRENT_DATE,
    'APPROVED',
    'SUPER_ADMIN'
)
ON CONFLICT (suid) DO NOTHING;

INSERT INTO overview_images (section, url, public_id) VALUES
('heroSlider', 'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&q=80&w=1600', 'SEED-hero-1'),
('heroSlider', 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&q=80&w=1600', 'SEED-hero-2'),
('heroSlider', 'https://images.unsplash.com/photo-1616080409883-a96ae084a7e1?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', 'SEED-hero-3')
ON CONFLICT DO NOTHING;