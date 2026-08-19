import { pool } from "../db/database";
import { UserCreate } from "../module/user-module";
import bcrypt from "bcrypt";

export class UserService {

  public async deleteUser(id: number | null) {
    const query = `DELETE FROM users WHERE suid = $1`;
    const result = await pool.query(query, [id]);

    if (result.rowCount === 0) {
      throw new Error("User not found");
    }
    return true;
  }

  public async createUser(data: UserCreate) {
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(data.password, saltRounds);

      let finalStatus: string = data.status || "PENDING";
      if (data.username === "super-admin") {
        finalStatus = "APPROVED";
      }

      const generatedSuid = data.suid ?? Math.floor(100000 + Math.random() * 900000);

      const query = `
        INSERT INTO users (
          suid, avatar, name, username, password, bod, 
          department_id, section_id, standard_id, role_code, 
          joining_date, status
        ) 
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) 
        RETURNING suid, avatar, name, username, bod, department_id AS "departmentId", section_id AS "sectionId", standard_id AS "standardId", role_code AS "roleCode", joining_date AS "joiningDate", status;
      `;

      const values = [
        generatedSuid,
        data.avatar || null, data.name, data.username, hashedPassword, data.bod,
        data.departmentId, data.sectionId, data.standardId, data.roleCode,
        data.joiningDate, finalStatus
      ];

      const result = await client.query(query, values);
      const newUser = result.rows[0];

      // 🎯 EXISTING: HOD automation — department no head set karo
      if ((data.roleCode === 'HEAD100' || data.roleCode === 'DEPARTMENT_HEAD') && data.departmentId) {
        const updateDeptQuery = `
          UPDATE departments 
          SET department_head_id = $1 
          WHERE department_id = $2;
        `;
        await client.query(updateDeptQuery, [newUser.suid, data.departmentId]);
        console.log(`🎯 HOD Automation: યુઝર ${newUser.suid} ને ડિપાર્ટમેન્ટ ${data.departmentId} ના હેડ સેટ કરી દીધા છે.`);
      }

      // 🎯 NAVU: Section Head automation — SECHEAD101 role select thay to
      // e user ne e section no head banavi do (sections.section_head_id set karo)
      if (data.roleCode === 'SECHEAD101' && data.sectionId) {
        const updateSectionQuery = `
          UPDATE sections 
          SET section_head_id = $1 
          WHERE section_id = $2;
        `;
        await client.query(updateSectionQuery, [newUser.suid, data.sectionId]);
        console.log(`🎯 Section Head Automation: યુઝર ${newUser.suid} ને સેક્શન ${data.sectionId} ના હેડ સેટ કરી દીધા છે.`);
      }

      await client.query('COMMIT');
      return newUser;

    } catch (error: any) {
      await client.query('ROLLBACK');
      console.error("❌ [UserService Error] createUser માં પ્રોબ્લેમ છે:", error);

      if (error.code === "23503") {
        throw new Error(`Invalid reference: ${error.constraint || "a related department/section/standard/role ID"} does not exist.`);
      }
      if (error.code === "23505") {
        throw new Error("Username or SUID already exists.");
      }
      if (error.code === "23502") {
        throw new Error(`Missing required column: ${error.column || "a required field"} cannot be null.`);
      }

      throw error;
    } finally {
      client.release();
    }
  }

  public async getAllUsers() {
    const query = `
      SELECT 
        u.suid, 
        u.avatar, 
        u.name, 
        u.username, 
        u.department_id AS "departmentId",
        u.section_id AS "sectionId",
        u.joining_date AS "joiningDate", 
        u.status,
        u.role_code AS "roleCode",
        r.role_name AS "role",
        r.permissions
      FROM users u
      LEFT JOIN roles r ON u.role_code = r.role_code
      ORDER BY u.joining_date DESC;
    `;
    const result = await pool.query(query);
    return result.rows;
  }

  public async getPendingUsers() {
    const query = `
      SELECT 
        u.suid, 
        u.avatar, 
        u.name, 
        u.username, 
        u.department_id AS "departmentId",
        u.section_id AS "sectionId",
        u.joining_date AS "joiningDate", 
        u.status,
        u.role_code AS "roleCode",
        r.role_name AS "role"
      FROM users u
      LEFT JOIN roles r ON u.role_code = r.role_code
      WHERE u.status = 'PENDING'
      ORDER BY u.joining_date DESC;
    `;
    const result = await pool.query(query);
    return result.rows;
  }

  public async updateUserStatus(suid: number, status: "PENDING" | "APPROVED") {
    const query = `
      UPDATE users 
      SET status = $1 
      WHERE suid = $2
      RETURNING suid, name, username, status, role_code AS "roleCode";
    `;
    const result = await pool.query(query, [status, suid]);

    if (result.rowCount === 0) {
      throw new Error("User not found");
    }
    return result.rows[0];
  }

  public async findUserByUsername(username: string) {
    const query = `
      SELECT 
        u.suid, u.avatar, u.name, u.username, u.password, u.status, 
        u.role_code AS "roleCode", u.department_id AS "departmentId",
        u.section_id AS "sectionId",
        u.bod, u.joining_date AS "joiningDate",
        r.role_name AS "roleName",
        r.permissions  -- 🎯 FIX: ડેટાબેઝમાંથી permissions પણ લાવો
      FROM users u
      LEFT JOIN roles r ON u.role_code = r.role_code
      WHERE u.username = $1;
    `;
    const result = await pool.query(query, [username]);
    return result.rows[0];
  }

  public async updatePassword(suid: number, newHashedPassword: string) {
    const query = `UPDATE users SET password = $1 WHERE suid = $2`;
    await pool.query(query, [newHashedPassword, suid]);
    return true;
  }

  public async getUsersBySection(sectionId: number) {
    const query = `
      SELECT 
        u.suid, 
        u.avatar, 
        u.name, 
        u.username, 
        u.department_id AS "departmentId",
        u.section_id AS "sectionId",
        u.standard_id AS "standardId",
        u.joining_date AS "joiningDate", 
        u.status,
        u.role_code AS "roleCode"
      FROM users u
      WHERE u.section_id = $1
      ORDER BY u.name ASC;
    `;
    const result = await pool.query(query, [sectionId]);
    return result.rows;
  }

  public async updateProfile(suid: number, data: { name?: string; username?: string; bod?: string; avatar?: string }) {
    const fields: string[] = [];
    const values: any[] = [];
    let idx = 1;

    if (data.name !== undefined && data.name !== "") { fields.push(`name = $${idx++}`); values.push(data.name); }
    if (data.username !== undefined && data.username !== "") { fields.push(`username = $${idx++}`); values.push(data.username); }
    if (data.bod !== undefined && data.bod !== "") { fields.push(`bod = $${idx++}`); values.push(data.bod); }
    if (data.avatar !== undefined) { fields.push(`avatar = $${idx++}`); values.push(data.avatar); }

    if (fields.length === 0) {
      throw new Error("Update કરવા માટે કોઈ ફિલ્ડ આપ્યું નથી.");
    }

    values.push(suid);
    const query = `
      UPDATE users SET ${fields.join(", ")}
      WHERE suid = $${idx}
      RETURNING suid, avatar, name, username, bod, 
                department_id AS "departmentId", section_id AS "sectionId", 
                role_code AS "roleCode", joining_date AS "joiningDate", status;
    `;

    try {
      const result = await pool.query(query, values);
      if (result.rows.length === 0) throw new Error("User મળ્યો નથી.");
      return result.rows[0];
    } catch (error: any) {
      if (error.code === "23505") {
        throw new Error("આ Username પહેલેથી વપરાયેલું છે.");
      }
      throw error;
    }
  }

}