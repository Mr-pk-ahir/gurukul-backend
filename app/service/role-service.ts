// 📂 ફાઈલ પાથ: app/service/role-service.ts

import { pool } from "../db/database";
import { RoleCreate, ModulePermissions } from "../module/role-module";

export class RoleService {

    /**
     * ➕ ૧. નવો રોલ ડેટાબેઝમાં સેવ કરવા માટે
     */
    public async createRole(roleData: RoleCreate): Promise<any> {
        try {
            const query = `
                INSERT INTO roles (role_name, role_code, description, permissions)
                VALUES ($1, $2, $3, $4)
                RETURNING role_id, role_name, role_code, description, permissions, created_at;
            `;

            // PostgreSQL માં JSONB કોલમ માટે ઓબ્જેક્ટને JSON String માં ફેરવવો પડે
            const values = [
                roleData.roleName,
                roleData.roleCode,
                roleData.description || null,
                JSON.stringify(roleData.permissions)
            ];

            const result = await pool.query(query, values);
            return result.rows[0];

        } catch (error) {
            throw error;
        }
    }

    /**
     * 🔍 ૨. મિડલવેર માટે રોલની પરમિશન્સ ડેટાબેઝમાંથી લાઈવ શોધવા
     */
    public static async getRolePermissions(roleCode: string): Promise<ModulePermissions | null> {
        try {
            // સુપર એડમિન માટે ડાયરેક્ટ ઓલ-એક્સેસ બાયપાસ બાય-ડિફોલ્ટ રિટર્ન
            if (roleCode === "ROLE_SUPER_ADMIN") {
                return {
                    "Users": { create: true, edit: true, view: true, delete: true },
                    "Department": { create: true, edit: true, view: true, delete: true },
                    "Roles & Permissions": { create: true, edit: true, view: true, delete: true }
                };
            }

            const query = `SELECT permissions FROM roles WHERE role_code = $1;`;
            const result = await pool.query(query, [roleCode]);

            if (result.rows.length > 0) {
                // PostgreSQL JSONB કોલમ ઓટોમેટિક ઓબ્જેક્ટ તરીકે રિટર્ન કરે છે
                return result.rows[0].permissions; 
            }

            return null;
        } catch (error) {
            console.error("Error fetching permissions from DB:", error);
            return null;
        }
    }

    /**
     * 📋 ૩. બધા જ રોલ્સનું લિસ્ટ મેળવવા માટે
     */
    public async getAllRoles(): Promise<any[]> {
        try {
            const query = `
                SELECT role_id, role_name, role_code, description, permissions, created_at 
                FROM roles 
                ORDER BY role_name ASC;
            `;
            const result = await pool.query(query);
            return result.rows;
        } catch (error) {
            throw error;
        }
    }
}