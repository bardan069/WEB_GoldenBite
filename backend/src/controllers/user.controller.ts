import { UserService } from "../services/user.service";
import { z } from "zod";
import { CreateUserDTO, LoginUserDTO, UpdateUserDTO, UpdatePasswordDTO } from "../dtos/user.dto";
import { ApiResponseHelper } from "../utils/apihelper.util";
import { Request, Response } from "express";

const userService = new UserService();

export class UserController {
    async createUser(req: Request, res: Response) {
        try {
            const userData = CreateUserDTO.safeParse(req.body);
            if (!userData.success) {
                return ApiResponseHelper.error(res, z.prettifyError(userData.error), 400);
            }

            const user = await userService.createUser(userData.data);
            return ApiResponseHelper.success(res, user, "User created successfully");
        } catch (error: Error | any | unknown) {
            return ApiResponseHelper.error(
                res,
                error.message || "Internal Server Error",
                error.status || 500
            );
        }
    }

    async loginUser(req: Request, res: Response) {
        try {
            const parsedData = LoginUserDTO.safeParse(req.body);
            if (!parsedData.success) {
                return ApiResponseHelper.error(res, z.prettifyError(parsedData.error), 400);
            }

            const { user, token } = await userService.loginUser(parsedData.data);
            return ApiResponseHelper.success(res, { user, token }, "Login successful");
        } catch (error: Error | any | unknown) {
            return ApiResponseHelper.error(
                res,
                error.message || "Internal Server Error",
                error.status || 500
            );
        }
    }

    async whoami(req: Request, res: Response) {
        try {
            const user = req.user;
            if (!user) {
                return ApiResponseHelper.error(res, "User not found", 404);
            }
            return ApiResponseHelper.success(res, user, "User details fetched successfully");
        } catch (error: Error | any | unknown) {
            return ApiResponseHelper.error(
                res,
                error.message || "Internal Server Error",
                error.status || 500
            );
        }
    }

    async updateUser(req: Request, res: Response) {
        try {
            const userId = req.user!._id;
            const userData = UpdateUserDTO.safeParse(req.body);
            if (!userData.success) {
                return ApiResponseHelper.error(res, z.prettifyError(userData.error), 400);
            }

            if (req.file) {
                userData.data.profileImage = "/uploads/" + req.file.filename;
            }

            const updatedUser = await userService.updateUser(userId, userData.data);
            return ApiResponseHelper.success(res, updatedUser, "User updated successfully");
        } catch (error: Error | any | unknown) {
            return ApiResponseHelper.error(
                res,
                error.message || "Internal Server Error",
                error.status || 500
            );
        }
    }

    async updatePassword(req: Request, res: Response) {
        try {
            const userId = req.user!._id;
            const passwordData = UpdatePasswordDTO.safeParse(req.body);
            if (!passwordData.success) {
                return ApiResponseHelper.error(res, z.prettifyError(passwordData.error), 400);
            }

            await userService.updatePassword(userId, passwordData.data);
            return ApiResponseHelper.success(res, null, "Password updated successfully");
        } catch (error: Error | any | unknown) {
            return ApiResponseHelper.error(
                res,
                error.message || "Internal Server Error",
                error.status || 500
            );
        }
    }
}
