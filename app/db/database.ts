// app/db/database.ts
// PostgreSQL sathe connection pool ahi banele chhe.
// Badhi service files aa pool ne import karine query chalavshe.

import { Pool } from "pg";
import dotenv from "dotenv";

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false, // Neon/Supabase jeva cloud DB mate joie chhe
  },
});

pool.on("connect", () => {
  console.log("Database sathe connect thai gayu");
});

pool.on("error", (err) => {
  console.error("Database connection ma error aavi:", err);
});

export default pool;
