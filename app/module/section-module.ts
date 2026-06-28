import { pool } from "../db/database";

export interface SectionRow {
    section_id: number;
    name: string;
    department_id: number;
    description: string | null;
    created_at: Date;
    updated_at: Date;
    department_name?: string;
}

export class SectionModule {
    static async create(name: string, departmentId: number, description?: string): Promise<SectionRow> {
        const query = `
            INSERT INTO sections (name, department_id, description) 
            VALUES ($1, $2, $3) 
            RETURNING *;
        `;
        const result = await pool.query(query, [name, departmentId, description || null]);
        return result.rows[0];
    }

    static async getAll(): Promise<SectionRow[]> {
        const query = `
            SELECT s.*, d.department_name 
            FROM sections s
            LEFT JOIN departments d ON s.department_id = d.department_id
            ORDER BY s.section_id ASC;
        `;
        const result = await pool.query(query);
        return result.rows;
    }

    static async getById(sectionId: number): Promise<SectionRow | null> {
        const query = `
            SELECT s.*, d.department_name 
            FROM sections s
            LEFT JOIN departments d ON s.department_id = d.department_id
            WHERE s.section_id = $1;
        `;
        const result = await pool.query(query, [sectionId]);
        return result.rows.length ? result.rows[0] : null;
    }
}