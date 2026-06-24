import { Request, Response } from "express";
import { DepartmentService } from "../service/department-service";


const departmentService = new DepartmentService();

export class DepartmentController {

    // 🏢 ૧. Create Department Controller (નવો ડિપાર્ટમેન્ટ ઉમેરવા)
    public async createDepartment(req: Request, res: Response): Promise<Response> {
        try {
            const { departmentName, departmentHeadId, description } = req.body;

            if (!departmentName) {
                return res.status(400).json({ success: false, message: "Department Name is required." });
            }

            // સર્વિસ દ્વારા ડેટાબેઝમાં સેવ કરવાનો ટ્રાય કરો
            const newDept = await departmentService.createDepartment({
                departmentName,
                departmentHeadId,
                description
            });

            return res.status(201).json({
                success: true,
                message: "Department created successfully!",
                data: newDept
            });

        } catch (error: any) {
            // 🎯 જો સર્વિસમાંથી ફોરેન કી (User not found) ની એરર આવે તો અહીં પકડાશે
            if (error.message.includes("Department Head")) {
                return res.status(400).json({
                    success: false,
                    message: error.message // "પસંદ કરેલ Department Head (User ID) ડેટાબેઝમાં..."
                });
            }

            // બાકીની બધી અનજણ્યા પ્રોબ્લેમ માટે 500 આપશે
            return res.status(500).json({
                success: false,
                message: error.message || "Internal Server Error"
            });
        }
    }   

    public async getAllDepartments(req: Request, res: Response): Promise<Response> {
        try {
            const departments = await departmentService.getAllDepartments();

            return res.status(200).json({
                success: true,
                message: "All departments fetched successfully.",
                data: departments
            });

        } catch (error: any) {
            return res.status(500).json({ success: false, message: error.message || "Internal Server Error" });
        }
    }
}