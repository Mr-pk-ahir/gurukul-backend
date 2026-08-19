import { Request, Response } from "express";
import { UserService } from "../service/user-service";

const userService = new UserService();

// 🎯 SECHEAD101 add karyu — section head banva mate department + section
// banne joie chhe (jethi kayu section no head chhe e khabar pade)
const ROLE_FIELD_REQUIREMENTS: Record<string, string[]> = {
    SUPER_ADMIN: [],
    HEAD100: ["departmentId"],
    SECHEAD101: ["departmentId", "sectionId"],
    STUDENT: ["departmentId", "sectionId", "standardId"],
};

const BCRYPT_HASH_REGEX = /^\$2[aby]\$\d{2}\$.{53}$/;

export class UserController {

    public async registerUser(req: Request, res: Response): Promise<Response> {
        try {
            const {
                suid, avatar, name, username, password, bod,
                departmentId, sectionId, standardId, roleCode,
                joiningDate, status
            } = req.body;

            const baseMissing: string[] = [];
            if (!name) baseMissing.push("name");
            if (!username) baseMissing.push("username");
            if (!password) baseMissing.push("password");
            if (!bod) baseMissing.push("bod");
            if (!roleCode) baseMissing.push("roleCode");
            if (!joiningDate) baseMissing.push("joiningDate");

            if (baseMissing.length > 0) {
                return res.status(400).json({
                    success: false,
                    message: `Required fields missing: ${baseMissing.join(", ")}`
                });
            }

            const requiredForRole = ROLE_FIELD_REQUIREMENTS[roleCode] || [];
            const roleMissing: string[] = [];

            if (requiredForRole.includes("departmentId") && !departmentId) {
                roleMissing.push("departmentId");
            }
            if (requiredForRole.includes("sectionId") && !sectionId) {
                roleMissing.push("sectionId");
            }
            if (requiredForRole.includes("standardId") && !standardId) {
                roleMissing.push("standardId");
            }

            if (roleMissing.length > 0) {
                return res.status(400).json({
                    success: false,
                    message: `"${roleCode}" role માટે આ fields જરૂરી છે: ${roleMissing.join(", ")}`
                });
            }

            const finalDepartmentId = requiredForRole.includes("departmentId") ? Number(departmentId) : null;
            const finalSectionId = requiredForRole.includes("sectionId") ? Number(sectionId) : null;
            const finalStandardId = requiredForRole.includes("standardId") ? Number(standardId) : null;

            const newUser = await userService.createUser({
                suid,
                avatar,
                name,
                username,
                password,
                bod,
                departmentId: finalDepartmentId as any,
                sectionId: finalSectionId as any,
                standardId: finalStandardId as any,
                roleCode,
                joiningDate,
                status
            });

            return res.status(201).json({
                success: true,
                message: "User created successfully",
                data: newUser
            });

        } catch (error: any) {
            return res.status(400).json({
                success: false,
                message: error.message || "Failed to create user"
            });
        }
    }

    public async loginUser(req: Request, res: Response): Promise<Response> {
        try {
            const { username, password } = req.body;
            if (!username || !password) {
                return res.status(400).json({ success: false, message: "Username and password are required." });
            }

            const bcrypt = require("bcrypt");
            const jwt = require("jsonwebtoken");

            const user = await userService.findUserByUsername(username);
            if (!user) {
                return res.status(404).json({ success: false, message: "User not found." });
            }

            const storedPassword: string = user.password;
            const isHashed = BCRYPT_HASH_REGEX.test(storedPassword);

            let isMatch = false;

            if (isHashed) {
                isMatch = await bcrypt.compare(password, storedPassword);
            } else {
                isMatch = password === storedPassword;

                if (isMatch) {
                    const newHash = await bcrypt.hash(password, 10);
                    await userService.updatePassword(user.suid, newHash);
                    console.log(`🔐 Security: user ${user.username} no plain-text password automatically hash kari didho.`);
                }
            }

            if (!isMatch) {
                return res.status(401).json({ success: false, message: "Invalid credentials." });
            }

            if (user.status !== "APPROVED") {
                return res.status(403).json({ success: false, message: "Your account is not approved yet." });
            }

            const token = jwt.sign(
                { suid: user.suid, roleCode: user.roleCode },
                process.env.JWT_SECRET || "default_secret",
                { expiresIn: "7d" }
            );

            const { password: _pw, ...userWithoutPassword } = user;

            return res.status(200).json({
                success: true,
                message: "Login successful",
                token,
                data: userWithoutPassword
            });

        } catch (error: any) {
            return res.status(500).json({ success: false, message: error.message || "Login failed" });
        }
    }

    public async allUser(req: Request, res: Response): Promise<Response> {
        try {
            const users = await userService.getAllUsers();
            return res.status(200).json({ success: true, data: users });
        } catch (error: any) {
            return res.status(500).json({ success: false, message: error.message || "Internal Server Error" });
        }
    }

    public async getPendingUsers(req: Request, res: Response): Promise<Response> {
        try {
            const users = await userService.getPendingUsers();
            return res.status(200).json({ success: true, data: users });
        } catch (error: any) {
            return res.status(500).json({ success: false, message: error.message || "Internal Server Error" });
        }
    }

    public async approveUser(req: Request, res: Response): Promise<Response> {
        try {
            const id = Number(req.params.id);
            if (!id) return res.status(400).json({ success: false, message: "Invalid ID" });

            const updatedUser = await userService.updateUserStatus(id, "APPROVED");
            return res.status(200).json({
                success: true,
                message: "User approved successfully",
                data: updatedUser
            });
        } catch (error: any) {
            return res.status(400).json({ success: false, message: error.message || "Failed to approve user" });
        }
    }

    public async userDelete(req: Request, res: Response): Promise<Response> {
        try {
            const id = Number(req.params.id);
            if (!id) return res.status(400).json({ success: false, message: "Invalid ID" });

            await userService.deleteUser(id);
            return res.status(200).json({ success: true, message: "User deleted successfully" });
        } catch (error: any) {
            return res.status(400).json({ success: false, message: error.message || "Failed to delete user" });
        }
    }

    public async getUsersBySection(req: Request, res: Response): Promise<Response> {
        try {
            const sectionId = Number(req.params.sectionId);
            if (!sectionId) return res.status(400).json({ success: false, message: "Invalid Section ID" });

            const users = await userService.getUsersBySection(sectionId);
            return res.status(200).json({ success: true, data: users });
        } catch (error: any) {
            return res.status(500).json({ success: false, message: error.message || "Internal Server Error" });
        }
    }
    
}