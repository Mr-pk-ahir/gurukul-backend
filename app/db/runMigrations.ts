import fs from "fs";
import path from "path";
import { pool } from "./database";

export const executeSqlFile = async (fileName: string) => {
    try {
        const filePath = path.join(__dirname, "../../database", fileName);
        
        const sqlQuery = fs.readFileSync(filePath, { encoding: "utf8" });
        
        await pool.query(sqlQuery);
        
        console.log(`✅ ${fileName} સફળતાપૂર્વક રન થઈ ગઈ!`);
    } catch (error: any) {
        console.error(`❌ ${fileName} રન કરવામાં એરર:`, error.message);
    }
};