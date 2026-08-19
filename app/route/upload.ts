import express, { Request, Response } from 'express';
import upload from '../config/upload';

const router = express.Router();

router.post(
  '/upload',
  upload.single('image'),
  (req: Request, res: Response) => {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    res.json({
      message: 'Image uploaded successfully!',
      imageUrl: (req.file as any).path,
      publicId: (req.file as any).filename,
    });
  }
);

export default router;