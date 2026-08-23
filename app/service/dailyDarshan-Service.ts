import { pool } from "../db/database";
import { DailyDarshanRow } from "../module/dailyDarshan-module";

export class DailyDarshanService {
    // 🎯 CREATE: navi darshan entry add karo
    async create(title: string, imageUrl: string, description: string, date: string): Promise<DailyDarshanRow> {
        const result = await pool.query(
            `INSERT INTO daily_darshan (title, image_url, description, date)
             VALUES ($1, $2, $3, $4)
             RETURNING id, title, image_url, description, TO_CHAR(date, 'YYYY-MM-DD') AS date, created_at`,
            [title, imageUrl, description, date]
        );
        return result.rows[0];
    }

    // 🎯 GET ALL: Public page + Admin management banne j vapare, frontend date-wise filter kare
    // 🎯 FIX: TO_CHAR(date, 'YYYY-MM-DD') vaparyu — pg library baaki "date" column ne JS Date object
    // banavi de chhe, jehu res.json() thi full ISO timestamp ("2026-08-23T00:00:00.000Z") tarike jay chhe,
    // ane frontend nu "item.date === todayISO" ("2026-08-23") comparison kadi match j nathi thatu.
    async getAll(): Promise<DailyDarshanRow[]> {
        const result = await pool.query(
            `SELECT id, title, image_url, description, TO_CHAR(date, 'YYYY-MM-DD') AS date, created_at
             FROM daily_darshan
             ORDER BY date DESC, created_at DESC`
        );
        return result.rows;
    }

    // 🎯 DELETE: admin management mate
    async deleteById(id: number): Promise<DailyDarshanRow | null> {
        const result = await pool.query(
            `DELETE FROM daily_darshan WHERE id = $1 RETURNING id, image_url`,
            [id]
        );
        return result.rows[0] || null;
    }
}