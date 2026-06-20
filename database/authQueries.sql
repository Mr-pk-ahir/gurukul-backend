-- database/authQueries.sql
-- Aa file ma queries reference mate lakheli chhe.
-- Actual query service file ma string tarike use thashe ($1, $2 placeholders sathe).

-- Login karva mate username thi user shodhvo:
SELECT id, username, password FROM users WHERE username = $1;
