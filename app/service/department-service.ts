import { pool } from "../db/database";
import { IDepartment } from "../module/department-model";

export class DepartmentService {

  // 🎲 ૬-ડિજિટ યુનિક આઈડી જનરેટ કરવા માટેનું ફંક્શન
  private generate6DigitId(): number {
    return Math.floor(100000 + Math.random() * 900000);
  }

  // 🏢 ૧. નવો ડિપાર્ટમેન્ટ સેવ કરવા માટે (Error Handling સાથે)
  public async createDepartment(departmentData: IDepartment): Promise<any> {
    try {
      const departmentId = this.generate6DigitId();
      const { departmentName, departmentHeadId, description } = departmentData;

      const query = `
        INSERT INTO departments (department_id, department_name, department_head_id, description)
        VALUES ($1, $2, $3, $4)
        RETURNING *;
      `;

      // જો હેડ આઈડી ખાલી સ્ટ્રિંગ હોય તો ડેટાબેઝ માટે તેને NULL કરી દો
      const headId = departmentHeadId === "" ? null : departmentHeadId;
      const values = [departmentId, departmentName, headId, description];

      const result = await pool.query(query, values);
      return result.rows[0];

    } catch (error: any) {
      // 🛠️ સર્વરના ટર્મિનલમાં ડિટેઇલ એરર પ્રિન્ટ થશે
      console.error("❌ [Service Error] createDepartment માં પ્રોબ્લેમ છે:", error);

      // 🎯 PostgreSQL ના એરર કોડ્સનું સ્માર્ટ હેન્ડલિંગ
      if (error.code === "23505") {
        throw new Error("આ નામનો ડિપાર્ટમેન્ટ ડેટાબેઝમાં પહેલેથી જ બનેલો છે.");
      }
      if (error.code === "23503") {
        throw new Error("પસંદ કરેલ Department Head (User ID) ડેટાબેઝમાં હાજર નથી. પહેલા સાચો યુઝર બનાવો.");
      }
      if (error.code === "42P01") {
        throw new Error("ડેટાબેઝમાં 'departments' નામનું ટેબલ મળ્યું નથી. કૃપા કરીને SQL સ્ક્રિપ્ટ રન કરો.");
      }

      // જો કોઈ બીજી જ એરર હોય તો સાચો મેસેજ આગળ મોકલો
      throw new Error(error.message || "ડેટાબેઝમાં ડેટા સ્ટોર કરતી વખતે કોઈ અજ્ઞાત એરર આવી.");
    }
  }

  // 🔍 ૨. બધા ડિપાર્ટમેન્ટ મેળવવા માટે (Error Handling સાથે)
  public async getAllDepartments(): Promise<any[]> {
    try {
      const query = `
        SELECT * FROM departments 
        ORDER BY created_at DESC;
      `;
      
      const result = await pool.query(query);
      return result.rows;

    } catch (error: any) {
      console.error("❌ [Service Error] getAllDepartments માં પ્રોબ્લેમ છે:", error);
      throw new Error("ડિપાર્ટમેન્ટ લિસ્ટ ફેચ કરવામાં ડેટાબેઝ તરફથી સમસ્યા આવી છે.");
    }
  }
}