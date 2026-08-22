import { pool } from "../db/database";
import { TaskRow, ITaskCreate } from "../module/task-module";

export class TaskService {

    static async createTask(data: ITaskCreate): Promise<TaskRow> {
        try {
            if (!data.title || !data.assignedTo) {
                throw new Error("Task title અને Assigned User જરૂરી છે.");
            }

            const query = `
                INSERT INTO tasks (title, description, assigned_to, assigned_by, section_id, department_id, due_date)
                VALUES ($1, $2, $3, $4, $5, $6, $7)
                RETURNING *;
            `;
            const values = [
                data.title,
                data.description || null,
                data.assignedTo,
                data.assignedBy || null,
                data.sectionId || null,
                data.departmentId || null,
                data.dueDate || null,
            ];
            const result = await pool.query(query, values);
            return result.rows[0];
        } catch (error: any) {
            if (error.code === "23503") {
                throw new Error("આપેલ User/Section/Department ID ડેટાબેઝમાં હાજર નથી.");
            }
            throw new Error(error.message || "Task બનાવવામાં એરર આવી.");
        }
    }

    static async updateTaskStatus(taskId: number, status: "PENDING" | "IN_PROGRESS" | "COMPLETED"): Promise<TaskRow> {
        try {
            const query = `
                UPDATE tasks 
                SET status = $1, completed_at = CASE WHEN $1 = 'COMPLETED' THEN CURRENT_TIMESTAMP ELSE NULL END
                WHERE task_id = $2
                RETURNING *;
            `;
            const result = await pool.query(query, [status, taskId]);
            if (result.rows.length === 0) {
                throw new Error("Task મળ્યું નથી.");
            }
            return result.rows[0];
        } catch (error: any) {
            throw new Error(error.message || "Task update કરવામાં એરર આવી.");
        }
    }

    static async getTasksByUser(suid: number): Promise<TaskRow[]> {
        try {
            const query = `SELECT * FROM tasks WHERE assigned_to = $1 ORDER BY created_at DESC;`;
            const result = await pool.query(query, [suid]);
            return result.rows;
        } catch (error: any) {
            throw new Error("Tasks fetch કરવામાં એરર આવી.");
        }
    }

    static async deleteTask(taskId: number): Promise<TaskRow> {
        try {
            const query = `DELETE FROM tasks WHERE task_id = $1 RETURNING *;`;
            const result = await pool.query(query, [taskId]);
            if (result.rows.length === 0) {
                throw new Error("Task મળ્યું નથી.");
            }
            return result.rows[0];
        } catch (error: any) {
            throw new Error(error.message || "Task delete કરવામાં એરર આવી.");
        }
    }
}