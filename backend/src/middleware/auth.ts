import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import User from "../models/User";

interface AuthRequest extends Request {
    user?: any;
}

export const protect = async (req: AuthRequest, res: Response, next: NextFunction) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
        try {
            token = req.headers.authorization.split(" ")[1];

            const decoded = jwt.verify(token, process.env.JWT_SECRET || "fallback_secret") as any;

            const freshUser = await User.findById(decoded.id).select("-passwordHash");

            if (!freshUser) {
                return res.status(401).json({ success: false, message: "User not found in database." });
            }

            req.user = freshUser;
            next();

        } catch (error) {
            console.error("Auth Middleware Error:", error);
            return res.status(401).json({ success: false, message: "Not authorized, token failed" });
        }
    } else {
        return res.status(401).json({ success: false, message: "Not authorized, no token" });
    }
};

export const authorize = (...roles: string[]) => {
    return (req: AuthRequest, res: Response, next: NextFunction) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: `User role ${req.user?.role} is not authorized to access this route`
            });
        }
        next();
    };
};