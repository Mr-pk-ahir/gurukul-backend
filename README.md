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

### 4. Database migrate ane seed karo
```bash
npm run db:setup
```

Aa command `database/init-schema.sql` ane `database/seed-data.sql` run kare chhe. Aathi modules, roles, departments, sections, users ane default super-admin user ban jashe.

### 5. Server chalu karo
```bash
npm run dev
```

### Optional commands
```bash
npm run db:migrate
npm run db:seed
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
