import { Request, Response } from "express";
import { UserService } from "../service/user-service";
import { RoleService } from "../service/role-service";
import { UserCreate } from "../module/user-module";
import bcrypt from "bcrypt";

const userService = new UserService();

export class UserController {

  // 📝 ૧. Register Controller
  public async registerUser(req: Request, res: Response): Promise<Response> {
    try {
      const userData: UserCreate = req.body;

      if (!userData.suid || !userData.name || !userData.username || !userData.password || !userData.joiningDate) {
        return res.status(400).json({
          success: false,
          message: "Required fields (suid, name, username, password, joiningDate) are missing."
        });
      }

      const newUser = await userService.createUser(userData);
      return res.status(201).json({ success: true, message: "User registered successfully!", data: newUser });

    } catch (error: any) {
      if (error.code === "23505") {
        return res.status(400).json({ success: false, message: "Username or SUID already exists." });
      }
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  // 🔑 ૨. Login Controller (હવે સુપર-એડમિન પણ DB માંથી જ ચેક થશે - No JWT)
  public async loginUser(req: Request, res: Response): Promise<Response> {
    try {
      const { username, password } = req.body;

      if (!username || !password) {
        return res.status(400).json({
          success: false,
          message: "Username and password are required.",
        });
      }

      // 🔍 Find User
      const user = await userService.findUserByUsername(username);

      console.log("====================================");
      console.log("Login Attempt");
      console.log("Username:", username);
      console.log("Password:", password);
      console.log("User From DB:", user);
      console.log("====================================");

      if (!user) {
        return res.status(401).json({
          success: false,
          message: "Invalid Username or Password.",
        });
      }

      // 🔐 Password Verification
      let isPasswordValid = false;

      // Hashed Password
      if (
        typeof user.password === "string" &&
        user.password.startsWith("$2")
      ) {
        isPasswordValid = await bcrypt.compare(password, user.password);
      }
      // Plain Password (Temporary Support)
      else {
        isPasswordValid = password === user.password;
      }

      console.log("Password Valid:", isPasswordValid);

      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          message: "Invalid Username or Password.",
        });
      }

      // ✅ Status Check
      if (user.status !== "APPROVED") {
        return res.status(403).json({
          success: false,
          message: "Your account is pending approval.",
        });
      }

      // 🎯 Role Code
      const userRoleCode = user.roleCode;

      // 🔐 Permissions
      const permissions =
        await RoleService.getRolePermissions(userRoleCode);

      console.log(
        `✅ Login Success : ${username} (${userRoleCode})`
      );

      return res.status(200).json({
        success: true,
        message: "Login Successful",
        user: {
          suid: user.suid,
          name: user.name,
          username: user.username,
          avatar: user.avatar,
          roleName: user.roleName,
          roleCode: userRoleCode,
          departmentId: user.departmentId,
          permissions: permissions || {},
        },
      });
    } catch (error: any) {
      console.error("Login Error:", error);

      return res.status(500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }

  // 🔍 ૩. Fetch All Users Controller
  public async allUser(req: Request, res: Response): Promise<Response> {
    try {
      const users = await userService.getAllUsers();
      return res.status(200).json({ success: true, message: "All users fetched successfully.", data: users });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message || "Internal Server Error" });
    }
  }
}