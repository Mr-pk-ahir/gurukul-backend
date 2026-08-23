import multer from "multer";

import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "./cloudinary";

// 🎯 Ek j function thi kai bhi folder mate upload middleware banavi shakay
// Example: createUploader("avatars"), createUploader("overview"), createUploader("sections")
export function createUploader(folderName: string) {
    const storage = new CloudinaryStorage({
        cloudinary: cloudinary,
        params: async () => ({
            folder: `gurukul/${folderName}`,
            allowed_formats: ["jpg", "jpeg", "png", "webp"],
            transformation: [{ width: 800, height: 800, crop: "limit" }],
        }),
    });

    return multer({
        storage,
        limits: { fileSize: 60 * 1024 * 1024 }, // 🎯 FIX: 5MB thi 60MB kari
        fileFilter: (req, file, cb) => {
            if (!file.mimetype.startsWith("image/")) {
                cb(new Error("Sirf image files (jpg, png, webp) allowed che."));
                return;
            }
            cb(null, true);
        },
    });
}

// 🎯 Sabse common use-cases mate ready-made uploaders
export const uploadAvatar = createUploader("avatars");
export const uploadOverview = createUploader("overview");
export const uploadSection = createUploader("sections");
export const uploadQuote = createUploader("quotes"); // 🆕 Activities + Events mate
export const uploadDailyDarshan = createUploader("daily-darshan"); // 🆕 NAVU: Daily Darshan mate alag Cloudinary folder

// Default export — jem tamaru existing "../config/upload" import karyu che (Routes.ts ma "upload.single")
export default uploadOverview;