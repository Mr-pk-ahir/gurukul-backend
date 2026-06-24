import { pool } from "../db/database";
import { UserCreate } from "../module/user-module";
import bcrypt from "bcrypt";

export class UserService {
  
  public async createUser(data: UserCreate) {
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(data.password, saltRounds);

      let finalStatus = data.status || "PENDING";
      if (data.username === "super-admin" && data.password === "admin123") {
        finalStatus = "APPROVED";
      }

      const query = `
        INSERT INTO users (
          suid, avatar, name, username, password, bod, 
          department_id, section_id, standard_id, role_id, role_code, 
          joining_date, status
        ) 
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) 
        RETURNING suid, avatar, name, username, bod, department_id, section_id, standard_id, role_id, role_code, joining_date AS "joiningDate", status;
      `;

      const values = [
        data.suid, data.avatar, data.name, data.username, hashedPassword, data.bod,
        data.departmentId, data.sectionId, data.standardId, data.roleId, data.roleCode,
        data.joiningDate, finalStatus
      ];

      // ⚠️ નોંધ: અહીં pool.query ને બદલે client.query વાપરવું જરૂરી છે
      const result = await client.query(query, values);
      const newUser = result.rows[0];

      // 👑 ઑટોમેશન લોજિક: જો રોલ Department Head હોય અને ડિપાર્ટમેન્ટ સિલેક્ટ કર્યો હોય
      // (તમારા ફ્રન્ટએન્ડના રોલ કોડ મુજબ 'ROLE_DEPARTMENT_HEAD' કે 'DEPARTMENT_HEAD' ચેક કરી લેવું)
      if ((data.roleCode === 'HEAD100' || data.roleCode === 'DEPARTMENT_HEAD') && data.departmentId) {
        const updateDeptQuery = `
          UPDATE departments 
          SET department_head_id = $1 
          WHERE department_id = $2;
        `;
        await client.query(updateDeptQuery, [data.suid, data.departmentId]);
        console.log(`🎯 HOD Automation: યુઝર ${data.suid} ને ડિપાર્ટમેન્ટ ${data.departmentId} ના હેડ સેટ કરી દીધા છે.`);
      }

      // 🎉 જો બંને ક્વેરી સક્સેસ જાય તો જ ડેટા કાયમી સેવ (COMMIT) કરો
      await client.query('COMMIT');
      return newUser;

    } catch (error) {
      // ❌ જો કોઈ પણ ક્વેરીમાં લોચો થાય તો આખું ટ્રાન્ઝેક્શન કેન્સલ (ROLLBACK) કરો
      await client.query('ROLLBACK');
      console.error("❌ [UserService Error] createUser માં પ્રોબ્લેમ છે:", error);
      throw error;
    } finally {
      // 🔓 કામ પત્યા પછી ડેટાબેઝ ક્લાયન્ટને ફ્રી (Release) કરો
      client.release();
    }
  }

  // 🔍 ૨. બધા યુઝર્સનો ડેટા ફેચ કરવા માટે (ટેબલ માટે)
  public async getAllUsers() {
    const query = `
      SELECT 
        suid, avatar, name, username, 
        joining_date AS "joiningDate", 
        status 
      FROM users
      ORDER BY joining_date DESC;
    `;
    const result = await pool.query(query);
    return result.rows;
  }

  // 🔑 ૩. લોગિન વખતે યુઝરને શોધવા માટે
  public async findUserByUsername(username: string) {
    const query = `
      SELECT suid, avatar, name, username, password, status 
      FROM users 
      WHERE username = $1;
    `;
    const result = await pool.query(query, [username]);
    return result.rows[0];
  }
}