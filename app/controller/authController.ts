import { Request, Response } from "express";
import { loginUser } from "../service/authService";

export const login = async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: "Username ane password banne joie" });
    }

    const result = await loginUser(username, password);

    if (!result.success) {
      return res.status(401).json({ message: result.message });
    }

    return res.status(200).json({
      message: result.message,
      user: result.user, 
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ message: "Server ma kaik gadbad thai" });
  }
};
