import { pool } from "../db/database";
import { RoleCreate, ModulePermissions } from "../module/role-module";

export class RoleService {

    public async createRole(roleData: RoleCreate): Promise<any> {
        try {
            const query = `
                INSERT INTO roles (role_name, role_code, description, permissions)
                VALUES ($1, $2, $3, $4)
                RETURNING role_id, role_name, role_code, description, permissions, created_at;
            `;
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

    public static async getRolePermissions(roleCode: string): Promise<ModulePermissions | null> {
        try {
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
    public async getAllRoles(): Promise<any[]> {
        try {
            const query = `
                SELECT role_code, role_name, description, permissions, created_at 
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