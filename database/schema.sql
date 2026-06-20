-- database/schema.sql
-- Aa file ek vaar manually run karvani chhe (pgAdmin, psql, ke Neon console ma)
-- jethi users table database ma ban jaay.

CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
