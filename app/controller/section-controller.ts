import { Request, Response } from "express";
import { SectionService } from "../service/section-service";

export class SectionController {

    async createSection(req: Request, res: Response): Promise<void> {
        try {
            const { name, departmentId, description, sectionHead } = req.body;

            if (!name || !departmentId) {
                res.status(400).json({ success: false, message: "Section name and Department ID જરૂરી છે." });
                return;
            }

            const newSection = await SectionService.createSection(
                name,
                Number(departmentId),
                description,
                sectionHead ? Number(sectionHead) : null
            );

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

    async updateSection(req: Request, res: Response): Promise<void> {
        try {
            const sectionId = Number(req.params.id);
            const { name, description, sectionHead } = req.body;

            const updatedSection = await SectionService.updateSection(
                sectionId,
                name,
                description,
                sectionHead !== undefined ? (sectionHead ? Number(sectionHead) : null) : undefined
            );

            res.status(200).json({
                success: true,
                message: "Section updated successfully",
                data: updatedSection
            });
        } catch (error: any) {
            res.status(400).json({
                success: false,
                message: error.message || "Failed to update section"
            });
        }
    }

    async getSections(req: Request, res: Response): Promise<void> {
        try {
            const sections = await SectionService.getAllSections();
            res.status(200).json({ success: true, data: sections });
        } catch (error: any) {
            res.status(500).json({ success: false, message: error.message || "Internal Server Error" });
        }
    }

    async getSectionById(req: Request, res: Response): Promise<void> {
        try {
            const sectionId = Number(req.params.id);
            const section = await SectionService.getSectionById(sectionId);
            res.status(200).json({ success: true, data: section });
        } catch (error: any) {
            res.status(404).json({ success: false, message: error.message || "Section not found" });
        }
    }

    async getSectionsByDepartment(req: Request, res: Response): Promise<void> {
        try {
            const departmentId = Number(req.params.departmentId);
            const sections = await SectionService.getSectionsByDepartment(departmentId);
            res.status(200).json({ success: true, data: sections });
        } catch (error: any) {
            res.status(400).json({ success: false, message: error.message || "Failed to fetch sections" });
        }
    }

    async deleteSection(req: Request, res: Response): Promise<void> {
        try {
            const sectionId = Number(req.params.id);
            await SectionService.deleteSection(sectionId);
            res.status(200).json({ success: true, message: "Section deleted successfully" });
        } catch (error: any) {
            res.status(404).json({ success: false, message: error.message || "Section not found" });
        }
    }
}