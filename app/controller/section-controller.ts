import { Request, Response } from "express";
import { SectionService } from "../service/section-service";

export class SectionController {
    // static કાઢી નાખ્યું છે
    async createSection(req: Request, res: Response): Promise<void> {
        try {
            const { name, departmentId, description } = req.body;
            const newSection = await SectionService.createSection(name, Number(departmentId), description);
            
            res.status(201).json({
                success: true,
                message: "Section created successfully",
                data: newSection
            });
        } catch (error: any) {
            res.status(400).json({
                success: false,
                message: error.message || "Failed to create section"
            });
        }
    }

    async getSections(req: Request, res: Response): Promise<void> {
        try {
            const sections = await SectionService.getAllSections();
            res.status(200).json({
                success: true,
                data: sections
            });
        } catch (error: any) {
            res.status(500).json({
                success: false,
                message: error.message || "Internal Server Error"
            });
        }
    }

    async getSectionById(req: Request, res: Response): Promise<void> {
        try {
            const sectionId = Number(req.params.id);
            const section = await SectionService.getSectionById(sectionId);
            
            res.status(200).json({
                success: true,
                data: section
            });
        } catch (error: any) {
            res.status(404).json({
                success: false,
                message: error.message || "Section not found"
            });
        }
    }
}