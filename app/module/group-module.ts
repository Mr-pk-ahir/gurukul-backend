export interface GroupCreate {
    group_name: string;
    description?: string;
    member_ids: number[];
    created_by: number;
}