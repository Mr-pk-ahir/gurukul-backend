// app/db/database.ts
import { Pool } from "pg";
import dotenv from "dotenv";

dotenv.config();

const isProduction = process.env.NODE_ENV === "production" || process.env.APP_ORIGIN?.includes("vercel.app");

export let pool: Pool;

if (isProduction) {
    // 🟢 Production માટે: Neon Database (Online)
    pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: {
            rejectUnauthorized: false,
        },
    });
    console.log("🔗 Running in Production Mode -> Using Neon PostgreSQL Database");
} else {
    // 🟡 Development માટે: Local PostgreSQL
    pool = new Pool({
        user: process.env.DB_USER || "postgres",
        host: process.env.DB_HOST || "localhost",
        database: process.env.DB_NAME || "your_local_db",
        password: process.env.DB_USER_PASSWORD || "your_password",
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