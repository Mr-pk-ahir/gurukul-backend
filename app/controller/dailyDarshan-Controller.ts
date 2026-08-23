import { Request, Response } from "express";
import { DailyDarshanService } from "../service/dailyDarshan-Service";
import { mapDailyDarshanRowToDTO } from "../module/dailyDarshan-module";

export class DailyDarshanController {
    private dailyDarshanService = new DailyDarshanService();

    // 🎯 POST /daily-darshan — route ma uploadDailyDarshan.single("image") middleware lagavvu padse
    create = async (req: Request, res: Response) => {
        try {
            const { title, description, date } = req.body;

            if (!req.file) {
                return res.status(400).json({ success: false, message: "Image is required" });
            }
            if (!title) {
                return res.status(400).json({ success: false, message: "Title is required" });
            }

            // 🎯 FIX: Cloudinary vaparta req.file.path j full secure URL hoy chhe (https://res.cloudinary.com/...).
            // req.file.filename to Cloudinary no internal public_id hoy chhe, URL nathi hoto — ene local
            // "/uploads/" path sathe join karvu khotu hatu (broken image). Have direct full URL store karo.
            const imageUrl = req.file.path;
            const finalDate = date || new Date().toISOString().split("T")[0];

            const row = await this.dailyDarshanService.create(title, imageUrl, description || "", finalDate);

            return res.status(201).json({ success: true, data: mapDailyDarshanRowToDTO(row as any) });
        } catch (error: any) {
            console.error("Daily Darshan create error:", error.message);
            return res.status(500).json({ success: false, message: "Failed to create daily darshan entry" });
        }
    };

    // 🎯 GET /daily-darshan — Public page + Admin list banne j use kare
    getAll = async (req: Request, res: Response) => {
        try {
            const rows = await this.dailyDarshanService.getAll();
            const data = rows.map((r) => mapDailyDarshanRowToDTO(r as any));
            return res.json({ success: true, data });
        } catch (error: any) {
            console.error("Daily Darshan getAll error:", error.message);
            return res.status(500).json({ success: false, message: "Failed to fetch daily darshan entries" });
        }
    };

    update = async (req: Request, res: Response) => {
        try {
            const id = Number(req.params.id);
            const { title, description, date } = req.body;
            if (!id || !title) return res.status(400).json({ success: false, message: "Valid id and title are required" });

            const imageUrl = req.file?.path;
            const row = await this.dailyDarshanService.update(id, title, description || "", date, imageUrl);
            if (!row) return res.status(404).json({ success: false, message: "Entry not found" });

            return res.json({ success: true, message: "Updated successfully", data: mapDailyDarshanRowToDTO(row as any) });
        } catch (error: any) {
            console.error("Daily Darshan update error:", error.message);
            return res.status(500).json({ success: false, message: "Failed to update daily darshan entry" });
        }
    };

    // 🎯 DELETE /daily-darshan/:id — Admin management mate
    deleteById = async (req: Request, res: Response) => {
        try {
            const id = Number(req.params.id);
            const deleted = await this.dailyDarshanService.deleteById(id);

            if (!deleted) {
                return res.status(404).json({ success: false, message: "Entry not found" });
            }

            return res.json({ success: true, message: "Deleted successfully" });
        } catch (error: any) {
            console.error("Daily Darshan delete error:", error.message);
            return res.status(500).json({ success: false, message: "Failed to delete entry" });
        }
    };
}