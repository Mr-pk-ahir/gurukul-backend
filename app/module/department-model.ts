export interface IDepartment {
    departmentId?: number;
    departmentName: string;
    departmentHeadId?: number | string | null;
    description?: string;
}

export interface DepartmentRow {
    department_id: number;
    department_name: string;
    department_head_id: number | null;
    department_head_name?: string | null;
    description: string | null;
    created_at: string;
    updated_at: string;
}