// 📂 app/service/lesson-service.ts

import { pool } from "../db/database";
import { LessonRow, ILessonCreate } from "../module/lesson-module";

export class LessonService {

    // 1. Lesson create
    static async createLesson(data: ILessonCreate): Promise<LessonRow> {
        try {
            if (!data.lessonTitle || !data.lessonType || !data.dateStart || !data.dateEnd) {
                throw new Error("Title, type, start date ane end date jaruri chhe.");
            }

            const scope = data.assignment?.scope || "all";

            const query = `
                INSERT INTO lessons (
                    lesson_title, lesson_type, media_url, media_public_id, description,
                    department_id, date_start, date_end, progress_points,
                    created_by, role_code,
                    assign_scope, assign_department_id, assign_section_id, assign_student_id, assign_group_id, assign_head_only
                )
                VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17)
                RETURNING *;
            `;
            const values = [
                data.lessonTitle,
                data.lessonType,
                data.mediaUrl || null,
                data.mediaPublicId || null,
                data.description || null,
                data.departmentId || null,
                data.dateStart,
                data.dateEnd,
                data.progressPoints ?? 50,
                data.createdBy || null,
                data.roleCode || null,
                scope,
                data.assignment?.department_id || null,
                data.assignment?.section_id || null,
                data.assignment?.student_id || null,
                data.assignment?.group_id || null,
                data.assignment?.head_only ?? false,
            ];

            const result = await pool.query(query, values);
            return result.rows[0];
        } catch (error: any) {
            if (error.code === "23503") {
                throw new Error("આપેલ Department/Section/Student/Group ID ડેટાબેઝમાં હાજર નથી.");
            }
            throw new Error(error.message || "Lesson create કરતી વખતે એરર આવી.");
        }
    }

    // 2. Student side — "mane pahochti" lessons (scope logic pramane)
    static async getMyLessons(suid: number): Promise<LessonRow[]> {
        try {
            const userResult = await pool.query(
                `SELECT department_id, section_id, role_code FROM users WHERE suid = $1;`,
                [suid]
            );
            if (userResult.rows.length === 0) {
                throw new Error("User મળ્યો નથી.");
            }
            const user = userResult.rows[0];
            const isHead = user.role_code === "HEAD100" || user.role_code === "SECHEAD101";

            const query = `
                SELECT l.*
                FROM lessons l
                LEFT JOIN groups g ON l.assign_group_id = g.group_id
                WHERE
                    l.assign_scope = 'all'
                    OR (l.assign_scope = 'department' AND l.assign_department_id = $1 AND (l.assign_head_only = FALSE OR $2 = TRUE))
                    OR (l.assign_scope = 'section' AND l.assign_section_id = $3 AND (l.assign_head_only = FALSE OR $2 = TRUE))
                    OR (l.assign_scope = 'student' AND l.assign_student_id = $4)
                    OR (l.assign_scope = 'group' AND g.member_ids IS NOT NULL AND $4 = ANY(g.member_ids))
                ORDER BY l.created_at DESC;
            `;
            const result = await pool.query(query, [user.department_id, isHead, user.section_id, suid]);
            return result.rows;
        } catch (error: any) {
            throw new Error(error.message || "Lessons fetch કરવામાં એરર આવી.");
        }
    }

    // 3. Creator side — "maine banaveli" lessons list
    static async getCreatedLessons(suid: number): Promise<LessonRow[]> {
        try {
            const query = `
                SELECT l.*, d.department_name
                FROM lessons l
                LEFT JOIN departments d ON l.department_id = d.department_id
                WHERE l.created_by = $1
                ORDER BY l.created_at DESC;
            `;
            const result = await pool.query(query, [suid]);
            return result.rows;
        } catch (error: any) {
            throw new Error("Lessons fetch કરવામાં એરર આવી.");
        }
    }

    // 4. Delete
    static async deleteLesson(lessonId: number): Promise<LessonRow> {
        try {
            const result = await pool.query(`DELETE FROM lessons WHERE lesson_id = $1 RETURNING *;`, [lessonId]);
            if (result.rows.length === 0) {
                throw new Error("Lesson મળ્યું નથી.");
            }
            return result.rows[0];
        } catch (error: any) {
            throw new Error(error.message || "Lesson delete કરવામાં એરર આવી.");
        }
    }
}