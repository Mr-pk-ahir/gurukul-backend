import { Request, Response } from "express";
import { DepartmentService } from "../service/department-service";

const departmentService = new DepartmentService();

export class DepartmentController {

    public async createDepartment(req: Request, res: Response): Promise<Response> {
        try {
            const { departmentName, departmentHeadId, description } = req.body;

            if (!departmentName) {
                return res.status(400).json({ success: false, message: "Department Name is required." });
            }

            const newDept = await departmentService.createDepartment({
                departmentName,
                departmentHeadId: departmentHeadId || null,
                description: description || ""
            });

            return res.status(201).json({ success: true, message: "Department created successfully!", data: newDept });
        } catch (error: any) {
            return res.status(500).json({ success: false, message: error.message || "Internal Server Error" });
        }
    }   

    public async getAllDepartments(req: Request, res: Response): Promise<Response> {
        try {
            const departments = await departmentService.getAllDepartments();
            return res.status(200).json({ success: true, message: "All departments fetched successfully.", data: departments });
        } catch (error: any) {
            return res.status(500).json({ success: false, message: error.message || "Internal Server Error" });
        }
    }

    public async getDepartmentById(req: Request, res: Response): Promise<Response> {
        try {
            const deptId = Number(req.params.id);
            if (!deptId) return res.status(400).json({ success: false, message: "Invalid ID" });

            const department = await departmentService.getDepartmentById(deptId);
            return res.status(200).json({ success: true, data: department });
        } catch (error: any) {
            return res.status(500).json({ success: false, message: error.message || "Internal Server Error" });
        }
    }

    public async deleteDepartment(req: Request, res: Response): Promise<Response> {
        try {
            const deptId = Number(req.params.id);
            if (!deptId) return res.status(400).json({ success: false, message: "Invalid ID" });

            const deletedDept = await departmentService.deleteDepartment(deptId);
            return res.status(200).json({ success: true, message: "Department deleted successfully.", data: deletedDept });
        } catch (error: any) {
            return res.status(500).json({ success: false, message: error.message || "Internal Server Error" });
        }
    }

    // ફ્રન્ટએન્ડ ડ્રોપડાઉન માટેની API
    public async getUsersByDepartment(req: Request, res: Response): Promise<Response> {
        try {
            const deptId = Number(req.params.id);
            if (!deptId) return res.status(400).json({ success: false, message: "Invalid Department ID" });

            const users = await departmentService.getUsersByDepartment(deptId);
            return res.status(200).json({ success: true, data: users });
        } catch (error: any) {
            return res.status(500).json({ success: false, message: error.message || "Internal Server Error" });
        }
    }
}