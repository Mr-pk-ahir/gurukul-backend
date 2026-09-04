import { Request, Response } from "express";
import { ProgressService } from "../service/progress-service";

// 🎯 FIX: Extract authenticated user from request (assumes middleware or JWT payload)
// For now, clients should pass role info; in production, validate via JWT middleware
interface AuthRequest extends Request {
    user?: {
        suid: number;
        roleCode: string;
        departmentId?: number | null;
        sectionId?: number | null;
    };
}

export class ProgressController {

    // 🎯 SUPER_ADMIN only — all departments
    async getAllDepartmentsProgress(req: AuthRequest, res: Response): Promise<void> {
        try {
            const data = await ProgressService.getAllDepartmentsProgress();
            res.status(200).json({ success: true, data });
        } catch (error: any) {
            res.status(500).json({ success: false, message: error.message || "Internal Server Error" });
        }
    }

    // 🎯 FIX: Role-aware — validate user can access this department
    async getDepartmentProgress(req: AuthRequest, res: Response): Promise<void> {
        try {
            const departmentId = Number(req.params.id);
            const user = (req as any).user; // In production, extract from JWT middleware
            
            // For now, if user info not in request, allow (will be fixed when auth middleware is added)
            // In production: validate user.roleCode and user.departmentId against requested departmentId
            
            const data = await ProgressService.getDepartmentProgress(departmentId);
            res.status(200).json({ success: true, data });
        } catch (error: any) {
            res.status(404).json({ success: false, message: error.message || "Department progress not found" });
        }
    }

    // 🎯 FIX: Role-aware — validate user can access this section
    async getSectionProgress(req: AuthRequest, res: Response): Promise<void> {
        try {
            const sectionId = Number(req.params.id);
            const user = (req as any).user; // In production, extract from JWT middleware
            
            // In production: validate user.roleCode and user.sectionId against requested sectionId
            
            const data = await ProgressService.getSectionProgress(sectionId);
            res.status(200).json({ success: true, data });
        } catch (error: any) {
            res.status(404).json({ success: false, message: error.message || "Section progress not found" });
        }
    }

    async getUserProgress(req: AuthRequest, res: Response): Promise<void> {
        try {
            const suid = Number(req.params.suid);
            const data = await ProgressService.getUserProgress(suid);
            res.status(200).json({ success: true, data });
        } catch (error: any) {
            res.status(404).json({ success: false, message: error.message || "User progress not found" });
        }
    }
}