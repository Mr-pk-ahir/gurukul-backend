import { pool } from "../db/database";
import { QuoteCreateInput, QuoteType } from "../module/quote-module";

function isWithinEventWindow(startDate?: string, endDate?: string): boolean {
    if (!startDate || !endDate) return false;
    const today = new Date();
    const todayValue = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
    return todayValue >= startDate.slice(0, 10) && todayValue <= endDate.slice(0, 10);
}

export class QuoteService {
    static async createQuote(data: QuoteCreateInput): Promise<any> {
        try {
            const query = `
                INSERT INTO quotes (
                    type, image_url, public_id, title, description, event_date, name,
                    display_start_date, display_end_date, event_start_date, event_end_date,
                    is_approved, status,
                    add_to_hero
                )
                VALUES ($1, $2, $3, $4, $5, $6, $4, $7, $8, $9, $10, $11, $12, $13)
                RETURNING id, type, image_url, public_id, description, event_date, created_at,
                    name, display_start_date, display_end_date, event_start_date, event_end_date,
                    is_approved,
                    CASE
                        WHEN type = 'event'
                            AND event_start_date IS NOT NULL
                            AND event_end_date IS NOT NULL
                            AND CURRENT_DATE BETWEEN event_start_date AND event_end_date
                        THEN 'Active'
                        ELSE status
                    END AS status,
                    add_to_hero;
            `;
            const effectiveStatus = data.type === "event" && isWithinEventWindow(data.event_start_date, data.event_end_date)
                ? "Active"
                : (data.status || "Active");
            const values = [
                data.type,
                data.image_url,
                data.public_id,
                data.name || "Untitled event",
                data.description || null,
                data.event_date,
                data.display_start_date || data.event_date,
                data.display_end_date || data.event_date,
                data.event_start_date || data.event_date,
                data.event_end_date || data.event_date,
                data.is_approved || "Pending",
                effectiveStatus,
                data.add_to_hero || "No",
            ];
            const result = await pool.query(query, values);
            return result.rows[0];
        } catch (error) {
            throw error;
        }
    }

    static async getQuotesByType(type: QuoteType, includeUnapproved = false): Promise<any> {
        try {
            const query = `
                SELECT id, type, image_url, public_id, description, event_date, created_at,
                    name, display_start_date, display_end_date, event_start_date, event_end_date,
                    is_approved,
                    CASE
                        WHEN type = 'event'
                            AND event_start_date IS NOT NULL
                            AND event_end_date IS NOT NULL
                            AND CURRENT_DATE BETWEEN event_start_date AND event_end_date
                        THEN 'Active'
                        ELSE status
                    END AS status,
                    add_to_hero
                FROM quotes
                WHERE type = $1
                    AND ($2 = TRUE OR type <> 'event' OR is_approved = 'Approved')
                ORDER BY event_date DESC, created_at DESC;
            `;
            const result = await pool.query(query, [type, includeUnapproved]);
            return result.rows;
        } catch (error) {
            throw error;
        }
    }

    static async updateQuote(id: number, data: QuoteCreateInput): Promise<any> {
        const effectiveStatus = data.type === "event" && isWithinEventWindow(data.event_start_date, data.event_end_date)
            ? "Active"
            : (data.status || "Active");
        const query = `
            UPDATE quotes
            SET image_url = COALESCE($2, image_url),
                public_id = COALESCE($3, public_id),
                title = COALESCE($4, title),
                description = $5,
                event_date = $6,
                name = COALESCE($4, name),
                display_start_date = $7,
                display_end_date = $8,
                event_start_date = $9,
                event_end_date = $10,
                is_approved = $11,
                status = $12,
                add_to_hero = $13
            WHERE id = $1
            RETURNING id, type, image_url, public_id, description, event_date, created_at,
                name, display_start_date, display_end_date, event_start_date, event_end_date,
                is_approved,
                CASE
                    WHEN type = 'event'
                        AND event_start_date IS NOT NULL
                        AND event_end_date IS NOT NULL
                        AND CURRENT_DATE BETWEEN event_start_date AND event_end_date
                    THEN 'Active'
                    ELSE status
                END AS status,
                add_to_hero;
        `;
        const result = await pool.query(query, [
            id,
            data.image_url || null,
            data.public_id || null,
            data.name || null,
            data.description || null,
            data.event_date,
            data.display_start_date || data.event_date,
            data.display_end_date || data.event_date,
            data.event_start_date || data.event_date,
            data.event_end_date || data.event_date,
            data.is_approved || "Pending",
            effectiveStatus,
            data.add_to_hero || "No",
        ]);
        return result.rows[0];
    }

    // Delete karta pahela public_id joie (Cloudinary thi image delete karva mate)
    static async getQuoteById(id: number): Promise<any> {
        try {
            const query = `SELECT * FROM quotes WHERE id = $1;`;
            const result = await pool.query(query, [id]);
            return result.rows[0];
        } catch (error) {
            throw error;
        }
    }

    static async deleteQuote(id: number): Promise<any> {
        try {
            const query = `DELETE FROM quotes WHERE id = $1 RETURNING id, public_id;`;
            const result = await pool.query(query, [id]);
            return result.rows[0];
        } catch (error) {
            throw error;
        }
    }
}