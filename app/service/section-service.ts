import { pool } from "../db/database";
import { SectionRow, ROLE_CODES } from "../module/section-module";

export class SectionService {

    // 1. Create Section
    static async createSection(
        name: string,
        departmentId: number,
        description?: string,
        sectionHeadId?: number | null
    ): Promise<SectionRow> {
        const client = await pool.connect();
        try {
            if (!name || !departmentId) {
                throw new Error("Section name and Department ID are required.");
            }

            await client.query("BEGIN");

            // 🎯 Section Head validation:
            // 1. User exist karvo joie
            // 2. User same department no hovo joie
            // 3. User no role "Section Head" hovo joie
            if (sectionHeadId) {
                const userCheck = await client.query(
                    `SELECT suid, department_id, role_code, name FROM users WHERE suid = $1;`,
                    [sectionHeadId]
                );

                if (userCheck.rows.length === 0) {
                    throw new Error("પસંદ કરેલ Section Head તરીકે યુઝર મળ્યો નથી.");
                }

                const user = userCheck.rows[0];

                if (user.department_id !== departmentId) {
                    throw new Error("Section Head એ આ જ Department નો User હોવો જોઈએ.");
                }

                if (user.role_code !== ROLE_CODES.SECTION_HEAD) {
                    throw new Error(`પસંદ કરેલ યુઝર "Section Head" રોલ ધરાવતો નથી.`);
                }
            }

            const query = `
                INSERT INTO sections (name, department_id, description, section_head_id) 
                VALUES ($1, $2, $3, $4) 
                RETURNING *;
            `;
            const values = [name, departmentId, description || null, sectionHeadId || null];
            const result = await client.query(query, values);
            const newSection = result.rows[0];

            // 🎯 Bidirectional sync: user ne is section ma set karvo (jem department flow ma HOD sync thay che tem)
            if (sectionHeadId) {
                await client.query(
                    `UPDATE users SET section_id = $1 WHERE suid = $2;`,
                    [newSection.section_id, sectionHeadId]
                );
            }

            await client.query("COMMIT");
            return newSection;

        } catch (error: any) {
            await client.query("ROLLBACK");
            if (error.code === "23505") {
                throw new Error("આ નામનું સેક્શન પહેલેથી જ બનેલું છે.");
            }
            if (error.code === "23503") {
                throw new Error("આપેલ Department ID અથવા Section Head ID ડેટાબેઝમાં હાજર નથી.");
            }
            throw new Error(error.message || "સેક્શન ક્રિએટ કરતી વખતે ડેટાબેઝમાં એરર આવી.");
        } finally {
            client.release();
        }
    }

    // 2. Update Section (name, description, section head badalva mate)
    static async updateSection(
        sectionId: number,
        name?: string,
        description?: string,
        sectionHeadId?: number | null
    ): Promise<SectionRow> {
        const client = await pool.connect();
        try {
            await client.query("BEGIN");

            const existing = await client.query(`SELECT * FROM sections WHERE section_id = $1;`, [sectionId]);
            if (existing.rows.length === 0) {
                throw new Error("સેક્શન મળ્યું નથી.");
            }
            const currentSection = existing.rows[0];

            if (sectionHeadId) {
                const userCheck = await client.query(
                    `SELECT suid, department_id, role_code FROM users WHERE suid = $1;`,
                    [sectionHeadId]
                );
                if (userCheck.rows.length === 0) {
                    throw new Error("પસંદ કરેલ Section Head તરીકે યુઝર મળ્યો નથી.");
                }
                const user = userCheck.rows[0];
                if (user.department_id !== currentSection.department_id) {
                    throw new Error("Section Head એ આ જ Department નો User હોવો જોઈએ.");
                }
                if (user.role_code !== ROLE_CODES.SECTION_HEAD) {
                    throw new Error(`પસંદ કરેલ યુઝર "Section Head" રોલ ધરાવતો નથી.`);
                }
            }

            const query = `
                UPDATE sections 
                SET 
                    name = COALESCE($1, name),
                    description = COALESCE($2, description),
                    section_head_id = $3,
                    updated_at = CURRENT_TIMESTAMP
                WHERE section_id = $4
                RETURNING *;
            `;
            const values = [
                name || null,
                description || null,
                sectionHeadId !== undefined ? sectionHeadId : currentSection.section_head_id,
                sectionId
            ];
            const result = await client.query(query, values);
            const updatedSection = result.rows[0];

            // Jo section head badlayo hoy to purana head nu section_id clear karo, navu set karo
            if (sectionHeadId && sectionHeadId !== currentSection.section_head_id) {
                if (currentSection.section_head_id) {
                    await client.query(
                        `UPDATE users SET section_id = NULL WHERE suid = $1 AND section_id = $2;`,
                        [currentSection.section_head_id, sectionId]
                    );
                }
                await client.query(
                    `UPDATE users SET section_id = $1 WHERE suid = $2;`,
                    [sectionId, sectionHeadId]
                );
            }

            await client.query("COMMIT");
            return updatedSection;

        } catch (error: any) {
            await client.query("ROLLBACK");
            throw new Error(error.message || "સેક્શન અપડેટ કરતી વખતે એરર આવી.");
        } finally {
            client.release();
        }
    }

    // 3. Get All Sections
    static async getAllSections(): Promise<SectionRow[]> {
        try {
            const query = `
                SELECT 
                    s.*, 
                    d.department_name, 
                    u.name AS head_name
                FROM sections s
                LEFT JOIN departments d ON s.department_id = d.department_id
                LEFT JOIN users u ON s.section_head_id = u.suid
                ORDER BY s.section_id ASC;
            `;
            const result = await pool.query(query);
            return result.rows;
        } catch (error: any) {
            throw new Error("સેક્શન લિસ્ટ ફેચ કરવામાં સમસ્યા આવી છે.");
        }
    }

    // 4. Get Section By ID
    static async getSectionById(sectionId: number): Promise<SectionRow> {
        try {
            const query = `
                SELECT 
                    s.*, 
                    d.department_name, 
                    u.name AS head_name
                FROM sections s
                LEFT JOIN departments d ON s.department_id = d.department_id
                LEFT JOIN users u ON s.section_head_id = u.suid
                WHERE s.section_id = $1;
            `;
            const result = await pool.query(query, [sectionId]);
            if (result.rows.length === 0) {
                throw new Error("સેક્શન મળ્યું નથી.");
            }
            return result.rows[0];
        } catch (error: any) {
            throw new Error(error.message || "સેક્શન ફેચ કરતી વખતે એરર આવી.");
        }
    }

    // 5. Get Sections by Department (Section-Create.tsx na dropdown mate)
    static async getSectionsByDepartment(departmentId: number): Promise<SectionRow[]> {
        try {
            const query = `
                SELECT s.*, u.name AS head_name
                FROM sections s
                LEFT JOIN users u ON s.section_head_id = u.suid
                WHERE s.department_id = $1
                ORDER BY s.section_id ASC;
            `;
            const result = await pool.query(query, [departmentId]);
            return result.rows;
        } catch (error: any) {
            throw new Error("આ Department ના Sections ફેચ કરવામાં એરર આવી.");
        }
    }

    // 6. Delete Section
    static async deleteSection(sectionId: number): Promise<SectionRow> {
        const client = await pool.connect();
        try {
            await client.query("BEGIN");

            // Section delete thay pahela, e section na head/students nu section_id NULL karo
            await client.query(`UPDATE users SET section_id = NULL WHERE section_id = $1;`, [sectionId]);

            const query = `DELETE FROM sections WHERE section_id = $1 RETURNING *;`;
            const result = await client.query(query, [sectionId]);

            if (result.rows.length === 0) {
                throw new Error("સેક્શન મળ્યું નથી. સાચો ID આપો.");
            }

            await client.query("COMMIT");
            return result.rows[0];

        } catch (error: any) {
            await client.query("ROLLBACK");
            throw new Error(error.message || "સેક્શન ડિલીટ કરતી વખતે એરર આવી.");
        } finally {
            client.release();
        }
    }
}