// 📂 ફાઈલ પાથ: app/service/role-service.ts

// 🎯 ૧. તમારા પ્રોજેક્ટનો સાચો ડેટાબેઝ કનેક્શન પાથ અહીં ઇમ્પોર્ટ કરો
import { pool } from "../db/database";
import { RoleCreate, ModulePermissions } from "../module/role-module";

export class RoleService {

    /**
     * ➕ ૧. નવો રોલ ડેટાબેઝમાં સેવ કરવા માટે (હવે લાઇવ ક્વેરી સાથે)
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

            // ⚡ ડીબી ક્વેરી લાઇવ રન થશે
            const result = await pool.query(query, values);

            // ડેટાબેઝમાં જે નવો રોડ સેવ થયો તે રિટર્ન કરશે
            return result.rows[0];

        } catch (error) {
            throw error; // આ એરર કંટ્રોલર પકડશે (catch કરશે)
        }
    }

    /**
     * 🔍 ૨. મિડલવેર માટે રોલની પરમિશન્સ ડેટાબેઝમાંથી લાઈવ શોધવા
     */
    public static async getRolePermissions(roleCode: string): Promise<ModulePermissions | null> {
        try {
            // સુપર એડમિન માટે ડાયરેક્ટ બાયપાસ
            if (roleCode === "ROLE_SUPER_ADMIN") {
                return {
                    "Users": { create: true, edit: true, view: true, delete: true },
                    "Department": { create: true, edit: true, view: true, delete: true },
                    "Roles & Permissions": { create: true, edit: true, view: true, delete: true }
                };
            }

            // ⚡ ડેટાબેઝમાંથી પર્ટીક્યુલર રોલ કોડની પરમિશન લાવો
            const query = `SELECT permissions FROM roles WHERE role_code = $1;`;
            const result = await pool.query(query, [roleCode]);

            if (result.rows.length > 0) {
                return result.rows[0].permissions; // સીધું JSON ઓબ્જેક્ટ મળશે
            }

            return null;
        } catch (error) {
            console.error("Error fetching permissions from DB:", error);
            return null;
        }
    }
    public async getAllRoles(): Promise<any[]> {
        try {
            const query = `
                SELECT role_id, role_name, role_code, description 
                FROM roles 
                ORDER BY role_name ASC;
            `;
            const result = await pool.query(query);
            return result.rows; // બધા રોલ્સનો એરે (Array) રિટર્ન કરશે
        } catch (error) {
            throw error;
        }
    }
}