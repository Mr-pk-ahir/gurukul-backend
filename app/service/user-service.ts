import { pool } from "../db/database";
import { UserCreate } from "../module/user-module";
import bcrypt from "bcrypt";

export class UserService {
  
  // 📝 ૧. નવો યુઝર રજીસ્ટર/ક્રિએટ કરવા માટે
  public async createUser(data: UserCreate) {
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(data.password, saltRounds);

      let finalStatus = data.status || "PENDING";
      // જો ડેટાબેઝમાં ડાયરેક્ટ સપર-એડમિન ક્રિએટ કરવો હોય તો ઓટોમેટિક APPROVED થશે
      if (data.username === "super-admin") {
        finalStatus = "APPROVED";
      }

      const query = `
        INSERT INTO users (
          suid, avatar, name, username, password, bod, 
          department_id, section_id, standard_id, role_id, role_code, 
          joining_date, status
        ) 
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) 
        RETURNING suid, avatar, name, username, bod, department_id AS "departmentId", section_id AS "sectionId", standard_id AS "standardId", role_id AS "roleId", role_code AS "roleCode", joining_date AS "joiningDate", status;
      `;

      const values = [
        data.suid, data.avatar, data.name, data.username, hashedPassword, data.bod,
        data.departmentId, data.sectionId, data.standardId, data.roleId, data.roleCode,
        data.joiningDate, finalStatus
      ];

      const result = await client.query(query, values);
      const newUser = result.rows[0];

      // 👑 HOD ઓટોમેશન લોજિક
      if ((data.roleCode === 'HEAD100' || data.roleCode === 'DEPARTMENT_HEAD') && data.departmentId) {
        const updateDeptQuery = `
          UPDATE departments 
          SET department_head_id = $1 
          WHERE department_id = $2;
        `;
        await client.query(updateDeptQuery, [data.suid, data.departmentId]);
        console.log(`🎯 HOD Automation: યુઝર ${data.suid} ને ડિપાર્ટમેન્ટ ${data.departmentId} ના હેડ સેટ કરી દીધા છે.`);
      }

      await client.query('COMMIT');
      return newUser;

    } catch (error) {
      await client.query('ROLLBACK');
      console.error("❌ [UserService Error] createUser માં પ્રોબ્લેમ છે:", error);
      throw error;
    } finally {
      client.release();
    }
  }

  // 🔍 ૨. બધા યુઝર્સનો ડેટા ફેચ કરવા માટે (ટેબલ લિસ્ટ માટે)
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

  // 🔑 ૩. લોગિન વખતે યુઝરને ડેટાબેઝમાંથી શોધવા માટે (સુપર-એડમિન સહિત બધા માટે)
  public async findUserByUsername(username: string) {
    const query = `
      SELECT 
        u.suid, u.avatar, u.name, u.username, u.password, u.status, u.role_code AS "roleCode", u.department_id AS "departmentId",
        r.role_name AS "roleName"
      FROM users u
      LEFT JOIN roles r ON u.role_code = r.role_code
      WHERE u.username = $1;
    `;
    const result = await pool.query(query, [username]);
    return result.rows[0];
  }
}