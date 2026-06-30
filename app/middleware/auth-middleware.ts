// 📂 ફાઈલ પાથ: app/middleware/auth-middleware.ts

import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { RoleService } from "../service/role-service";

const JWT_SECRET = process.env.JWT_SECRET || "your_super_secret_jwt_key_123";

// 🎯 Express Request ને એક્સટેન્ડ કરવા માટેનું ડિકલેરેશન
declare global {
    namespace Express {
        interface Request {
            user?: any;
            permissions?: any;
        }
    }
}

/**
 * 📝 ૧. ટોકન વેરિફિકેશન મિડલવેર (નામ બદલીને 'authenticateToken' કર્યું)
 */
export const authenticateToken = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const authHeader = req.headers.authorization;
        const token = authHeader && authHeader.split(" ")[1];
        
        if (!token) {
            return res.status(401).json({ 
                success: false, 
                message: "ટોકન મળ્યું નથી! મહેરબાની કરીને પહેલા લોગિન કરો." 
            });
        }

        // JWT વેરીફાય કરો
        const decoded: any = jwt.verify(token, JWT_SECRET);
        req.user = decoded; // આમાં suid, username, અને roleCode હશે

        // 🎯 ડેટાબેઝ/સર્વિસમાંથી આ યુઝરના રોલની લાઈવ પરમિશન્સ લાવો
        const userRoleCode = decoded.roleCode || "HEAD100";
        const permissions = await RoleService.getRolePermissions(userRoleCode);
        req.permissions = permissions; // આગળના રાઉટ માટે રિક્વેસ્ટમાં સેવ કર્યું

        next();
    } catch (error) {
        return res.status(403).json({ 
            success: false, 
            message: "ટોકન અમાન્ય છે અથવા એક્સપાયર થઈ ગયું છે!" 
        });
    }
};

/**
 * 🎯 ૨. ડાયનેમિક પરમિશન ચેકર મિડલવેર
 */
export const requirePermission = (moduleName: string, action: "create" | "edit" | "view" | "delete") => {
    return (req: Request, res: Response, next: NextFunction) => {
        try {
            // 🌟 સુપર એડમિન માટે બધું જ એલાઉડ (બાયપાસ)
            if (req.user?.roleCode === "ROLE_SUPER_ADMIN") {
                return next();
            }

            const userPermissions = req.permissions;
            
            // જો મોડ્યુલની કોઈ પરમિશન જ સેટ ન હોય
            if (!userPermissions || !userPermissions[moduleName]) {
                return res.status(403).json({ 
                    success: false, 
                    message: `તમને '${moduleName}' મોડ્યુલ એક્સેસ કરવાની પરવાનગી નથી.` 
                });
            }

            // સ્પેસિફિક એક્શન (view, create વગેરે) ચેક કરો
            const hasAccess = userPermissions[moduleName][action];

            if (hasAccess) {
                next();
            } else {
                return res.status(403).json({ 
                    success: false, 
                    message: `તમને આ મોડ્યુલમાં '${action}' કરવાની પરવાનગી નથી!` 
                });
            }
        } catch (error) {
            return res.status(500).json({ 
                success: false, 
                message: "પરમિશન ચેક કરતી વખતે સર્વર એરર આવી." 
            });
        }
    };
};