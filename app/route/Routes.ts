// app/route/Routes.ts
// Aa ek central file chhe - badha routes ahi j define thashe.

import { Router } from "express";
import { login } from "../controller/authController";

const router = Router();

router.post("/login", login);

export default router;
