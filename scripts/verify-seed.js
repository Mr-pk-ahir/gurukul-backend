const { Pool } = require('pg');
require('dotenv').config();

const connectionString = process.env.DATABASE_URL;
const pool = new Pool(
  connectionString
    ? {
        connectionString,
        ssl: connectionString.includes('neon.tech') ? { rejectUnauthorized: false } : undefined,
      }
    : {
        user: process.env.DB_USER || 'postgres',
        host: process.env.DB_HOST || 'localhost',
        database: process.env.DB_NAME || process.env.PGDATABASE || 'gurukul_db',
        password: process.env.DB_USER_PASSWORD || 'postgres',
        port: Number(process.env.DB_PORT) || 5432,
      }
);

(async () => {
  const client = await pool.connect();
  try {
    const roles = await client.query('SELECT role_code, role_name FROM roles ORDER BY role_code');
    const users = await client.query('SELECT username, role_code, status FROM users WHERE username = $1', ['super-admin']);
    console.log(JSON.stringify({ roles: roles.rows, users: users.rows }, null, 2));
  } finally {
    client.release();
    await pool.end();
  }
})();
