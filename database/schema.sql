-- database/schema.sql
-- Full Gurukul database schema for PostgreSQL.
-- Use npm run db:migrate to apply the schema and npm run db:seed to seed initial data.

-- =========================================================================
-- ⏱️ Trigger Function (updated_at ટાઈમસ્ટામ્પ ઓટોમેટિક અપડેટ કરવા માટે)
-- =========================================================================
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;


-- =========================================================================
-- 📋 TABLES CREATION
-- =========================================================================

CREATE TABLE IF NOT EXISTS modules (
    module_id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    module_code VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS roles (
    role_code VARCHAR(100) PRIMARY KEY,
    role_name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    permissions JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS departments (
    department_id INT PRIMARY KEY,
    department_name VARCHAR(255) UNIQUE NOT NULL,
    department_head_id BIGINT,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 🎯 Default/fallback department — legacy ke unassigned records mate
INSERT INTO departments (department_id, department_name, description)
VALUES (1, 'General / Unassigned', 'Auto-generated default department')
ON CONFLICT (department_id) DO NOTHING;

CREATE TABLE IF NOT EXISTS sections (
    section_id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    department_id INT NOT NULL,
    section_head_id BIGINT,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 🎯 Default/fallback section — legacy ke unassigned records mate
INSERT INTO sections (section_id, name, department_id, description)
VALUES (0, 'Not Assigned', 1, 'Auto-generated dummy section for unassigned/legacy records')
ON CONFLICT (section_id) DO NOTHING;

CREATE TABLE IF NOT EXISTS users (
    suid BIGINT PRIMARY KEY,
    avatar VARCHAR(255),
    name VARCHAR(255) NOT NULL,
    username VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    bod DATE,
    department_id INT,
    section_id INT,
    standard_id INT,
    role_code VARCHAR(100) NOT NULL,
    joining_date DATE,
    status VARCHAR(20) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);


-- =========================================================================
-- 🔗 FOREIGN KEY CONSTRAINTS (idempotent — file re-run thay to error nai aave)
-- =========================================================================

ALTER TABLE users DROP CONSTRAINT IF EXISTS fk_user_role;
ALTER TABLE users ADD CONSTRAINT fk_user_role FOREIGN KEY (role_code) REFERENCES roles(role_code) ON DELETE SET NULL;

ALTER TABLE users DROP CONSTRAINT IF EXISTS fk_user_department;
ALTER TABLE users ADD CONSTRAINT fk_user_department FOREIGN KEY (department_id) REFERENCES departments(department_id) ON DELETE SET NULL;

ALTER TABLE users DROP CONSTRAINT IF EXISTS fk_user_section;
ALTER TABLE users ADD CONSTRAINT fk_user_section FOREIGN KEY (section_id) REFERENCES sections(section_id) ON DELETE SET NULL;

ALTER TABLE departments DROP CONSTRAINT IF EXISTS fk_department_head;
ALTER TABLE departments ADD CONSTRAINT fk_department_head FOREIGN KEY (department_head_id) REFERENCES users(suid) ON DELETE SET NULL;

ALTER TABLE sections DROP CONSTRAINT IF EXISTS fk_section_department;
ALTER TABLE sections ADD CONSTRAINT fk_section_department FOREIGN KEY (department_id) REFERENCES departments(department_id) ON DELETE CASCADE;

ALTER TABLE sections DROP CONSTRAINT IF EXISTS fk_section_head;
ALTER TABLE sections ADD CONSTRAINT fk_section_head FOREIGN KEY (section_head_id) REFERENCES users(suid) ON DELETE SET NULL;


-- =========================================================================
-- ⏱️ TRIGGERS (updated_at ઓટોમેટિક સેટ કરવા માટે)
-- =========================================================================

DROP TRIGGER IF EXISTS update_modules_modtime ON modules;
CREATE TRIGGER update_modules_modtime BEFORE UPDATE ON modules FOR EACH ROW EXECUTE PROCEDURE update_modified_column();

DROP TRIGGER IF EXISTS update_roles_modtime ON roles;
CREATE TRIGGER update_roles_modtime BEFORE UPDATE ON roles FOR EACH ROW EXECUTE PROCEDURE update_modified_column();

DROP TRIGGER IF EXISTS update_departments_modtime ON departments;
CREATE TRIGGER update_departments_modtime BEFORE UPDATE ON departments FOR EACH ROW EXECUTE PROCEDURE update_modified_column();

DROP TRIGGER IF EXISTS update_sections_modtime ON sections;
CREATE TRIGGER update_sections_modtime BEFORE UPDATE ON sections FOR EACH ROW EXECUTE PROCEDURE update_modified_column();

DROP TRIGGER IF EXISTS update_users_modtime ON users;
CREATE TRIGGER update_users_modtime BEFORE UPDATE ON users FOR EACH ROW EXECUTE PROCEDURE update_modified_column();


-- =========================================================================
-- ⚡ INDEXES (ડેટા ફાસ્ટ ફેચ કરવા માટે)
-- =========================================================================

CREATE INDEX IF NOT EXISTS idx_users_role_code ON users(role_code);
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);
CREATE INDEX IF NOT EXISTS idx_departments_name ON departments(department_name);
CREATE INDEX IF NOT EXISTS idx_sections_name ON sections(name);