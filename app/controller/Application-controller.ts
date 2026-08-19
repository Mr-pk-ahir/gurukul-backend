import { Request, Response } from "express";
import { ApplicationService } from "../service/application-service";

const applicationService = new ApplicationService();

export class ApplicationController {
    
    public async createApplication(req: Request, res: Response): Promise<Response> {
        try {
            const { name, suid, subject, departmentId, sectionId, description } = req.body;
            
            if (!name || !suid || !subject || !departmentId || !sectionId) {
                return res.status(400).json({ message: "Missing required fields." });
            }
            
            const newApplication = await applicationService.createApplication({
                name,
                suid,
                subject,
                departmentId,
                sectionId,
                description: description || ""
            });
            
            return res.status(201).json(newApplication);
        } catch (error) {
            return res.status(500).json({ message: "Error creating application." });
        }
    }

    public async getApplicationTypes(req: Request, res: Response): Promise<Response> {
        try {
            const types = await applicationService.getApplicationTypes();
            
            return res.status(200).json({
                success: true,
                data: types,
                message: "Application types fetched successfully"
            });
        } catch (error: any) {
            return res.status(500).json({
                success: false,
                message: error.message || "Failed to fetch application types"
            });
        }
    }
}