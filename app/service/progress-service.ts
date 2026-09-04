import { pool } from "../db/database";
import { UserProgress, SectionProgress, DepartmentProgress, GrowthTrendPoint } from "../module/task-module";

function calcPercentage(completed: number, total: number): number {
    if (total === 0) return 0;
    return Math.round((completed / total) * 100);
}

export class ProgressService {

    // 🎯 Helper: Get growth trend for last 30 days (new student enrollments by date)
    static async getGrowthTrend(departmentId?: number, sectionId?: number): Promise<GrowthTrendPoint[]> {
        try {
            // 🎯 Metric: Count of students joining per day in the last 30 days
            // Using joining_date from users table where role_code = 'STUDENT'
            let query = `
                SELECT 
                    DATE(u.joining_date)::text AS date,
                    COUNT(u.suid) AS "newEnrollments",
                    (SELECT COUNT(*) FROM users u2 WHERE u2.role_code = 'STUDENT' AND DATE(u2.joining_date) <= DATE(u.joining_date)`;
            
            if (departmentId && !sectionId) query += ` AND u2.department_id = $1`;
            if (sectionId) query += ` AND u2.section_id = $1`;
            
            query += `)::int AS "totalActive"
                FROM users u
                WHERE u.role_code = 'STUDENT'
                    AND u.joining_date >= NOW() - INTERVAL '30 days'
                    AND u.joining_date <= NOW()`;
            
            if (departmentId && !sectionId) query += ` AND u.department_id = $1`;
            if (sectionId) query += ` AND u.section_id = $1`;
            
            query += `
                GROUP BY DATE(u.joining_date)
                ORDER BY DATE(u.joining_date) ASC;
            `;
            
            const params = [];
            if (departmentId && !sectionId) params.push(departmentId);
            if (sectionId) params.push(sectionId);
            
            const result = await pool.query(query, params);
            return result.rows.map(row => ({
                date: row.date,
                newEnrollments: Number(row.newEnrollments),
                totalActive: Number(row.totalActive)
            }));
        } catch (error: any) {
            console.error("❌ Growth trend fetch error:", error.message);
            return []; // Return empty array if trend data fails
        }
    }

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

    // 2. Ek section nu progress — section na badha STUDENTS ni progress sathe (heads + admins exclude karo)
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

            // 🎯 FIX: Only students, not heads or admins
            const usersRes = await pool.query(
                `SELECT suid, name, avatar FROM users WHERE section_id = $1 AND role_code = 'STUDENT' ORDER BY name ASC;`,
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

            // 🎯 Count actual students (excluding admins/heads)
            const studentCountRes = await pool.query(
                `SELECT COUNT(*) AS student_count FROM users WHERE section_id = $1 AND role_code = 'STUDENT';`,
                [sectionId]
            );
            const studentCount = Number(studentCountRes.rows[0]?.student_count || 0);

            // 🎯 Get growth trend for this section
            const growthTrend = await this.getGrowthTrend(undefined, sectionId);

            return {
                section_id: section.section_id,
                name: section.name,
                department_id: section.department_id,
                totalTasks: sectionTotal,
                completedTasks: sectionCompleted,
                percentage: calcPercentage(sectionCompleted, sectionTotal),
                users,
                studentCount, // 🎯 NEW: Return actual student count
                growthTrend, // 🎯 NEW: Last 30 days enrollment trend
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

            // 🎯 Get growth trend for this department
            const growthTrend = await this.getGrowthTrend(departmentId);

            return {
                department_id: dept.department_id,
                department_name: dept.department_name,
                totalTasks: deptTotal,
                completedTasks: deptCompleted,
                percentage: calcPercentage(deptCompleted, deptTotal),
                sections,
                growthTrend, // 🎯 NEW: Last 30 days enrollment trend for this department
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