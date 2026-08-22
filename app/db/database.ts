// app/db/database.ts
import { Pool } from "pg";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";

dotenv.config();

const isProduction = process.env.NODE_ENV === "production" || process.env.APP_ORIGIN?.includes("vercel.app");

export let pool: Pool;

if (isProduction) {
    pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: {
            rejectUnauthorized: false,
        },
    });
    console.log("🔗 Running in Production Mode -> Using Neon PostgreSQL Database");
} else {
    pool = new Pool({
        user: process.env.DB_USER || "postgres",
        host: process.env.DB_HOST || "localhost",
        database: process.env.DB_NAME || process.env.PGDATABASE || "gurukul_db",
        password: process.env.DB_USER_PASSWORD || "postgres",
        port: Number(process.env.DB_PORT) || 5432,
    });
    console.log("🔗 Running in Development Mode -> Using Local PostgreSQL Database");
}

export const connectDB = async (): Promise<void> => {
    try {
        await pool.connect();
        console.log("Database connected successfully! 🎉");
    } catch (error: any) {
        console.error("Database Connection Error:", error.message);
        process.exit(1);
    }
};

// 🆕 database/ folder ma thi .sql file read karine pool par execute kare chhe
// app/db/database.ts thi database/ folder root ma chhe -> "../../database"
export const executeSqlFile = async (fileName: string): Promise<void> => {
    try {
        const filePath = path.join(__dirname, "../../database", fileName);
        const sql = fs.readFileSync(filePath, "utf-8");
        await pool.query(sql);
        console.log(`✅ ${fileName} safaltapoorvak run thayu`);
    } catch (error: any) {
        console.error(`❌ ${fileName} run karva ma error:`, error.message);
        throw error;
    }
};