import { ModulePermissions } from "./role-module";

export type UserStatus = "PENDING" | "APPROVED";

export interface UserCreate {
    suid?: number;
    avatar?: string;
    name: string;
    username: string;
    password: string;
    bod: string;
    departmentId: number;
    sectionId: number;
    standardId: number;
    roleCode: string;
    joiningDate: string;
    status?: UserStatus;
}

export interface AuthUserResponse {
    suid: number;
    name: string;
    username: string;
    avatar: string;
    bod: string;              // 🆕 add karyu
    joiningDate: string;      // 🆕 add karyu
    roleName: string;
    roleCode: string;
    departmentId: number | null;
    permissions: ModulePermissions;
}