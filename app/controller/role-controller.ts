// 📂 ફાઈલ પાથ: app/controller/role-controller.ts

import { Request, Response } from "express";
import { RoleService } from "../service/role-service";
import { RoleCreate } from "../module/role-module";

const roleService = new RoleService();

export class RoleController {

    // 📝 Create Role Controller
    public async createRole(req: Request, res: Response): Promise<Response> {
        try {
            const roleData: RoleCreate = req.body;

            // જરૂરી ફિલ્ડ્સનું વેલિડેશન
            if (!roleData.roleName || !roleData.roleCode || !roleData.permissions) {
                return res.status(400).json({
                    success: false,
                    message: "Required fields (roleName, roleCode, permissions) are missing."
                });
            }

            const newRole = await roleService.createRole(roleData);
            return res.status(201).json({
                success: true,
                message: "Role created successfully!",
                data: newRole
            });

        } catch (error: any) {
            // PostgreSQL Unique Violation (જો રોલ નેમ કે કોડ ઓલરેડી હોય)
            if (error.code === "23505") {
                return res.status(400).json({
                    success: false,
                    message: "Role Name or Role Code already exists."
                });
            }
            return res.status(500).json({ success: false, message: error.message });
        }
    }
    public async getAllRoles(req: Request, res: Response): Promise<Response> {
        try {
            const roles = await roleService.getAllRoles();

            return res.status(200).json({
                success: true,
                message: "Roles fetched successfully!",
                data: roles
            });
        } catch (error: any) {
            return res.status(500).json({
                success: false,
                message: "રોલ્સ મેળવતી વખતે સર્વર એરર આવી.",
                error: error.message
            });
        }
    }
}