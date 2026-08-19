import { Request, Response } from "express";
import { pool } from "../db/database";

export const runDynamicQuery = async (req: Request, res: Response) => {
    try {
        const queryText = req.body.queryText; 
        
        const result = await pool.query(queryText);
        
        res.status(200).json({
            success: true,
            data: result.rows
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};