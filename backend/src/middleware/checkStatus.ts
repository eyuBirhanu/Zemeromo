// src/middleware/checkStatus.ts
import { Request, Response, NextFunction } from "express";
import Church from "../models/Church";

export const checkChurchStatus = async (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user;

    if (user.role === 'church_admin' && user.churchId) {
        const church = await Church.findById(user.churchId);

        // Attach status to request for the controller to use
        (req as any).churchStatus = church?.status || 'pending';
    } else {
        (req as any).churchStatus = 'verified'; // Super admin is always verified
    }

    next();
};