import { Request, Response } from "express";
import { QuoteService } from "../service/Quote-service";
import cloudinary from "../config/cloudinary";

class QuoteController {
    async createQuote(req: Request, res: Response): Promise<Response> {
        try {
            const { type, date, description } = req.body;
            const file = req.file as any; // multer-storage-cloudinary thi aavelu file object

            if (!type || !["activity", "event"].includes(type)) {
                return res.status(400).json({ success: false, message: "type 'activity' ke 'event' j hovu joie" });
            }
            if (!date) {
                return res.status(400).json({ success: false, message: "date jaruri chhe" });
            }
            if (!file) {
                return res.status(400).json({ success: false, message: "Image jaruri chhe" });
            }

            const newQuote = await QuoteService.createQuote({
                type,
                image_url: file.path,      // Cloudinary secure URL
                public_id: file.filename,  // Cloudinary public_id (delete mate joie)
                description,
                event_date: date,
            });

            return res.status(201).json({ success: true, data: newQuote });
        } catch (error) {
            console.error("createQuote error:", error);
            return res.status(500).json({ success: false, message: "Error creating quote" });
        }
    }

    async getQuotesByType(req: Request, res: Response): Promise<Response> {
        try {
            const { type } = req.params;

            if (type !== "activity" && type !== "event") {
                return res.status(400).json({ success: false, message: "Invalid type — 'activity' ke 'event' j hoi shake" });
            }

            const quotes = await QuoteService.getQuotesByType(type);
            return res.status(200).json({ success: true, data: quotes });
        } catch (error) {
            console.error("getQuotesByType error:", error);
            return res.status(500).json({ success: false, message: "Error fetching quotes" });
        }
    }

    async deleteQuote(req: Request, res: Response): Promise<Response> {
        try {
            const id = Number(req.params.id);
            if (Number.isNaN(id)) {
                return res.status(400).json({ success: false, message: "Invalid id" });
            }

            const existing = await QuoteService.getQuoteById(id);
            if (!existing) {
                return res.status(404).json({ success: false, message: "Quote not found" });
            }

            // Cloudinary thi image pan delete karo (DB record delete karta pahela)
            if (existing.public_id) {
                try {
                    await cloudinary.uploader.destroy(existing.public_id);
                } catch (cloudErr) {
                    console.error("⚠️ Cloudinary image delete failed (DB record delete continue thashe):", cloudErr);
                }
            }

            await QuoteService.deleteQuote(id);
            return res.status(200).json({ success: true, message: "Quote deleted successfully" });
        } catch (error) {
            console.error("deleteQuote error:", error);
            return res.status(500).json({ success: false, message: "Error deleting quote" });
        }
    }
}

export default new QuoteController();