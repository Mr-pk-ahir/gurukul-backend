import { pool } from "../db/database";
import { UserProgress, SectionProgress, DepartmentProgress } from "../module/task-module";

function calcPercentage(completed: number, total: number): number {
    if (total === 0) return 0;
    return Math.round((completed / total) * 100);
}

export class ProgressService {

    // 1. Ek user nu progress (task list sathe)
    static async getUserProgress(suid: number): Promise<UserProgress> {
        try {
            const userRes = await pool.query(
                `SELECT suid, name, avatar FROM users WHERE suid = $1;`,
                [suid]
            );
            if (userRes.rows.length === 0) {
                throw new Error("User મળ્યો નથી.");
            }
            const user = userRes.rows[0];

            const taskRes = await pool.query(
                `SELECT 
                    COUNT(*) AS total,
                    COUNT(*) FILTER (WHERE status = 'COMPLETED') AS completed
                 FROM tasks WHERE assigned_to = $1;`,
                [suid]
            );

            const total = Number(taskRes.rows[0].total);
            const completed = Number(taskRes.rows[0].completed);

            return {
                suid: user.suid,
                name: user.name,
                avatar: user.avatar,
                totalTasks: total,
                completedTasks: completed,
                percentage: calcPercentage(completed, total),
            };
        } catch (error: any) {
            throw new Error(error.message || "User progress fetch કરવામાં એરર આવી.");
        }
    }

    // 2. Ek section nu progress — section na badha users ni progress sathe
    static async getSectionProgress(sectionId: number): Promise<SectionProgress> {
        try {
            const sectionRes = await pool.query(
                `SELECT section_id, name, department_id FROM sections WHERE section_id = $1;`,
                [sectionId]
            );
            if (sectionRes.rows.length === 0) {
                throw new Error("Section મળ્યું નથી.");
            }
            const section = sectionRes.rows[0];

            // Section na badha users (section head + students)
            const usersRes = await pool.query(
                `SELECT suid, name, avatar FROM users WHERE section_id = $1 ORDER BY name ASC;`,
                [sectionId]
            );

            const users: UserProgress[] = [];
            let sectionTotal = 0;
            let sectionCompleted = 0;

            for (const u of usersRes.rows) {
                const taskRes = await pool.query(
                    `SELECT 
                        COUNT(*) AS total,
                        COUNT(*) FILTER (WHERE status = 'COMPLETED') AS completed
                     FROM tasks WHERE assigned_to = $1;`,
                    [u.suid]
                );
                const total = Number(taskRes.rows[0].total);
                const completed = Number(taskRes.rows[0].completed);

                sectionTotal += total;
                sectionCompleted += completed;

                users.push({
                    suid: u.suid,
                    name: u.name,
                    avatar: u.avatar,
                    totalTasks: total,
                    completedTasks: completed,
                    percentage: calcPercentage(completed, total),
                });
            }

            return {
                section_id: section.section_id,
                name: section.name,
                department_id: section.department_id,
                totalTasks: sectionTotal,
                completedTasks: sectionCompleted,
                percentage: calcPercentage(sectionCompleted, sectionTotal),
                users,
            };
        } catch (error: any) {
            throw new Error(error.message || "Section progress fetch કરવામાં એરર આવી.");
        }
    }

    // 3. Ek department nu progress — dept na badha sections ni progress sathe
    static async getDepartmentProgress(departmentId: number): Promise<DepartmentProgress> {
        try {
            const deptRes = await pool.query(
                `SELECT department_id, department_name FROM departments WHERE department_id = $1;`,
                [departmentId]
            );
            if (deptRes.rows.length === 0) {
                throw new Error("Department મળ્યો નથી.");
            }
            const dept = deptRes.rows[0];

            const sectionsRes = await pool.query(
                `SELECT section_id FROM sections WHERE department_id = $1 ORDER BY section_id ASC;`,
                [departmentId]
            );

            const sections: SectionProgress[] = [];
            let deptTotal = 0;
            let deptCompleted = 0;

            for (const s of sectionsRes.rows) {
                const sectionProgress = await this.getSectionProgress(s.section_id);
                deptTotal += sectionProgress.totalTasks;
                deptCompleted += sectionProgress.completedTasks;
                sections.push(sectionProgress);
            }

            return {
                department_id: dept.department_id,
                department_name: dept.department_name,
                totalTasks: deptTotal,
                completedTasks: deptCompleted,
                percentage: calcPercentage(deptCompleted, deptTotal),
                sections,
            };
        } catch (error: any) {
            throw new Error(error.message || "Department progress fetch કરવામાં એરર આવી.");
        }
    }

    // 4. Badha departments ni summary (Super Admin dropdown mate — sirf %, sections/users vagar, fast)
    static async getAllDepartmentsProgress(): Promise<{ department_id: number; department_name: string; percentage: number }[]> {
        try {
            const query = `
                SELECT 
                    d.department_id,
                    d.department_name,
                    COUNT(t.task_id) AS total,
                    COUNT(t.task_id) FILTER (WHERE t.status = 'COMPLETED') AS completed
                FROM departments d
                LEFT JOIN tasks t ON t.department_id = d.department_id
                GROUP BY d.department_id, d.department_name
                ORDER BY d.department_name ASC;
            `;
            const result = await pool.query(query);
            return result.rows.map((row: any) => ({
                department_id: row.department_id,
                department_name: row.department_name,
                percentage: calcPercentage(Number(row.completed), Number(row.total)),
            }));
        } catch (error: any) {
            throw new Error("Departments progress fetch કરવામાં એરર આવી.");
        }
    }
}