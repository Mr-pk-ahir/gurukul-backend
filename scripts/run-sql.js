const fs = require("fs");
const path = require("path");
const { Pool } = require("pg");
require("dotenv").config();

const sqlFileArg = process.argv[2];

if (!sqlFileArg) {
  console.error("Usage: node scripts/run-sql.js <path-to-sql-file>");
  process.exit(1);
}

const sqlFilePath = path.resolve(process.cwd(), sqlFileArg);

if (!fs.existsSync(sqlFilePath)) {
  console.error(`SQL file not found: ${sqlFilePath}`);
  process.exit(1);
}

const sql = fs.readFileSync(sqlFilePath, "utf8");

const connectionString = process.env.DATABASE_URL;
const pool = new Pool(
  connectionString
    ? {
        connectionString,
        ssl: connectionString.includes("neon.tech")
          ? { rejectUnauthorized: false }
          : undefined,
      }
    : {
        user: process.env.DB_USER || "postgres",
        host: process.env.DB_HOST || "localhost",
        database: process.env.DB_NAME || process.env.PGDATABASE || "gurukul_db",
        password: process.env.DB_USER_PASSWORD || "postgres",
        port: Number(process.env.DB_PORT) || 5432,
      }
);

(async () => {
  const client = await pool.connect();

  try {
    console.log(`Running SQL from ${path.relative(process.cwd(), sqlFilePath)}...`);
    await client.query(sql);
    console.log("SQL executed successfully.");
  } catch (error) {
    console.error("Failed to execute SQL:", error.message);
    process.exitCode = 1;
  } finally {
    client.release();
    await pool.end();
  }
})();
