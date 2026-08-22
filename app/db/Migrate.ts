// app/db/migrate.ts
// Usage:
//   npm run migration:run    -> schema.sql + Default_Data.sql chalavse (tables create + seed)
//   npm run migration:flesh  -> flesh.sql chalavse (badha tables DROP)

import { connectDB, executeSqlFile } from "./database";

const mode = process.argv[2]; // "run" | "flesh"

async function main() {
    await connectDB();

    if (mode === "run") {
        console.log("🚀 Migration RUN — schema.sql + Default_Data.sql chalavay chhe...");
        await executeSqlFile("schema.sql");
        await executeSqlFile("Default_Data.sql");
        console.log("✅ Migration RUN complete — tables create + seed thai gaya.");
    } else if (mode === "flesh") {
        console.log("🧨 Migration FLESH — flesh.sql chalavay chhe (badha tables DROP thashe)...");
        await executeSqlFile("flesh.sql");
        console.log("✅ Migration FLESH complete — badha tables drop thai gaya.");
    } else {
        console.error("❌ Invalid mode. 'run' ke 'flesh' aapo — dat: ts-node app/db/migrate.ts run");
        process.exit(1);
    }

    process.exit(0);
}

main().catch((error) => {
    console.error("❌ Migration failed:", error);
    process.exit(1);
});