import { pool } from "../db/database";
import cloudinary from "../config/cloudinary";
import {
    OverviewImageRow,
    SectionType,
    GroupedOverviewData,
    validSections,
    GroupedOverviewDataWithId,
} from "../module/overview-module";

export class OverviewService {

    public async getOverviewData(): Promise<GroupedOverviewDataWithId> {
        const result = await pool.query(
            `SELECT * FROM overview_images ORDER BY created_at ASC`
        );
        const rows: OverviewImageRow[] = result.rows;

        return {
            heroSlider: rows.filter(r => r.section === "heroSlider").map(r => ({ id: r.id, url: r.url })),
            featureImage: rows.filter(r => r.section === "featureImage").map(r => ({ id: r.id, url: r.url })),
            smartInfrastructure: rows.filter(r => r.section === "smartInfrastructure").map(r => ({ id: r.id, url: r.url })),
        };
    }

    public async uploadOverviewImage(
        section: SectionType,
        url: string,
        publicId: string
    ): Promise<OverviewImageRow> {
        if (!validSections.includes(section)) {
            throw new Error("Invalid section");
        }

        const result = await pool.query(
            `INSERT INTO overview_images (section, url, public_id)
             VALUES ($1, $2, $3)
             RETURNING *`,
            [section, url, publicId]
        );
        return result.rows[0];
    }

    public async deleteOverviewImage(id: number): Promise<OverviewImageRow> {
        const existing = await pool.query(
            `SELECT * FROM overview_images WHERE id = $1`,
            [id]
        );

        const image: OverviewImageRow = existing.rows[0];
        if (!image) {
            throw new Error("Image not found");
        }

        await cloudinary.uploader.destroy(image.public_id);

        const deleted = await pool.query(
            `DELETE FROM overview_images WHERE id = $1 RETURNING *`,
            [id]
        );

        return deleted.rows[0];
    }
}