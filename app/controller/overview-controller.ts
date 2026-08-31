import { Request, Response } from "express";
import { OverviewService } from "../service/overview-service";
import { SectionType, validSections } from "../module/overview-module";

const overviewService = new OverviewService();

export class OverviewController {

    public async getOverview(req: Request, res: Response): Promise<Response> {
        try {
            const data = await overviewService.getOverviewData();
            return res.status(200).json({ success: true, data });
        } catch (error: any) {
            return res.status(500).json({ success: false, message: error.message });
        }
    }

    public async updateOverview(req: Request, res: Response): Promise<Response> {
        try {
            if (!req.file) {
                return res.status(400).json({ success: false, message: "No file uploaded" });
            }

            const { section, title = "", description = "" } = req.body as { section: SectionType; title?: string; description?: string };
            if (!validSections.includes(section)) {
                return res.status(400).json({ success: false, message: "Invalid section" });
            }

            const file = req.file as any;
            const saved = await overviewService.uploadOverviewImage(section, file.path, file.filename, title.trim(), description.trim());

            return res.status(201).json({ success: true, message: "Overview updated successfully", data: saved });
        } catch (error: any) {
            return res.status(500).json({ success: false, message: error.message });
        }
    }

    public async updateOverviewMetadata(req: Request, res: Response): Promise<Response> {
        try {
            const { id } = req.params;
            const { title = "", description = "" } = req.body as { title?: string; description?: string };
            const updated = await overviewService.updateOverviewMetadata(Number(id), title.trim(), description.trim());
            return res.status(200).json({ success: true, data: updated });
        } catch (error: any) {
            const status = error.message === "Image not found" ? 404 : 500;
            return res.status(status).json({ success: false, message: error.message });
        }
    }

    // 🚀 Navu method - image delete karva mate (Cloudinary + DB banne thi)
    public async deleteOverviewImage(req: Request, res: Response): Promise<Response> {
        try {
            const { id } = req.params;

            if (!id) {
                return res.status(400).json({ success: false, message: "Image id is required." });
            }

            await overviewService.deleteOverviewImage(Number(id));
            return res.status(200).json({ success: true, message: "Image deleted successfully" });
        } catch (error: any) {
            if (error.message === "Image not found") {
                return res.status(404).json({ success: false, message: error.message });
            }
            return res.status(500).json({ success: false, message: error.message });
        }
    }
}

export default new OverviewController();