export interface SectionRow {
    section_id: number;
    name: string;
    description: string | null;
    department_id: number;
    department_name?: string;
    section_head_id: number | null;
    head_name?: string | null;
    created_at: string;
    updated_at: string;
}

export interface ISectionCreate {
    name: string;
    departmentId: number;
    description?: string;
    sectionHeadId?: number | null;
}

export interface ISectionUpdate {
    name?: string;
    description?: string;
    sectionHeadId?: number | null;
}

// 🎯 IMPORTANT: Tamara roles table ma "Section Head" mate je exact role_code
// che (jem department mate 'HEAD100' / 'DEPARTMENT_HEAD' hato), e ahi update karo.
// SELECT role_code, role_name FROM roles; run kari ne confirm karo.
export const ROLE_CODES = {
    SECTION_HEAD: "SECTION_HEAD", // ⚠️ CHANGE THIS to your actual role_code
};