// generate-hash.ts
// Run karva mate: npx ts-node generate-hash.ts
// (jo ts-node install na hoy to: npm install -D ts-node)

import bcrypt from "bcrypt";

const plainPassword: string = "admin123"; // 🎯 tame je navo password rakhva mango chho e ahi lakho

bcrypt.hash(plainPassword, 10).then((hash) => {
  console.log("Plain password:", plainPassword);
  console.log("Hashed password (aa SQL query ma vaparo):");
  console.log(hash);
});