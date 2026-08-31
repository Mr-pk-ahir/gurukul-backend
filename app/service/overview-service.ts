import { pool } from "../db/database";
import cloudinary from "../config/cloudinary";
import {
    OverviewImageRow,
    SectionType,
    GroupedOverviewDataWithId,
    validSections,
} from "../module/overview-module";

export class OverviewService {

    private async ensureMetadataColumns(): Promise<void> {
        await pool.query(`
            ALTER TABLE overview_images
            ADD COLUMN IF NOT EXISTS title TEXT NOT NULL DEFAULT '',
            ADD COLUMN IF NOT EXISTS description TEXT NOT NULL DEFAULT ''
        `);
    }

    public async getOverviewData(): Promise<GroupedOverviewDataWithId> {
        await this.ensureMetadataColumns();
        const result = await pool.query(
            `SELECT * FROM overview_images ORDER BY created_at ASC`
        );
        const rows: OverviewImageRow[] = result.rows;

        return {
            heroSlider: rows.filter(r => r.section === "heroSlider").map(r => ({ id: r.id, url: r.url, title: r.title, description: r.description })),
            featureImage: rows.filter(r => r.section === "featureImage").map(r => ({ id: r.id, url: r.url, title: r.title, description: r.description })),
            smartInfrastructure: rows.filter(r => r.section === "smartInfrastructure").map(r => ({ id: r.id, url: r.url, title: r.title, description: r.description })),
        };
    }

    public async uploadOverviewImage(
        section: SectionType,
        url: string,
        publicId: string,
        title: string,
        description: string
    ): Promise<OverviewImageRow> {
        await this.ensureMetadataColumns();
        if (!validSections.includes(section)) {
            throw new Error("Invalid section");
        }

        const result = await pool.query(
            `INSERT INTO overview_images (section, url, public_id, title, description)
             VALUES ($1, $2, $3, $4, $5)
             RETURNING *`,
            [section, url, publicId, title, description]
        );
        return result.rows[0];
    }

    public async updateOverviewMetadata(id: number, title: string, description: string): Promise<OverviewImageRow> {
        await this.ensureMetadataColumns();
        const result = await pool.query(
            `UPDATE overview_images
             SET title = $2, description = $3
             WHERE id = $1
             RETURNING *`,
            [id, title, description]
        );
        if (!result.rows[0]) {
            throw new Error("Image not found");
        }
        return result.rows[0];
    }

    public async deleteOverviewImage(id: number): Promise<OverviewImageRow> {
        await this.ensureMetadataColumns();
        const existing = await pool.query(
            `SELECT * FROM overview_images WHERE id = $1`,
            [id]
        );

        const image: OverviewImageRow = existing.rows[0];
        if (!image) {
            throw new Error("Image not found");
        }

        // 🎯 FIX: Default/seed images (public_id "SEED-" thi start thay che) Cloudinary par
        // actual exist j nathi karta — e case ma cloudinary.destroy() error throw kare che
        // ane pura delete flow crash thai jay che. Etle e ne try-catch ma wrap karyu —
        // Cloudinary delete fail thay to pan DB row delete thavu joie j.
        if (!image.public_id.startsWith("SEED-")) {
            try {
                await cloudinary.uploader.destroy(image.public_id);
            } catch (cloudinaryError) {
                console.error("⚠️ Cloudinary delete failed (DB delete continue thashe):", cloudinaryError);
            }
        }

        const deleted = await pool.query(
            `DELETE FROM overview_images WHERE id = $1 RETURNING *`,
            [id]
        );

        return deleted.rows[0];
    }
}