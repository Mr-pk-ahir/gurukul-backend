# Gurukul Backend

## Folder Structure

```
gurukul-backend/
  start/
    server.ts              → entry file, server start kare chhe

  app/
    route/
      Routes.ts             → badha API routes ahi connect thay chhe
    controller/
      authController.ts      → login request/response handle kare chhe
    service/
      authService.ts          → login no business logic + DB query
    module/                   (khali, future mate)
    middleware/                (khali, future mate)
    utils/                     (khali, future mate)
    db/
      database.ts              → PostgreSQL connection pool

  database/
    schema.sql                 → users table create karva mate
    authQueries.sql             → reference queries
```

## Setup Steps

### 1. Packages install karo
```bash
npm install
```

### 2. Database banavo (Neon free tier)
1. https://neon.tech par account banavo
2. Naya project banavo, connection string copy karo

### 3. `.env` file banavo
```bash
cp .env.example .env
```
Pachi `.env` ma `DATABASE_URL` ane `JWT_SECRET` bharo.

### 4. Table banavo
`database/schema.sql` file nu content Neon console ma (SQL editor) ja paste karo ane run karo. Aathi `users` table ban jashe.

Test mate ek user manually insert karo (password hash karine):
```sql
-- password "test1234" nu bcrypt hash (example) - 
-- actual ma signup route banya pachi aa automatic thashe
INSERT INTO users (username, password) VALUES ('raj123', '$2b$10$xxxxxxxxxxxxxxxxxxxxxx');
```
> Have signup route nathi banyo, etle abhi user manually j insert karvo padshe. bcrypt hash banavva mate Node.js console ma:
> ```js
> const bcrypt = require("bcrypt");
> bcrypt.hash("test1234", 10).then(console.log);
> ```

### 5. Server chalu karo
```bash
npm run dev
```

## API

### Login
```
POST /api/login
Body: { "username": "raj123", "password": "test1234" }

Success Response:
{
  "message": "Login successful",
  "token": "eyJhbGciOiJI...",
  "user": { "id": 1, "username": "raj123" }
}

Error Response:
{ "message": "Username ke password khotu chhe" }
```
