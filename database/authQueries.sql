-- database/authQueries.sql
-- Useful PostgreSQL queries for the Gurukul backend.

-- Login by username
SELECT suid, username, password, status, role_code
FROM users
WHERE username = $1;

-- Fetch user with department and section details
SELECT u.suid, u.name, u.username, u.status, u.role_code, u.department_id, u.section_id,
       d.department_name, s.name AS section_name
FROM users u
LEFT JOIN departments d ON u.department_id = d.department_id
LEFT JOIN sections s ON u.section_id = s.section_id
WHERE u.username = $1;

-- Fetch role permissions by code
SELECT role_code, role_name, permissions
FROM roles
WHERE role_code = $1;

-- List all departments
SELECT department_id, department_name, description
FROM departments
ORDER BY department_id;

-- List all sections
SELECT section_id, name, department_id, description
FROM sections
ORDER BY section_id;
