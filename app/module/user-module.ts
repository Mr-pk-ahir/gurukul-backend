import { ModulePermissions } from "./role-module";

export interface UserCreate {
    suid: number;
    avatar: string;
    name: string;
    username: string;
    password: string;
    bod: string;
    departmentId: number; 
    sectionId: number;    
    standardId: number;   
    roleId: number;       
    roleCode: string;     
    joiningDate: string;
    status?: "PENDING" | "APPROVED"; 
}

export interface AuthUserResponse {
    id: number; // યુઝરની suid
    username: string;
    roleName: string;
    roleCode: string;
    departmentId: number;
    permissions: ModulePermissions;
}