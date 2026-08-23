import { pool } from "../db/database";

type Range = "week" | "month";
export type TrendPoint = { label: string; value: number };

// 🎯 range mujab kayla dino/interval no data joie te decide kare
const getDateTrunc = (range: Range) => (range === "week" ? "day" : "week");
const getIntervalClause = (range: Range) => (range === "week" ? "7 days" : "30 days");

const trendSource = {
    departments: { table: "departments", dateColumn: "created_at" },
    approvedUsers: { table: "users", dateColumn: "created_at" },
    roles: { table: "roles", dateColumn: "created_at" },
    pendingUsers: { table: "users", dateColumn: "created_at" },
} as const;

const allowedTables = new Set(["departments", "users", "roles"]);
const allowedDateColumns = new Set(["created_at"]);

export async function getCumulativeTrend(
    table: string,
    dateColumn: string,
    range: Range,
    extraWhereClause?: string,
    extraParams: unknown[] = []
): Promise<TrendPoint[]> {
    if (!allowedTables.has(table) || !allowedDateColumns.has(dateColumn)) {
        throw new Error("Invalid dashboard trend source");
    }

    const days = range === "week" ? 7 : 30;
    const whereClause = extraWhereClause ? `AND ${extraWhereClause}` : "";
    const result = await pool.query<{ label: string; value: string }>(
        `WITH date_scaffold AS (
             SELECT generate_series(
                 CURRENT_DATE - INTERVAL '${days - 1} days',
                 CURRENT_DATE,
                 INTERVAL '1 day'
             )::date AS day
         )
         SELECT TO_CHAR(scaffold.day, 'DD Mon') AS label,
                (
                    SELECT COUNT(*)
                    FROM ${table} source
                    WHERE source.${dateColumn} < scaffold.day + INTERVAL '1 day'
                    ${whereClause}
                )::text AS value
         FROM date_scaffold scaffold
         ORDER BY scaffold.day ASC`,
        extraParams
    );

    return result.rows.map((row) => ({ label: row.label, value: Number(row.value) }));
}

const formatChartRows = (rows: { bucket: string; value: string }[]) =>
    rows.map((r) => ({
        label: new Date(r.bucket).toLocaleDateString("en-IN", { day: "2-digit", month: "short" }),
        value: Number(r.value),
    }));

export const dashboardService = {
    // 🎯 SUPER ADMIN: system-wide real counts + growth trend + role distribution + recent activity
    async getSuperAdminStats(range: Range) {
        console.log(`[dashboard] getSuperAdminStats range=${range}`);

        const [deptCount, userCount, roleCount, pendingCount] = await Promise.all([
            pool.query(`SELECT COUNT(*)::int AS count FROM departments`),
            pool.query(`SELECT COUNT(*)::int AS count FROM users WHERE status = 'APPROVED'`),
            pool.query(`SELECT COUNT(*)::int AS count FROM roles`),
            pool.query(`SELECT COUNT(*)::int AS count FROM users WHERE status = 'PENDING'`),
        ]);

        const [departmentTrend, approvedUserTrend, roleTrend, pendingUserTrend, growth] = await Promise.all([
            getCumulativeTrend(trendSource.departments.table, trendSource.departments.dateColumn, range),
            getCumulativeTrend(trendSource.approvedUsers.table, trendSource.approvedUsers.dateColumn, range, "source.status = $1", ["APPROVED"]),
            getCumulativeTrend(trendSource.roles.table, trendSource.roles.dateColumn, range),
            getCumulativeTrend(trendSource.pendingUsers.table, trendSource.pendingUsers.dateColumn, range, "source.status = $1", ["PENDING"]),
            getCumulativeTrend("users", "created_at", range),
        ]);

        // 🎯 Role-wise breakdown — konsa role ma ketla users chhe
        const roleDistribution = await pool.query(
            `SELECT r.role_code, r.role_name, COUNT(u.suid)::int AS user_count
             FROM roles r
             LEFT JOIN users u ON u.role_code = r.role_code
             GROUP BY r.role_code, r.role_name
             ORDER BY user_count DESC`
        );

        // 🎯 Users + Departments + Sections — badha activities ek j timeline ma, latest pehla
        const logs = await pool.query(
            `(SELECT 'user'::text AS type, suid::text AS id,
                     name || ' (' || role_code || ') joined as ' || status AS message,
                     created_at
              FROM users)
             UNION ALL
             (SELECT 'department'::text AS type, department_id::text AS id,
                     'New department created: ' || department_name AS message,
                     created_at
              FROM departments)
             UNION ALL
             (SELECT 'section'::text AS type, section_id::text AS id,
                     'New section created: ' || name AS message,
                     created_at
              FROM sections)
             ORDER BY created_at DESC
             LIMIT 8`
        );

        return {
            cards: [
                { label: "Total Departments", value: deptCount.rows[0].count, subLabel: "Active Modules", trend: departmentTrend },
                { label: "Total Active Users", value: userCount.rows[0].count, subLabel: "Verified Accounts", trend: approvedUserTrend },
                { label: "Total System Roles", value: roleCount.rows[0].count, subLabel: "Configured Permissions", trend: roleTrend },
                { label: "Pending Approvals", value: pendingCount.rows[0].count, subLabel: "Awaiting review", trend: pendingUserTrend },
            ],
            chart: growth,
            roleDistribution: roleDistribution.rows.map((r) => ({
                roleCode: r.role_code,
                roleName: r.role_name,
                userCount: r.user_count,
            })),
            userStatus: {
                approved: userCount.rows[0].count,
                pending: pendingCount.rows[0].count,
            },
            logs: logs.rows.map((l) => ({
                id: `${l.type}-${l.id}`,
                message: l.message,
                timestamp: l.created_at,
            })),
        };
    },

    // 🎯 DEPARTMENT HEAD: potana department ni j info
    async getDepartmentHeadStats(departmentId: number, range: Range) {
        const trunc = getDateTrunc(range);
        const interval = getIntervalClause(range);

        const [sectionCount, studentCount] = await Promise.all([
            pool.query(`SELECT COUNT(*)::int AS count FROM sections WHERE department_id = $1`, [departmentId]),
            pool.query(
                `SELECT COUNT(*)::int AS count FROM users WHERE department_id = $1 AND role_code = 'STUDENT'`,
                [departmentId]
            ),
        ]);

        const growth = await pool.query(
            `SELECT DATE_TRUNC('${trunc}', created_at) AS bucket, COUNT(*)::text AS value
             FROM users
             WHERE department_id = $1 AND created_at >= NOW() - INTERVAL '${interval}'
             GROUP BY bucket ORDER BY bucket ASC`,
            [departmentId]
        );

        return {
            cards: [
                { label: "My Sections", value: sectionCount.rows[0].count, subLabel: "Under this department" },
                { label: "My Students", value: studentCount.rows[0].count, subLabel: "Enrolled students" },
            ],
            chart: formatChartRows(growth.rows),
        };
    },

    // 🎯 SECTION HEAD: potana section ni j info
    async getSectionHeadStats(sectionId: number, range: Range) {
        const trunc = getDateTrunc(range);
        const interval = getIntervalClause(range);

        const studentCount = await pool.query(
            `SELECT COUNT(*)::int AS count FROM users WHERE section_id = $1 AND role_code = 'STUDENT'`,
            [sectionId]
        );

        const growth = await pool.query(
            `SELECT DATE_TRUNC('${trunc}', created_at) AS bucket, COUNT(*)::text AS value
             FROM users
             WHERE section_id = $1 AND created_at >= NOW() - INTERVAL '${interval}'
             GROUP BY bucket ORDER BY bucket ASC`,
            [sectionId]
        );

        return {
            cards: [{ label: "My Students", value: studentCount.rows[0].count, subLabel: "In this section" }],
            chart: formatChartRows(growth.rows),
        };
    },

    // 🎯 STUDENT: abhi tasks/attendance table nathi, etle fakt basic profile-derived info
    async getStudentStats(suid: number) {
        const user = await pool.query(`SELECT joining_date FROM users WHERE suid = $1`, [suid]);
        const joiningDate = user.rows[0]?.joining_date;

        const daysSinceJoining = joiningDate
            ? Math.floor((Date.now() - new Date(joiningDate).getTime()) / (1000 * 60 * 60 * 24))
            : 0;

        return {
            cards: [{ label: "Days Since Joining", value: daysSinceJoining, subLabel: "Your journey so far" }],
            // 🎯 TODO: task/attendance table banya pachi aa real progress chart thi replace karvu
            chart: [] as { label: string; value: number }[],
        };
    },
};