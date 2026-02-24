import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import User from "../models/User";

export const identifyUser = async (req: Request, res: Response, next: NextFunction) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
        try {
            // Get token from header
            token = req.headers.authorization.split(" ")[1];

            // Verify token
            const decoded: any = jwt.verify(token, process.env.JWT_SECRET as string);

            // Get user from DB (exclude password)
            // We use (req as any) to attach the user to the request object
            (req as any).user = await User.findById(decoded.id).select("-passwordHash");

        } catch (error) {
            // If token is invalid (expired), we treat them as a guest.
            console.log("Token invalid, proceeding as guest.");
            (req as any).user = null;
        }
    } else {
        // No token provided? Guest.
        (req as any).user = null;
    }

    next();
};