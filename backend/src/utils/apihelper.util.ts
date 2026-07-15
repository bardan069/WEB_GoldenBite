import { Response } from "express";
import { HttpException } from "../exceptions/http-exception";

export class ApiResponseHelper {
    static success<T>(res: Response, data: T, message: string = "Success", statusCode: number = 200) {
        return res.status(statusCode).json({
            success: true,
            message,
            data,
        });
    }

    static error(res: Response, message: string, statusCode: number = 500) {
        return res.status(statusCode).json({
            success: false,
            message,
        });
    }

    /**
     * Normalizes a caught value into a status/message pair for ApiResponseHelper.error,
     * without requiring every controller to type its catch clause as `any`.
     */
    static resolveError(error: unknown): { status: number; message: string } {
        if (error instanceof HttpException) {
            return { status: error.status, message: error.message };
        }
        if (error instanceof Error) {
            return { status: 500, message: error.message };
        }
        return { status: 500, message: "Internal Server Error" };
    }
}
