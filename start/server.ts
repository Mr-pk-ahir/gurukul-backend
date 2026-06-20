import dotenv from "dotenv";
dotenv.config();

import express, { Request, Response } from "express";
import routes from "../app/route/Routes";

const app = express();

app.use(express.json());

// Health check route - test karva mate ke server chalu chhe ke nahi
app.get("/", (req: Request, res: Response) => {
  res.json({ message: "Gurukul backend server chalu chhe" });
});

// Badha routes "/api" prefix sathe mount thay chhe
app.use("/api", routes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server http://localhost:${PORT} par chalu chhe`);
});
