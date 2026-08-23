import { pool } from "../db/database";
import { QuoteCreateInput, QuoteType } from "../module/quote-module";

export class QuoteService {
    static async createQuote(data: QuoteCreateInput): Promise<any> {
        try {
            const query = `
                INSERT INTO quotes (type, image_url, public_id, description, event_date)
                VALUES ($1, $2, $3, $4, $5)
                RETURNING id, type, image_url, public_id, description, event_date, created_at;
            `;
            const values = [
                data.type,
                data.image_url,
                data.public_id,
                data.description || null,
                data.event_date,
            ];
            const result = await pool.query(query, values);
            return result.rows[0];
        } catch (error) {
            throw error;
        }
    }

    static async getQuotesByType(type: QuoteType): Promise<any> {
        try {
            const query = `
                SELECT id, type, image_url, public_id, description, event_date, created_at
                FROM quotes
                WHERE type = $1
                ORDER BY event_date DESC, created_at DESC;
            `;
            const result = await pool.query(query, [type]);
            return result.rows;
        } catch (error) {
            throw error;
        }
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