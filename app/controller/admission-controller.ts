import { Request, Response } from "express";
import { AdmissionService } from "../service/admission-service";
import { CreateAdmissionInput } from "../module/admission-module";

const admissionService = new AdmissionService();

export class AdmissionController {
    public createRequest = async (req: Request, res: Response): Promise<Response> => {
        try {
            const { 
                applicantName, 
                requestedRole, 
                departmentId, 
                departmentName, 
                sectionId, 
                additionalDetails 
            } = req.body;

            if (!applicantName || !departmentId || !departmentName) {
                return res.status(400).json({ success: false, message: "જરૂરી બધી વિગતો ભરો." });
            }

            const payload: CreateAdmissionInput = {
                applicantName,
                requestedRole,
                departmentId: Number(departmentId),
                departmentName,
                sectionId: sectionId ? Number(sectionId) : undefined,
                additionalDetails,
                applicantSuid: 0
            };

            const newRequest = await admissionService.createAdmissionRequest(payload);
            return res.status(201).json({ success: true, data: newRequest });
        } catch (error: any) {
            return res.status(500).json({ success: false, message: error.message });
        }
    };

    public getPendingRequests = async (req: Request, res: Response): Promise<Response> => {
        try {
            const data = await admissionService.getRequestsByStatus('PENDING');
            return res.status(200).json({ success: true, data });
        } catch (error: any) {
            return res.status(500).json({ success: false, message: error.message });
        }
    };

    public getApprovedRequests = async (req: Request, res: Response): Promise<Response> => {
        try {
            const data = await admissionService.getRequestsByStatus('APPROVED');
            return res.status(200).json({ success: true, data });
        } catch (error: any) {
            return res.status(500).json({ success: false, message: error.message });
        }
    };

    public handleAction = async (req: Request, res: Response): Promise<Response> => {
        try {
            const { id } = req.params;
            const { action } = req.body;

            if (action === 'APPROVE') {
                await admissionService.approveRequest(Number(id));
                return res.status(200).json({ success: true, message: "રિક્વેસ્ટ એપ્રુવ થઈ ગઈ!" });
            } else if (action === 'REJECT') {
                await admissionService.rejectRequest(Number(id));
                return res.status(200).json({ success: true, message: "રિક્વેસ્ટ રિજેક્ટ કરી ડિલીટ કરવામાં આવી છે." });
            }
            return res.status(400).json({ success: false, message: "ખોટી એક્શન સબમિટ કરી છે." });
        } catch (error: any) {
            return res.status(500).json({ success: false, message: error.message });
        }
    };
}