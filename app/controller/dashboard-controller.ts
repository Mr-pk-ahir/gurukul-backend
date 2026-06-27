import { Request, Response } from "express";
import { pool } from "../db/database";

export default class DashboardController {
    async getDashboard(req: Request, res: Response) {
        try {
            // Counts
            const departmentCount = await pool.query(
                "SELECT COUNT(*)::int AS count FROM departments"
            );

            const userCount = await pool.query(
                "SELECT COUNT(*)::int AS count FROM users"
            );

            const roleCount = await pool.query(
                "SELECT COUNT(*)::int AS count FROM roles"
            );

            // Latest 3 Departments
            const latestDepartments = await pool.query(`
            SELECT department_name AS name
            FROM departments
            ORDER BY created_at DESC
            LIMIT 3
        `);

            // Latest 3 Users
            const latestUsers = await pool.query(`
            SELECT name
            FROM users
            ORDER BY created_at DESC
            LIMIT 3
        `);

            // Latest 3 Roles
            const latestRoles = await pool.query(`
            SELECT role_name AS name
            FROM roles
            ORDER BY created_at DESC
            LIMIT 3
        `);

            return res.status(200).json({
                success: true,
                data: {
                    counts: {
                        departments: departmentCount.rows[0].count,
                        users: userCount.rows[0].count,
                        roles: roleCount.rows[0].count,
                    },
                    latest: {
                        departments: latestDepartments.rows,
                        users: latestUsers.rows,
                        roles: latestRoles.rows,
                    },
                },
            });
        } catch (err) {
            console.error(err);
            return res.status(500).json({
                success: false,
                message: "Dashboard data fetch failed",
            });
        }
    }
};