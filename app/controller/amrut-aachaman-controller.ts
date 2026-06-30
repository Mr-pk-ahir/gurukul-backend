import { Request, Response } from 'express';
import amrutAachamanService from '../service/amrut-aachaman-service';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const uploadDir = path.join(__dirname, '../../../uploads/amrut-aachaman');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (_req, _file, cb) => {
        cb(null, uploadDir); 
    },
    filename: (_req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

export const uploadImage = multer({
    storage: storage,
    limits: { fileSize: 60 * 1024 * 1024 },
    fileFilter: (_req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed!'));
        }
    }
});

class AmrutAachamanController {
    
    async create(req: Request, res: Response) {
        try {
            const { description, date } = req.body;
            
            if (!req.file) {
                return res.status(400).json({ success: false, message: 'Image file is required' });
            }

            const imageUrl = `/uploads/amrut-aachaman/${req.file.filename}`;

            const record = await amrutAachamanService.addRecord({
                image: imageUrl,
                description,
                date
            });

            return res.status(201).json({ success: true, data: record });

        } catch (error: any) {
            return res.status(400).json({ success: false, message: error.message });
        }
    }

    async getAll(_req: Request, res: Response) {
        try {
            const records = await amrutAachamanService.getRecentRecords();
            return res.status(200).json({ success: true, data: records });
        } catch (error: any) {
            return res.status(500).json({ success: false, message: error.message });
        }
    }
}

export default new AmrutAachamanController();