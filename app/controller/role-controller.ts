// 📂 ફાઈલ પાથ: app/controller/role-controller.ts

import { Request, Response } from "express";
import { RoleService } from "../service/role-service";
import { RoleCreate } from "../module/role-module";

const roleService = new RoleService();

export class RoleController {

    /**
     * 🚀 ૧. રોલ ક્રિએટ કરવાનો એન્ડપોઇન્ટ
     */
    public async createRole(req: Request, res: Response): Promise<Response> {
        try {
            const { roleName, roleCode, description, permissions } = req.body;

            // ફ્રન્ટએન્ડ તરફથી જરૂરી ડેટા આવે છે કે નહીં તેનું વેલિડેશન
            if (!roleName || !roleCode || !permissions) {
                return res.status(400).json({
                    success: false,
                    message: "Required fields (roleName, roleCode, permissions) are missing."
                });
            }

            const roleData: RoleCreate = { roleName, roleCode, description, permissions };

            const newRole = await roleService.createRole(roleData);
            
            return res.status(201).json({
                success: true,
                message: "Role created successfully!",
                data: newRole
            });

        } catch (error: any) {
            // PostgreSQL ડેટાબેઝ યુનિક કોન્સ્ટ્રેન્ટ (Duplicate) એરર હેન્ડલિંગ કોડ
            if (error.code === "23505") {
                return res.status(400).json({
                    success: false,
                    message: "Role Name or Role Code already exists."
                });
            }
            return res.status(500).json({ 
                success: false, 
                message: error.message 
            });
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
                message: "Server Error",
                error: error.message
            });
        }
    }
}