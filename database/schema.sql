-- database/schema.sql
-- Full Gurukul database schema for PostgreSQL.
-- Use npm run db:migrate to apply the schema and npm run db:seed to seed initial data.

CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

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

CREATE TABLE IF NOT EXISTS sections (
    section_id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    department_id INT NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS users (
    suid BIGINT PRIMARY KEY,
    avatar VARCHAR(255),
    name VARCHAR(255) NOT NULL,
    username VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    bod DATE,
    department_id INT,
    section_id INT DEFAULT 0,
    standard_id INT,
    role_code VARCHAR(100) NOT NULL,
    joining_date DATE NOT NULL,
    status VARCHAR(20) DEFAULT 'PENDING' CHECK (status IN ('PENDING','APPROVED')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE users
    ADD CONSTRAINT fk_user_role FOREIGN KEY (role_code) REFERENCES roles(role_code) ON DELETE SET NULL;

ALTER TABLE users
    ADD CONSTRAINT fk_user_department FOREIGN KEY (department_id) REFERENCES departments(department_id) ON DELETE SET NULL;

ALTER TABLE users
    ADD CONSTRAINT fk_user_section FOREIGN KEY (section_id) REFERENCES sections(section_id) ON DELETE SET NULL;

ALTER TABLE departments
    ADD CONSTRAINT fk_department_head FOREIGN KEY (department_head_id) REFERENCES users(suid) ON DELETE SET NULL;

ALTER TABLE sections
    ADD CONSTRAINT fk_section_department FOREIGN KEY (department_id) REFERENCES departments(department_id) ON DELETE CASCADE;
