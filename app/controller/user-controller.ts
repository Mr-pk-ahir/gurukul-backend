// 📂 ફાઈલ પાથ: app/controller/user-controller.ts

import { Request, Response } from "express";
import { UserService } from "../service/user-service";
import { RoleService } from "../service/role-service"; // 🎯 પરમિશન લાવવા માટે રોલ સર્વિસ ઇમ્પોર્ટ કરી
import { UserCreate } from "../module/user-module";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const userService = new UserService();
const JWT_SECRET = process.env.JWT_SECRET || "your_super_secret_jwt_key_123";

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

  // 🔑 ૨. Login Controller (નવા રોલ અને ડાયનેમિક પરમિશન સેટઅપ સાથે)
  public async loginUser(req: Request, res: Response): Promise<Response> {
    try {
      const { username, password } = req.body;

      if (!username || !password) {
        return res.status(400).json({ success: false, message: "Username and password are required." });
      }

      // 🌟 શોર્ટકટ: જો super-admin લોગિન કરે, તો ડેટાબેઝ ચેક કર્યા વગર સીધો જ ફૂલ પરમિશન વાળો ડેટા મોકલો!
      if (username === "super-admin" && password === "admin123") {
        // 🎯 મિડલવેર ચેક કરી શકે તે માટે ટોકનમાં 'roleCode' એડ કર્યો
        const token = jwt.sign(
          { suid: "ADMIN101", username: "super-admin", roleCode: "ROLE_SUPER_ADMIN" },
          JWT_SECRET,
          { expiresIn: "1d" }
        );

        console.log(`\n🔑 [BYPASS LOGIN] Super Admin Logged In via Shortcut! \nBearer ${token}\n`);

        return res.status(200).json({
          success: true,
          message: "Login successful! (Bypassed via Hardcoded Query)",
          token: token,
          user: { 
            suid: "ADMIN101", 
            name: "Super Admin", 
            username: "super-admin", 
            avatar: "admin_avatar.png",
            roleName: "Super Admin",
            roleCode: "ROLE_SUPER_ADMIN",
            departmentId: 4,
            // ફ્રન્ટએન્ડના નેવબાર માટે બાયપાસ ફૂલ પરમિશન્સ
            permissions: {
              "Users": { create: true, edit: true, view: true, delete: true },
              "Department": { create: true, edit: true, view: true, delete: true },
              "Roles & Permissions": { create: true, edit: true, view: true, delete: true }
            }
          }
        });
      }

      // -----------------------------------------------------------------
      // જો કોઈ બીજો નોર્મલ યુઝર હોય, તો જ આ નીચેનો ડેટાબેઝ વાળો કોડ ચાલશે
      // -----------------------------------------------------------------
      const user = await userService.findUserByUsername(username);
      if (!user) {
        return res.status(401).json({ success: false, message: "Invalid Username or Password." });
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({ success: false, message: "Invalid Username or Password." });
      }

      if (user.status !== "APPROVED") {
        return res.status(403).json({ success: false, message: "Your account is pending approval or rejected." });
      }

      // 🎯 યુઝરના roleCode ના આધારે ડાયનેમિક પરમિશન્સ મેળવો
      const userRoleCode = user.roleCode || "HEAD100"; 
      const permissions = await RoleService.getRolePermissions(userRoleCode);

      // 🎯 ટોકનની અંદર 'roleCode' પાસ કર્યો જેથી ઇન્ટરસેપ્ટર/મિડલવેર ચેક કરી શકે
      const token = jwt.sign(
        { suid: user.suid, username: user.username, roleCode: userRoleCode },
        JWT_SECRET,
        { expiresIn: "1d" }
      );

      return res.status(200).json({
        success: true,
        message: "Login successful!",
        token: token,
        // ફ્રન્ટએન્ડને જોઈતો આખો કમ્પ્લીટ યુઝર ઓબ્જેક્ટ પરમિશન સાથે
        user: { 
          suid: user.suid, 
          name: user.name, 
          username: user.username, 
          avatar: user.avatar,
          roleName: user.roleName || "Teacher",
          roleCode: userRoleCode,
          departmentId: user.departmentId || 10,
          permissions: permissions || {} // જો ડેટાબેઝમાં ન હોય તો ખાલી ઓબ્જેક્ટ
        }
      });

    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
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