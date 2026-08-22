import { pool } from "../db/database";
import { GroupCreate } from "../module/group-module";

export class GroupService {
    static async createGroup(groupData: GroupCreate): Promise<any> {
        try {
            const query = `
                INSERT INTO groups (group_name, description, member_ids, created_by)
                VALUES ($1, $2, $3, $4)
                RETURNING group_id, group_name, description, member_ids, created_by, created_at;
            `;
            const values = [
                groupData.group_name,
                groupData.description || null,
                groupData.member_ids,
                groupData.created_by,
            ];
            const result = await pool.query(query, values);
            return result.rows[0];
        } catch (error) {
            throw error;
        }
    }

    // 👑 List — badha groups, member_ids ne users table sathe join karine name/role_code enrich karo
    static async getAllGroups(): Promise<any> {
        try {
            const query = `
                SELECT
                    g.group_id,
                    g.group_name,
                    g.description,
                    g.created_by,
                    cu.name AS created_by_name,
                    g.created_at,
                    COALESCE(
                        json_agg(
                            json_build_object('suid', u.suid, 'name', u.name, 'role_code', u.role_code)
                        ) FILTER (WHERE u.suid IS NOT NULL),
                        '[]'
                    ) AS members
                FROM groups g
                LEFT JOIN users u ON u.suid = ANY(g.member_ids)
                LEFT JOIN users cu ON cu.suid = g.created_by
                GROUP BY g.group_id, cu.name
                ORDER BY g.created_at DESC;
            `;
            const result = await pool.query(query);
            return result.rows;
        } catch (error) {
            throw error;
        }
    }

    // 🆕 Single group fetch — edit page ma prefill karva mate
    static async getGroupById(groupId: number): Promise<any> {
        try {
            const query = `
                SELECT
                    g.group_id,
                    g.group_name,
                    g.description,
                    g.created_by,
                    cu.name AS created_by_name,
                    g.created_at,
                    COALESCE(
                        json_agg(
                            json_build_object('suid', u.suid, 'name', u.name, 'role_code', u.role_code)
                        ) FILTER (WHERE u.suid IS NOT NULL),
                        '[]'
                    ) AS members
                FROM groups g
                LEFT JOIN users u ON u.suid = ANY(g.member_ids)
                LEFT JOIN users cu ON cu.suid = g.created_by
                WHERE g.group_id = $1
                GROUP BY g.group_id, cu.name;
            `;
            const result = await pool.query(query, [groupId]);
            return result.rows[0];
        } catch (error) {
            throw error;
        }
    }

    // 🆕 Update — group name/description/members badalva mate
    static async updateGroup(
        groupId: number,
        data: { group_name?: string; description?: string; member_ids?: number[] }
    ): Promise<any> {
        try {
            const query = `
                UPDATE groups
                SET
                    group_name = COALESCE($1, group_name),
                    description = COALESCE($2, description),
                    member_ids = COALESCE($3, member_ids),
                    updated_at = NOW()
                WHERE group_id = $4
                RETURNING group_id, group_name, description, member_ids, created_by, created_at;
            `;
            const values = [
                data.group_name ?? null,
                data.description ?? null,
                data.member_ids ?? null,
                groupId,
            ];
            const result = await pool.query(query, values);
            return result.rows[0];
        } catch (error) {
            throw error;
        }
    }

    // 🆕 Delete group
    static async deleteGroup(groupId: number): Promise<any> {
        try {
            const query = `DELETE FROM groups WHERE group_id = $1 RETURNING group_id;`;
            const result = await pool.query(query, [groupId]);
            return result.rows[0];
        } catch (error) {
            throw error;
        }
    }
}