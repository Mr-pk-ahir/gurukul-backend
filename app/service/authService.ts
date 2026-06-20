// app/service/authService.ts
// Business logic ahi hoy chhe - database query chalave chhe,
// password check kare chhe, JWT token banave chhe.

import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import pool from "../db/database";

interface LoginResult {
  success: boolean;
  message: string;
  token?: string;
  user?: { id: number; username: string };
}

export const loginUser = async (
  username: string,
  password: string
): Promise<LoginResult> => {
  // database/authQueries.sql ma aa j query reference mate lakheli chhe
  const query = "SELECT id, username, password FROM users WHERE username = $1";
  const result = await pool.query(query, [username]);

  if (result.rows.length === 0) {
    return { success: false, message: "Username ke password khotu chhe" };
  }

  const user = result.rows[0];

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    return { success: false, message: "Username ke password khotu chhe" };
  }

  const token = jwt.sign(
    { id: user.id, username: user.username },
    process.env.JWT_SECRET as string,
    { expiresIn: "7d" }
  );

  return {
    success: true,
    message: "Login successful",
    token,
    user: { id: user.id, username: user.username },
  };
};
