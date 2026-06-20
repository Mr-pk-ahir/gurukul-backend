# controller/

Ahi badha controller functions banshe (jevu ke authController.ts, userController.ts).

Dareke function banya pachi `app/route/Routes.ts` ma import karine route sathe connect karvanu.

Example:
```ts
// authController.ts
export const login = (req, res) => {
  res.json({ message: "login working" });
};
```

```ts
// Routes.ts ma
import { login } from "../controller/authController";
router.post("/login", login);
```
