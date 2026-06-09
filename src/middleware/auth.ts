import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
    user?: any;
}


export const verifyTokens = (req: AuthRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(400).json({ error: "No token received" });
    
    const token = authHeader.split(' ')[1];
    try {
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET as string);
        req.user = decodedToken;
        next();
    } catch (error) {
        return res.status(403).json({ error: "Invalid token" });
    }
};


export const isAdmin = async (req: AuthRequest, res: Response, next: NextFunction) => {
    if (req.user?.role !== 'ADMIN') {
        return res.status(403).json({ error: "Access Denied! Sirf Malik allowed hai." });
    }
    next();
};


export const isAdminOrManager = async (req: AuthRequest, res: Response, next: NextFunction) => {
    const role = req.user?.role;
    if (role === 'ADMIN' || role === 'MANAGER') {
        next();
    } else {
        return res.status(403).json({ error: "Access Denied! Staff yeh nahi kar sakta." });
    }
};