import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "./cloudinary";

// ==================== 1) IMAGE-ONLY UPLOADER (factory) ====================
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
        limits: { fileSize: 60 * 1024 * 1024 },
        fileFilter: (req, file, cb) => {
            if (!file.mimetype.startsWith("image/")) {
                cb(new Error("Sirf image files (jpg, png, webp) allowed che."));
                return;
            }
            cb(null, true);
        },
    });
}

export const uploadAvatar = createUploader("avatars");
export const uploadOverview = createUploader("overview");
export const uploadSection = createUploader("sections");
export const uploadQuote = createUploader("quotes");
export const uploadDailyDarshan = createUploader("daily-darshan");

// ==================== 2) LESSON MEDIA UPLOADER (video/audio/image/doc) ====================
const lessonStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: async (req, file) => {
        let resource_type: "image" | "video" | "raw" = "raw";
        if (file.mimetype.startsWith("image/")) resource_type = "image";
        else if (file.mimetype.startsWith("video/") || file.mimetype.startsWith("audio/")) resource_type = "video";

        return {
            folder: "gurukul/lessons",
            resource_type,
            allowed_formats: ["jpg", "jpeg", "png", "webp", "mp4", "mov", "avi", "mkv", "mp3", "wav", "m4a", "pdf", "doc", "docx", "ppt", "pptx"],
        };
    },
});

export const uploadLesson = multer({
    storage: lessonStorage,
    limits: { fileSize: 200 * 1024 * 1024 },
});

// ==================== Default export (existing "upload.single") mate ====================
export default uploadOverview;