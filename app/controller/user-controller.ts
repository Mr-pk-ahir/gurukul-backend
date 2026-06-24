import { Request, Response } from "express";
import { UserService } from "../service/user-service";
import { RoleService } from "../service/role-service"; 
import bcrypt from "bcrypt";

const userService = new UserService();

export class UserController {

  // 🔑 ૧. Login Controller (No JWT, Direct Session/User Object)
  public async loginUser(req: Request, res: Response): Promise<Response> {
    try {
      const { username, password } = req.body;

      // યુઝરનેમ અને પાસવર્ડ ચેક
      if (!username || !password) {
        return res.status(400).json({ success: false, message: "Username and password are required." });
      }

      // 🌟 Super Admin Bypass Shortcut
      if (username === "super-admin" && password === "admin123") {
        return res.status(200).json({
          success: true,
          message: "Login successful! (Super Admin Bypass)",
          user: { 
            suid: "ADMIN101", 
            name: "Super Admin", 
            username: "super-admin", 
            avatar: "admin_avatar.png",
            roleName: "Super Admin",
            roleCode: "ROLE_SUPER_ADMIN",
            departmentId: 4,
            permissions: {
              "Users": { create: true, edit: true, view: true, delete: true },
              "Department": { create: true, edit: true, view: true, delete: true },
              "Roles & Permissions": { create: true, edit: true, view: true, delete: true },
              "overview-management": { create: true, edit: true, view: true, delete: true }
            }
          }
        });
      }

      const user = await userService.findUserByUsername(username);
      if (!user) {
        return res.status(401).json({ success: false, message: "Invalid Username or Password." });
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({ success: false, message: "Invalid Username or Password." });
      }

      // સ્ટેટસ ચેક (જો કોઈ યુઝર બ્લોક હોય તો)
      if (user.status !== "APPROVED") {
        return res.status(403).json({ success: false, message: "Your account is not approved or inactive." });
      }

      // રોલ કોડ પ્રમાણે ડેટાબેઝમાંથી પરમિશન્સ લાવવી
      const userRoleCode = user.roleCode || "HEAD100"; 
      const permissions = await RoleService.getRolePermissions(userRoleCode);

      return res.status(200).json({
        success: true,
        message: "Login successful!",
        user: { 
          suid: user.suid, 
          name: user.name, 
          username: user.username, 
          avatar: user.avatar,
          roleName: user.roleName || "Teacher",
          roleCode: userRoleCode,
          departmentId: user.departmentId || 10,
          permissions: permissions || {} 
        }
      });

    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  // 🔍 ૨. Fetch All Users Controller (ડેશબોર્ડમાં યુઝર્સનું લિસ્ટ બતાવવા માટે)
  public async allUser(req: Request, res: Response): Promise<Response> {
    try {
      const users = await userService.getAllUsers();
      return res.status(200).json({ success: true, message: "All users fetched successfully.", data: users });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message || "Internal Server Error" });
    }
  }
}