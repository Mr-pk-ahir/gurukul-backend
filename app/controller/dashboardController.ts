import { Request, Response } from "express";
import { dashboardService } from "../service/dashboardService";

export const getDashboardStats = async (req: Request, res: Response) => {
    try {
        const role = String(req.query.role || "");
        const range = req.query.range === "week" ? "week" : "month";

        let data;

        if (role === "SUPER_ADMIN") {
            data = await dashboardService.getSuperAdminStats(range);
        } else if (role === "HEAD100") {
            const departmentId = Number(req.query.departmentId);
            if (!departmentId) return res.status(400).json({ success: false, message: "departmentId is required" });
            data = await dashboardService.getDepartmentHeadStats(departmentId, range);
        } else if (role === "SECHEAD101") {
            const sectionId = Number(req.query.sectionId);
            if (!sectionId) return res.status(400).json({ success: false, message: "sectionId is required" });
            data = await dashboardService.getSectionHeadStats(sectionId, range);
        } else if (role === "STUDENT") {
            const suid = Number(req.query.suid);
            if (!suid) return res.status(400).json({ success: false, message: "suid is required" });
            data = await dashboardService.getStudentStats(suid);
        } else {
            data = { cards: [], chart: [] };
        }

        return res.json({ success: true, data });
    } catch (error: any) {
        console.error("Dashboard stats error:", error.message);
        return res.status(500).json({ success: false, message: "Failed to load dashboard stats" });
    }
};