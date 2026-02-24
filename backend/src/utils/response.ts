import { Response } from "express";

export class Api {
    // Success Response
    static success(res: Response, data: any, message: string = "Success", statusCode: number = 200) {
        return res.status(statusCode).json({
            success: true,
            message,
            data,
        });
    }

    // Error Response
    static error(res: Response, message: string = "Internal Server Error", statusCode: number = 500, errorDetails?: any) {
        return res.status(statusCode).json({
            success: false,
            message,
            error: errorDetails || null,
        });
    }
}