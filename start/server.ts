import path from 'path';
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import routes from "../app/route/Routes";
import { connectDB } from "../app/db/database";

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

connectDB();
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

app.use(express.json());

app.use("/", routes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});