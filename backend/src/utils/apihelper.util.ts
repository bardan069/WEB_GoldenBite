import { Response } from "express";

export class ApiResponseHelper {
    static success(res: Response, data: any, message: string = "Success", statusCode: number = 200) {
        return res.status(statusCode).json({
            success: true,
            message,
            data,
        });
    }

    static error(res: Response, message: string | any, statusCode: number = 500) {
        return res.status(statusCode).json({
            success: false,
            message,
        });
    }
}
