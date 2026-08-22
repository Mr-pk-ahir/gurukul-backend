import { Request, Response } from "express";

export class UploadController {

    async uploadImage(req: Request, res: Response): Promise<void> {
        try {
            if (!req.file) {
                res.status(400).json({ success: false, message: "Koi file upload nathi thai." });
                return;
            }

            const fileWithCloudinary = req.file as Express.Multer.File & { path: string; filename: string };

            res.status(200).json({
                success: true,
                message: "Image uploaded successfully",
                url: fileWithCloudinary.path,
                publicId: fileWithCloudinary.filename,
            });
        } catch (error: any) {
            res.status(500).json({ success: false, message: error.message || "Image upload karva ma error aavi." });
        }
    }
}