import { Request, Response, NextFunction } from "express";

export const enforceDraftMode = (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user;

    // If it's a Church Admin and they are NOT verified...
    if (user.role === 'church_admin' && user.verificationStatus !== 'verified') {

        // 1. Force 'isPublished' to false in the body
        req.body.isPublished = false;

        // 2. Optional: Log it or attach a warning flag
        console.log(`Draft Mode Enforced for Pending Admin: ${user.username}`);
    }

    next();
};