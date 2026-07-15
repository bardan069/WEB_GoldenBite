import { Request, Response } from "express";
import { z } from "zod";
import { AdminService } from "../services/admin.service";
import { AdminCreateUserDTO, AdminUpdateUserDTO, AdminListQueryDTO } from "../dtos/admin.dto";
import { ApiResponseHelper } from "../utils/apihelper.util";
import { withLinks } from "../utils/hateoas.util";

const adminService = new AdminService();

/**
 * AdminController handles HTTP layer concerns for admin user management.
 * All methods delegate business logic to AdminService and respond with
 * standardised JSON via ApiResponseHelper.
 */
export class AdminController {
    /**
     * GET /api/v1/admin/users
     * Returns a paginated list of all users with optional search.
     * Query params: page (default 1), limit (default 10), search (optional)
     */
    async listUsers(req: Request, res: Response) {
        try {
            const query = AdminListQueryDTO.safeParse(req.query);
            if (!query.success) {
                return ApiResponseHelper.error(res, z.prettifyError(query.error), 400);
            }
            const { page, limit, search } = query.data;
            const result = await adminService.listUsers(page, limit, search);
            return ApiResponseHelper.success(res, result, "Users fetched successfully");
        } catch (error) {
            const { status, message } = ApiResponseHelper.resolveError(error);
            return ApiResponseHelper.error(res, message, status);
        }
    }

    /**
     * GET /api/v1/admin/users/:id
     * Returns a single user by their ID.
     */
    async getUserById(req: Request, res: Response) {
        try {
            const user = await adminService.getUserById(req.params.id as string);
            const withHateoas = withLinks(user, {
                self: `/api/v1/admin/users/${user._id}`,
                update: `/api/v1/admin/users/${user._id}`,
                delete: `/api/v1/admin/users/${user._id}`,
            });
            return ApiResponseHelper.success(res, withHateoas, "User fetched successfully");
        } catch (error) {
            const { status, message } = ApiResponseHelper.resolveError(error);
            return ApiResponseHelper.error(res, message, status);
        }
    }

    /**
     * POST /api/v1/admin/users
     * Creates a new user. The role field may be set by the admin.
     */
    async createUser(req: Request, res: Response) {
        try {
            const parsed = AdminCreateUserDTO.safeParse(req.body);
            if (!parsed.success) {
                return ApiResponseHelper.error(res, z.prettifyError(parsed.error), 400);
            }
            const user = await adminService.createUser(parsed.data);
            return ApiResponseHelper.success(res, user, "User created successfully", 201);
        } catch (error) {
            const { status, message } = ApiResponseHelper.resolveError(error);
            return ApiResponseHelper.error(res, message, status);
        }
    }

    /**
     * PUT /api/v1/admin/users/:id
     * Partially updates a user's profile fields.
     */
    async updateUser(req: Request, res: Response) {
        try {
            const parsed = AdminUpdateUserDTO.safeParse(req.body);
            if (!parsed.success) {
                return ApiResponseHelper.error(res, z.prettifyError(parsed.error), 400);
            }
            const user = await adminService.updateUser(req.params.id as string, parsed.data);
            return ApiResponseHelper.success(res, user, "User updated successfully");
        } catch (error) {
            const { status, message } = ApiResponseHelper.resolveError(error);
            return ApiResponseHelper.error(res, message, status);
        }
    }

    /**
     * DELETE /api/v1/admin/users/:id
     * Permanently removes a user.
     */
    async deleteUser(req: Request, res: Response) {
        try {
            await adminService.deleteUser(req.params.id as string);
            return ApiResponseHelper.success(res, null, "User deleted successfully");
        } catch (error) {
            const { status, message } = ApiResponseHelper.resolveError(error);
            return ApiResponseHelper.error(res, message, status);
        }
    }
}
