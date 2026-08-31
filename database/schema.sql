-- database/schema.sql
-- Full Gurukul database schema for PostgreSQL.
-- Use npm run migration:run to apply the schema + seed, npm run migration:flesh to drop everything.

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
    avatar VARCHAR(1000),
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

CREATE TABLE IF NOT EXISTS groups (
    group_id SERIAL PRIMARY KEY,
    group_name VARCHAR(255) NOT NULL,
    description TEXT,
    member_ids BIGINT[] NOT NULL,
    created_by BIGINT REFERENCES users(suid),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Task banavva mate
CREATE TABLE IF NOT EXISTS tasks (
    task_id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    assigned_to INT NOT NULL,           -- kya user ne assign thayu (users.suid)
    assigned_by INT,                     -- kone assign karyu (section head / dept head)
    section_id INT,                      -- kya section nu (aggregate mate)
    department_id INT,                   -- kya department nu (aggregate mate)
    status VARCHAR(20) DEFAULT 'PENDING', -- PENDING / IN_PROGRESS / COMPLETED
    due_date DATE,
    completed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (assigned_to) REFERENCES users(suid) ON DELETE CASCADE,
    FOREIGN KEY (section_id) REFERENCES sections(section_id) ON DELETE CASCADE,
    FOREIGN KEY (department_id) REFERENCES departments(department_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS overview_images (
    id SERIAL PRIMARY KEY,
    section VARCHAR(50) NOT NULL CHECK (section IN ('heroSlider', 'featureImage', 'smartInfrastructure')),
    url TEXT NOT NULL,
    public_id VARCHAR(255) NOT NULL,
    title TEXT NOT NULL DEFAULT '',
    description TEXT NOT NULL DEFAULT '',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS quotes (
    id SERIAL PRIMARY KEY,
    type VARCHAR(20) NOT NULL CHECK (type IN ('activity', 'event')),
    image_url TEXT NOT NULL,
    public_id VARCHAR(255) NOT NULL,
    title TEXT NOT NULL DEFAULT '',
    description TEXT,
    event_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    name TEXT NOT NULL DEFAULT '',
    display_start_date DATE,
    display_end_date DATE,
    event_start_date DATE,
    event_end_date DATE,
    is_approved VARCHAR(20) DEFAULT 'Pending' CHECK (is_approved IN ('Approved', 'Rejected', 'Pending')),
    status VARCHAR(20) DEFAULT 'Active' CHECK (status IN ('Active', 'Inactive')),
    add_to_hero VARCHAR(3) DEFAULT 'No' CHECK (add_to_hero IN ('Yes', 'No'))
);

ALTER TABLE quotes ADD COLUMN IF NOT EXISTS name TEXT;
ALTER TABLE quotes ADD COLUMN IF NOT EXISTS display_start_date DATE;
ALTER TABLE quotes ADD COLUMN IF NOT EXISTS display_end_date DATE;
ALTER TABLE quotes ADD COLUMN IF NOT EXISTS event_start_date DATE;
ALTER TABLE quotes ADD COLUMN IF NOT EXISTS event_end_date DATE;
ALTER TABLE quotes ADD COLUMN IF NOT EXISTS is_approved VARCHAR(20) DEFAULT 'Pending';
ALTER TABLE quotes ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'Active';
ALTER TABLE quotes ADD COLUMN IF NOT EXISTS add_to_hero VARCHAR(3) DEFAULT 'No';
UPDATE quotes SET name = COALESCE(NULLIF(name, ''), title, 'Untitled event') WHERE name IS NULL OR name = '';
UPDATE quotes SET display_start_date = COALESCE(display_start_date, event_date),
    display_end_date = COALESCE(display_end_date, event_date),
    event_start_date = COALESCE(event_start_date, event_date),
    event_end_date = COALESCE(event_end_date, event_date),
    is_approved = COALESCE(is_approved, 'Pending'),
    status = COALESCE(status, 'Active'),
    add_to_hero = COALESCE(add_to_hero, 'No');
ALTER TABLE quotes ALTER COLUMN name SET NOT NULL;

CREATE INDEX IF NOT EXISTS idx_quotes_type ON quotes(type);
CREATE INDEX IF NOT EXISTS idx_quotes_date ON quotes(event_date);

-- =========================================================================
-- 🌅 DAILY DARSHAN TABLE — Amrut Nu Aachaman ni j pattern follow kari
-- =========================================================================

-- =========================================================================
-- 🌅 DAILY DARSHAN TABLE — Amrut Nu Aachaman ni j pattern follow kari
-- =========================================================================

CREATE TABLE IF NOT EXISTS daily_darshan (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    image_url VARCHAR(500) NOT NULL,
    description TEXT,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

DROP TRIGGER IF EXISTS update_daily_darshan_modtime ON daily_darshan;
CREATE TRIGGER update_daily_darshan_modtime BEFORE UPDATE ON daily_darshan FOR EACH ROW EXECUTE PROCEDURE update_modified_column();

CREATE INDEX IF NOT EXISTS idx_daily_darshan_date ON daily_darshan(date);

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
CREATE INDEX IF NOT EXISTS idx_overview_images_section ON overview_images(section);

CREATE INDEX IF NOT EXISTS idx_tasks_assigned_to ON tasks(assigned_to);
CREATE INDEX IF NOT EXISTS idx_tasks_section ON tasks(section_id);
CREATE INDEX IF NOT EXISTS idx_tasks_department ON tasks(department_id);