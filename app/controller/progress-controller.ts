import { Request, Response } from "express";
import { ProgressService } from "../service/progress-service";

export class ProgressController {

    async getAllDepartmentsProgress(req: Request, res: Response): Promise<void> {
        try {
            const data = await ProgressService.getAllDepartmentsProgress();
            res.status(200).json({ success: true, data });
        } catch (error: any) {
            res.status(500).json({ success: false, message: error.message || "Internal Server Error" });
        }
    }

    async getDepartmentProgress(req: Request, res: Response): Promise<void> {
        try {
            const departmentId = Number(req.params.id);
            const data = await ProgressService.getDepartmentProgress(departmentId);
            res.status(200).json({ success: true, data });
        } catch (error: any) {
            res.status(404).json({ success: false, message: error.message || "Department progress not found" });
        }
    }

    async getSectionProgress(req: Request, res: Response): Promise<void> {
        try {
            const sectionId = Number(req.params.id);
            const data = await ProgressService.getSectionProgress(sectionId);
            res.status(200).json({ success: true, data });
        } catch (error: any) {
            res.status(404).json({ success: false, message: error.message || "Section progress not found" });
        }
    }

    async getUserProgress(req: Request, res: Response): Promise<void> {
        try {
            const suid = Number(req.params.suid);
            const data = await ProgressService.getUserProgress(suid);
            res.status(200).json({ success: true, data });
        } catch (error: any) {
            res.status(404).json({ success: false, message: error.message || "User progress not found" });
        }
    }
}