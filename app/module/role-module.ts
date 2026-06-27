export interface PermissionActions {
    create: boolean;
    edit: boolean;
    view: boolean;
    delete: boolean;
}

export interface ModulePermissions {
    [moduleName: string]: PermissionActions;
}

export interface RoleCreate {
    roleId?: number; // ક્રિએટ કરતી વખતે ઓપ્શનલ રાખ્યો છે
    roleName: string;
    roleCode: string;
    description?: string;
    permissions: ModulePermissions;
}