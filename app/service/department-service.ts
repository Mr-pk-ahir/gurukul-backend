import { pool } from "../db/database";
import { IDepartment } from "../module/department-model";

export class DepartmentService {

  private generate6DigitId(): number {
    return Math.floor(100000 + Math.random() * 900000);
  }

  public async createDepartment(departmentData: IDepartment): Promise<any> {
    try {
      const departmentId = this.generate6DigitId();
      const { departmentName, departmentHeadId, description } = departmentData;

      const query = `
        INSERT INTO departments (department_id, department_name, department_head_id, description)
        VALUES ($1, $2, $3, $4)
        RETURNING *;
      `;

      const headId = departmentHeadId === "" ? null : departmentHeadId;
      const values = [departmentId, departmentName, headId, description];

      const result = await pool.query(query, values);
      return result.rows[0];

    } catch (error: any) {
      if (error.code === "23505") {
        throw new Error("આ નામનો ડિપાર્ટમેન્ટ ડેટાબેઝમાં પહેલેથી જ બનેલો છે.");
      }
      if (error.code === "23503") {
        throw new Error("પસંદ કરેલ Department Head (User ID) ડેટાબેઝમાં હાજર નથી. પહેલા સાચો યુઝર બનાવો.");
      }
      if (error.code === "42P01") {
        throw new Error("ડેટાબેઝમાં 'departments' નામનું ટેબલ મળ્યું નથી. કૃપા કરીને SQL સ્ક્રિપ્ટ રન કરો.");
      }

      throw new Error(error.message || "ડેટાબેઝમાં ડેટા સ્ટોર કરતી વખતે કોઈ અજ્ઞાત એરર આવી.");
    }
  }

  public async getAllDepartments(): Promise<any[]> {
    try {
      const query = `
        SELECT 
          d.department_id AS "departmentId", 
          d.department_name AS "departmentName", 
          d.department_head_id AS "departmentHeadId", 
          u.name AS "departmentHeadName",
          d.description,
          d.created_at
        FROM departments d
        LEFT JOIN users u ON d.department_head_id = u.suid
        ORDER BY d.created_at DESC;
      `;
      
      const result = await pool.query(query);
      return result.rows;

    } catch (error: any) {
      throw new Error("ડિપાર્ટમેન્ટ લિસ્ટ ફેચ કરવામાં ડેટાબેઝ તરફથી સમસ્યા આવી છે.");
    }
  }
}