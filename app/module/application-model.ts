export interface IApplication {
    applicationId?: number;
    name: string;
    suid: string;
    subject: string;
    departmentId: number;
    sectionId: number;
    description?: string;
    status?: string;
}

export const getApplicationTypesFromDB = async () => {
    return [
        { id: 1, name: "Forgot Password" },
        { id: 2, name: "Leave Request" },
        { id: 3, name: "Give me raja days" },
        { id: 4, name: "System Access Issue" }
    ];
};