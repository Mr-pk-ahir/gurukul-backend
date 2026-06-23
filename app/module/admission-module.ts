// 📂 ફાઈલ પાથ: app/module/admission-module.ts

export interface AdmissionRequest {
  id: number;              // રિક્વેસ્ટની પોતાની યુનિક પ્રાઇમરી કી
  applicantName: string;   // અરજી કરનારનું નામ
  requestedRole: string;   // 'STUDENT' કે 'STAFF'
  departmentId: number;    // કયા ડિપાર્ટમેન્ટ માટે રિક્વેસ્ટ છે તેની ID
  departmentName: string;  
  sectionId?: number;      // જો વિદ્યાર્થી હોય તો સેક્શન ID (Optional)
  requestDate: string;     // કઈ તારીખે રિક્વેસ્ટ આવી
  status: "PENDING" | "APPROVED" | "REJECTED";
  additionalDetails?: string;
}


export interface CreateAdmissionInput {
  applicantName: string;
  applicantSuid: number;   // 👈 બેકએન્ડ મોડ્યુલમાં પણ એડ કર્યું
  requestedRole: string;
  departmentId: number;
  departmentName: string;
  sectionId?: number;
  additionalDetails?: string;
}