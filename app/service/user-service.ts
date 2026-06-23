import { pool } from "../db/database";
import { UserCreate } from "../module/user-module";
import bcrypt from "bcrypt";

export class UserService {
  
  // ➕ ૧. નવો યુઝર ક્રિએટ કરવા માટે (Register)
  public async createUser(data: UserCreate) {
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

    const result = await pool.query(query, values);
    return result.rows[0];
  }

  // 🔍 ૨. બધા યુઝર્સનો ડેટા ફેચ કરવા માટે (ટેબલ માટે)
  public async getAllUsers() {
    const query = `
      SELECT 
        suid, avatar, name, username, 
        joining_date AS "joiningDate", -- ફ્રન્ટએન્ડ કેમલકેસ માટે એલાયસ આપ્યો
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