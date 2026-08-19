import { pool } from "../db/database";
import { IApplication } from "../module/application-model";

export class ApplicationService {
    private generate4DigitId(): number {
        return Math.floor(1000 + Math.random() * 9000); // Generates a random 4-digit number between 1000 and 9999
    }

    public async createApplication(applicationData: IApplication): Promise<any> {
        try {
            const applicationId = this.generate4DigitId();
            const { name, suid, subject, departmentId, sectionId, description } = applicationData;
            
            const query = `
                INSERT INTO applications (application_id, name, suid, subject, department_id, section_id, description)
                VALUES ($1, $2, $3, $4, $5, $6, $7)
                RETURNING application_id AS "applicationId", name, suid, subject, department_id AS "departmentId", section_id AS "sectionId", description, status, created_at AS "createdAt";
            `;
            
            const values = [applicationId, name, suid, subject, departmentId, sectionId, description];
            
            const result = await pool.query(query, values);
            
            return result.rows[0]; 
        } catch (error) {
            console.error(error);
            throw new Error("Error creating application.");
        }
    }

    public async getApplicationTypes(): Promise<any> {
        try {
            const applicationTypes = [
                { id: 1, name: "Forgot Password" },
                { id: 2, name: "Leave Request" },
                { id: 3, name: "System Issue" }
            ];
            console.log(applicationTypes)
            return applicationTypes;
        } catch (error) {
            console.log("Error fetching application types.");
            throw new Error("Error fetching application types.");
        }
    }
}