export interface TaskRow {
    task_id: number;
    title: string;
    description: string | null;
    assigned_to: number;
    assigned_by: number | null;
    section_id: number | null;
    department_id: number | null;
    status: "PENDING" | "IN_PROGRESS" | "COMPLETED";
    due_date: string | null;
    completed_at: string | null;
    created_at: string;
}

export interface ITaskCreate {
    title: string;
    description?: string;
    assignedTo: number;
    assignedBy?: number | null;
    sectionId?: number | null;
    departmentId?: number | null;
    dueDate?: string | null;
}

export interface UserProgress {
    suid: number;
    name: string;
    avatar: string | null;
    totalTasks: number;
    completedTasks: number;
    percentage: number;
}

export interface SectionProgress {
    section_id: number;
    name: string;
    department_id: number;
    totalTasks: number;
    completedTasks: number;
    percentage: number;
    users: UserProgress[];
}

export interface DepartmentProgress {
    department_id: number;
    department_name: string;
    totalTasks: number;
    completedTasks: number;
    percentage: number;
    sections: SectionProgress[];
}