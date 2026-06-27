import { pool } from "../db/database";
import { CreateAdmissionInput } from "../module/admission-module";

export class AdmissionService {
    rejectRequest(arg0: number) {
        throw new Error("Method not implemented.");
    }
    approveRequest(arg0: number) {
        throw new Error("Method not implemented.");
    }
    public async createAdmissionRequest(input: CreateAdmissionInput): Promise<any> {
        const query = `
            INSERT INTO admission_requests 
            (applicant_name, applicant_suid, requested_role, department_id, department_name, section_id, additional_details, status) 
            VALUES ($1, $2, $3, $4, $5, $6, $7, 'PENDING') 
            RETURNING id, applicant_name AS "applicantName", applicant_suid AS "applicantSuid", 
                      requested_role AS "requestedRole", department_id AS "departmentId", 
                      department_name AS "departmentName", section_id AS "sectionId", 
                      request_date AS "requestDate", status, additional_details AS "additionalDetails"`;
        
        const values = [
            input.applicantName,
            input.applicantSuid,
            input.requestedRole || 'STUDENT',
            input.departmentId,
            input.departmentName,
            input.sectionId || null,
            input.additionalDetails || null
        ];

        const result = await pool.query(query, values);
        return result.rows[0];
    }

    public async getRequestsByStatus(status: 'PENDING' | 'APPROVED' | 'REJECTED'): Promise<any[]> {
        const query = `
            SELECT id, applicant_name AS "applicantName", applicant_suid AS "applicantSuid", 
                   requested_role AS "requestedRole", department_id AS "departmentId", 
                   department_name AS "departmentName", section_id AS "sectionId", 
                   TO_CHAR(request_date, 'DD/MM/YYYY') AS "requestDate", status, 
                   additional_details AS "additionalDetails"
            FROM admission_requests 
            WHERE status = $1 
            ORDER BY id DESC`;
        
        const result = await pool.query(query, [status]);
        return result.rows;
    }
}