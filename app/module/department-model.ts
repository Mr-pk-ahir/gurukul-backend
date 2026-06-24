// 🏢 ડિપાર્ટમેન્ટ ડેટાનું ઇન્ટરફેસ (Structure)
export interface IDepartment {
  id?: number;              // 🎯 બેકએન્ડ દ્વારા જનરેટ થનારો ૬-ડિજિટ આઈડી
  departmentName: string;
  departmentHeadId: number | string;
  description?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

// જો તમે કોઈ ORM વગર સાદું ડેટાબેઝ હેન્ડલિંગ કરતા હોવ તો આ મોડલ ક્લાસ પણ વાપરી શકો:
export class DepartmentModel {
  public id?: number;
  public departmentName: string;
  public departmentHeadId: number | string;
  public description?: string;

  constructor(data: IDepartment) {
    this.id = data.id;
    this.departmentName = data.departmentName;
    this.departmentHeadId = data.departmentHeadId;
    this.description = data.description;
  }
}