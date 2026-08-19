import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "./cloudinary";
import { Request } from "express";

const storage = new CloudinaryStorage({
    cloudinary,
    params: async (req: Request, file: Express.Multer.File) => {
        const section = req.body.section || "misc";
        return {
            folder: `gurukul/overview/${section}`,
            allowed_formats: ["jpg", "png", "jpeg", "webp"],
            transformation: [
                { quality: "auto" },
                { fetch_format: "auto" },
            ],
        };
    },
});

const upload = multer({ storage });

export default upload;