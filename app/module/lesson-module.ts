// 📂 app/module/lesson-module.ts

export type LessonType = "video" | "audio" | "image" | "document";
export type AssignScope = "all" | "department" | "section" | "student" | "group";

export interface LessonRow {
    lesson_id: number;
    lesson_title: string;
    lesson_type: LessonType;
    media_url: string | null;
    media_public_id: string | null;
    description: string | null;
    department_id: number | null;
    date_start: string;
    date_end: string;
    progress_points: number;
    created_by: number | null;
    role_code: string | null;
    assign_scope: AssignScope;
    assign_department_id: number | null;
    assign_section_id: number | null;
    assign_student_id: number | null;
    assign_group_id: number | null;
    assign_head_only: boolean;
    created_at: string;
    updated_at: string;
}

export interface ILessonAssignment {
    scope: AssignScope;
    department_id?: number | null;
    section_id?: number | null;
    student_id?: number | null;
    group_id?: number | null;
    head_only?: boolean;
}

export interface ILessonCreate {
    lessonTitle: string;
    lessonType: LessonType;
    mediaUrl?: string | null;
    mediaPublicId?: string | null;
    description?: string;
    departmentId?: number | null;
    dateStart: string;
    dateEnd: string;
    progressPoints?: number;
    createdBy?: number | null;
    roleCode?: string | null;
    assignment: ILessonAssignment;
}