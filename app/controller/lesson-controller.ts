// 📂 app/controller/lesson-controller.ts

import { Request, Response } from "express";
import { LessonService } from "../service/lesson-service";

export class LessonController {

    async createLesson(req: Request, res: Response): Promise<void> {
        try {
            const { lesson_title, lesson_type, department_id, date_start, date_end, description, progress_points, assignment } = req.body;

            if (!lesson_title || !lesson_type || !date_start || !date_end) {
                res.status(400).json({ success: false, message: "Title, type, start date ane end date jaruri chhe." });
                return;
            }

            // 🎯 FormData mokalvathi assignment JSON string tarike aave chhe, ahi parse karvu padshe
            let parsedAssignment;
            try {
                parsedAssignment = typeof assignment === "string" ? JSON.parse(assignment) : assignment;
            } catch {
                res.status(400).json({ success: false, message: "Assignment data invalid chhe." });
                return;
            }

            // 🎯 uploadLesson middleware pachi req.file available hoy chhe (Daily Darshan pattern j — req.file.path vapro)
            const mediaUrl = req.file ? (req.file as any).path : null;
            const mediaPublicId = req.file ? (req.file as any).filename : null;

            const lesson = await LessonService.createLesson({
                lessonTitle: lesson_title,
                lessonType: lesson_type,
                mediaUrl,
                mediaPublicId,
                description,
                departmentId: department_id ? Number(department_id) : null,
                dateStart: date_start,
                dateEnd: date_end,
                progressPoints: progress_points ? Number(progress_points) : 50,
                createdBy: req.user?.suid ?? null,       // 🎯 auth-middleware thi
                roleCode: req.user?.roleCode ?? null,
                assignment: parsedAssignment,
            });

            res.status(201).json({ success: true, message: "Lesson create thai gayu!", data: lesson });
        } catch (error: any) {
            res.status(400).json({ success: false, message: error.message || "Lesson create karva ma error aavi." });
        }
    }

    async getMyLessons(req: Request, res: Response): Promise<void> {
        try {
            const suid = req.user?.suid;
            if (!suid) {
                res.status(401).json({ success: false, message: "User identify na thayo." });
                return;
            }
            const lessons = await LessonService.getMyLessons(suid);
            res.status(200).json({ success: true, data: lessons });
        } catch (error: any) {
            res.status(400).json({ success: false, message: error.message || "Lessons fetch karva ma error aavi." });
        }
    }

    async getCreatedLessons(req: Request, res: Response): Promise<void> {
        try {
            const suid = req.user?.suid;
            if (!suid) {
                res.status(401).json({ success: false, message: "User identify na thayo." });
                return;
            }
            const lessons = await LessonService.getCreatedLessons(suid);
            res.status(200).json({ success: true, data: lessons });
        } catch (error: any) {
            res.status(400).json({ success: false, message: error.message || "Lessons fetch karva ma error aavi." });
        }
    }

    async deleteLesson(req: Request, res: Response): Promise<void> {
        try {
            const lessonId = Number(req.params.id);
            await LessonService.deleteLesson(lessonId);
            res.status(200).json({ success: true, message: "Lesson delete thai gayu." });
        } catch (error: any) {
            res.status(404).json({ success: false, message: error.message || "Lesson na madyu." });
        }
    }
}