import path from 'path';
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import routes from "../app/route/Routes";
import { connectDB } from "../app/db/database";
import { executeSqlFile } from "../app/db/runMigrations";

dotenv.config();

const app = express();

const allowedOrigins = [
  "http://localhost:5173",
  "https://gurukul-flame.vercel.app"
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true
}));

// 🎯 FIX: connectDB() pehla be vaar call thatu hatu (ek .then() sathe, ek plain) — duplicate hatu, kadhi nakhyu.
// 🎯 FIX: filenames actual /database folder na files sathe match karta karya (init-schema.sql / seed-data.sql exist j nahota).
connectDB().then(async () => {
    await executeSqlFile("schema.sql");
    await executeSqlFile("Default_Data.sql");
});

app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// 🎯 FIX: default 100kb limit ne vadhari ne 10mb kari (avatar base64 mate)
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

app.use("/", routes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});