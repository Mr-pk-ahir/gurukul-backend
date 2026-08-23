import { pool } from "../db/database";
import { IDepartment, DepartmentRow } from "../module/department-model";

export class DepartmentService {

    // 4 ડિજિટનો ID જનરેટ કરવા માટે
    private generateId(): number {
        return Math.floor(1000 + Math.random() * 9000); 
    }

    // 1. Create Department
    public async createDepartment(departmentData: IDepartment): Promise<DepartmentRow> {
        try {
            const departmentId = departmentData.departmentId || this.generateId();
            const { departmentName, departmentHeadId, description } = departmentData;

            const query = `
                INSERT INTO departments (department_id, department_name, department_head_id, description)
                VALUES ($1, $2, $3, $4)
                RETURNING *;
            `;

            // હેડ આઈડી જો ખાલી હોય તો null સેટ કરવું
            const headId = departmentHeadId ? Number(departmentHeadId) : null;
            const values = [departmentId, departmentName, headId, description || null];

            const result = await pool.query(query, values);
            return result.rows[0];

        } catch (error: any) {
            if (error.code === "23505") {
                throw new Error("આ નામનો ડિપાર્ટમેન્ટ ડેટાબેઝમાં પહેલેથી જ બનેલો છે.");
            }
            if (error.code === "23503") {
                throw new Error("પસંદ કરેલ Department Head (User ID) ડેટાબેઝમાં હાજર નથી.");
            }
            throw new Error(error.message || "ડેટાબેઝમાં ડિપાર્ટમેન્ટ સેવ કરતી વખતે એરર આવી.");
        }
    }

    // 2. Get All Departments
    public async getAllDepartments(): Promise<DepartmentRow[]> {
        try {
            const query = `
                SELECT 
                    d.department_id, 
                    d.department_name, 
                    d.department_head_id, 
                    u.name AS department_head_name,
                    d.description,
                    d.created_at,
                    d.updated_at
                FROM departments d
                LEFT JOIN users u ON d.department_head_id = u.suid
                ORDER BY d.created_at DESC;
            `;
            const result = await pool.query(query);
            return result.rows;
        } catch (error: any) {
            throw new Error("ડિપાર્ટમેન્ટ લિસ્ટ ફેચ કરવામાં સમસ્યા આવી છે.");
        }
    }

    // 3. Get Department By ID
    public async getDepartmentById(departmentId: number): Promise<DepartmentRow> {
        try {
            const query = `
                SELECT 
                    d.department_id, 
                    d.department_name, 
                    d.department_head_id, 
                    u.name AS department_head_name,
                    d.description,
                    d.created_at,
                    d.updated_at
                FROM departments d
                LEFT JOIN users u ON d.department_head_id = u.suid
                WHERE d.department_id = $1;
            `;
            const result = await pool.query(query, [departmentId]);
            if (result.rows.length === 0) {
                throw new Error("ડિપાર્ટમેન્ટ મળ્યો નથી.");
            }
            return result.rows[0];
        } catch (error: any) {
            throw new Error(error.message || "ડિપાર્ટમેન્ટ ફેચ કરતી વખતે એરર આવી.");
        }
    }

    // 4. Delete Department
    public async deleteDepartment(departmentId: number): Promise<DepartmentRow> {
        try {
            const query = `DELETE FROM departments WHERE department_id = $1 RETURNING *;`;
            const result = await pool.query(query, [departmentId]);
            
            if (result.rowCount === 0) {
                throw new Error("ડિપાર્ટમેન્ટ મળ્યો નથી. સાચો ID આપો.");
            }
            return result.rows[0];
        } catch (error: any) {
            if (error.code === "23503") {
                throw new Error("આ ડિપાર્ટમેન્ટ ડિલીટ કરી શકાતો નથી કારણ કે તે સેક્શન કે યુઝર સાથે જોડાયેલો છે.");
            }
            throw new Error(error.message || "ડિપાર્ટમેન્ટ ડિલીટ કરતી વખતે એરર આવી.");
        }
    }

    public async updateDepartment(
        departmentId: number,
        departmentName?: string,
        departmentHeadId?: number | null,
        description?: string
    ): Promise<DepartmentRow> {
        const result = await pool.query(
            `UPDATE departments
             SET department_name = COALESCE($1, department_name),
                 department_head_id = $2,
                 description = COALESCE($3, description),
                 updated_at = CURRENT_TIMESTAMP
             WHERE department_id = $4
             RETURNING *;`,
            [departmentName || null, departmentHeadId ?? null, description ?? null, departmentId]
        );
        if (result.rows.length === 0) throw new Error("ડિપાર્ટમેન્ટ મળ્યો નથી.");
        return result.rows[0];
    }

    // 5. Get Users by Department (Frontend માં Section Head સિલેક્ટ કરવા માટે)
    public async getUsersByDepartment(departmentId: number): Promise<any[]> {
        try {
            const query = `
                SELECT suid, name, username, role_code 
                FROM users 
                WHERE department_id = $1;
            `;
            const result = await pool.query(query, [departmentId]);
            return result.rows;
        } catch (error: any) {
            throw new Error("આ ડિપાર્ટમેન્ટના યુઝર્સ ફેચ કરવામાં એરર આવી.");
        }
    }
}