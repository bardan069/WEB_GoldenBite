import { Request, Response } from "express";
import { z } from "zod";
import { ExerciseService } from "../services/exercise.service";
import { CreateExerciseDTO, UpdateExerciseDTO } from "../dtos/exercise.dto";
import { ApiResponseHelper } from "../utils/apihelper.util";
import { withLinks } from "../utils/hateoas.util";

const exerciseService = new ExerciseService();

/**
 * ExerciseController handles HTTP layer concerns for exercise reminders.
 * All methods delegate business logic to ExerciseService and respond with
 * standardised JSON via ApiResponseHelper.
 */
export class ExerciseController {
    /** GET /api/v1/exercises */
    async list(req: Request, res: Response) {
        try {
            const userId = req.user!._id.toString();
            const exercises = await exerciseService.list(userId);
            return ApiResponseHelper.success(res, exercises, "Exercises fetched successfully");
        } catch (error) {
            const { status, message } = ApiResponseHelper.resolveError(error);
            return ApiResponseHelper.error(res, message, status);
        }
    }

    /** GET /api/v1/exercises/today */
    async listDueToday(req: Request, res: Response) {
        try {
            const userId = req.user!._id.toString();
            const exercises = await exerciseService.listDueToday(userId);
            return ApiResponseHelper.success(res, exercises, "Today's exercises fetched successfully");
        } catch (error) {
            const { status, message } = ApiResponseHelper.resolveError(error);
            return ApiResponseHelper.error(res, message, status);
        }
    }

    /** GET /api/v1/exercises/:id */
    async getById(req: Request, res: Response) {
        try {
            const userId = req.user!._id.toString();
            const exercise = await exerciseService.getById(userId, req.params.id as string);
            const withHateoas = withLinks(exercise, {
                self: `/api/v1/exercises/${exercise._id}`,
                update: `/api/v1/exercises/${exercise._id}`,
                delete: `/api/v1/exercises/${exercise._id}`,
            });
            return ApiResponseHelper.success(res, withHateoas, "Exercise fetched successfully");
        } catch (error) {
            const { status, message } = ApiResponseHelper.resolveError(error);
            return ApiResponseHelper.error(res, message, status);
        }
    }

    /** POST /api/v1/exercises */
    async create(req: Request, res: Response) {
        try {
            const parsed = CreateExerciseDTO.safeParse(req.body);
            if (!parsed.success) {
                return ApiResponseHelper.error(res, z.prettifyError(parsed.error), 400);
            }
            const userId = req.user!._id.toString();
            const exercise = await exerciseService.create(userId, parsed.data);
            return ApiResponseHelper.success(res, exercise, "Exercise created successfully", 201);
        } catch (error) {
            const { status, message } = ApiResponseHelper.resolveError(error);
            return ApiResponseHelper.error(res, message, status);
        }
    }

    /** PUT /api/v1/exercises/:id */
    async update(req: Request, res: Response) {
        try {
            const parsed = UpdateExerciseDTO.safeParse(req.body);
            if (!parsed.success) {
                return ApiResponseHelper.error(res, z.prettifyError(parsed.error), 400);
            }
            const userId = req.user!._id.toString();
            const exercise = await exerciseService.update(userId, req.params.id as string, parsed.data);
            return ApiResponseHelper.success(res, exercise, "Exercise updated successfully");
        } catch (error) {
            const { status, message } = ApiResponseHelper.resolveError(error);
            return ApiResponseHelper.error(res, message, status);
        }
    }

    /** DELETE /api/v1/exercises/:id */
    async delete(req: Request, res: Response) {
        try {
            const userId = req.user!._id.toString();
            await exerciseService.delete(userId, req.params.id as string);
            return ApiResponseHelper.success(res, null, "Exercise deleted successfully");
        } catch (error) {
            const { status, message } = ApiResponseHelper.resolveError(error);
            return ApiResponseHelper.error(res, message, status);
        }
    }

    /** PATCH /api/v1/exercises/:id/complete */
    async markComplete(req: Request, res: Response) {
        try {
            const userId = req.user!._id.toString();
            const exercise = await exerciseService.markComplete(userId, req.params.id as string);
            return ApiResponseHelper.success(res, exercise, "Exercise marked as complete");
        } catch (error) {
            const { status, message } = ApiResponseHelper.resolveError(error);
            return ApiResponseHelper.error(res, message, status);
        }
    }
}
