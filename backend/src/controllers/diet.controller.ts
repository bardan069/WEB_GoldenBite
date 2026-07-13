import fs from "fs";
import { Request, Response } from "express";
import { z } from "zod";
import { DietService } from "../services/diet.service";
import { FoodVisionService } from "../services/food-vision.service";
import { CreateMealEntryDTO, UpdateMealEntryDTO } from "../dtos/diet.dto";
import { ApiResponseHelper } from "../utils/apihelper.util";
import { withLinks } from "../utils/hateoas.util";

const dietService = new DietService();
const foodVisionService = new FoodVisionService();

/**
 * DietController handles HTTP layer concerns for age-based nutrition
 * recommendations and the user's personal meal log.
 */
export class DietController {
    /** GET /api/v1/diet/recommendation */
    async getRecommendation(req: Request, res: Response) {
        try {
            const recommendation = dietService.getRecommendation(req.user!.dateOfBirth);
            return ApiResponseHelper.success(res, recommendation, "Diet recommendation fetched successfully");
        } catch (error: any) {
            return ApiResponseHelper.error(res, error.message || "Internal Server Error", error.status || 500);
        }
    }

    /** GET /api/v1/diet/entries */
    async listEntries(req: Request, res: Response) {
        try {
            const userId = req.user!._id;
            const entries = await dietService.listEntries(userId);
            return ApiResponseHelper.success(res, entries, "Meal entries fetched successfully");
        } catch (error: any) {
            return ApiResponseHelper.error(res, error.message || "Internal Server Error", error.status || 500);
        }
    }

    /** GET /api/v1/diet/entries/:id */
    async getEntryById(req: Request, res: Response) {
        try {
            const userId = req.user!._id;
            const entry = await dietService.getEntryById(userId, req.params.id as string);
            const withHateoas = withLinks(entry, {
                self: `/api/v1/diet/entries/${entry._id}`,
                update: `/api/v1/diet/entries/${entry._id}`,
                delete: `/api/v1/diet/entries/${entry._id}`,
            });
            return ApiResponseHelper.success(res, withHateoas, "Meal entry fetched successfully");
        } catch (error: any) {
            return ApiResponseHelper.error(res, error.message || "Internal Server Error", error.status || 500);
        }
    }

    /** POST /api/v1/diet/entries */
    async createEntry(req: Request, res: Response) {
        try {
            const parsed = CreateMealEntryDTO.safeParse(req.body);
            if (!parsed.success) {
                return ApiResponseHelper.error(res, z.prettifyError(parsed.error), 400);
            }
            const userId = req.user!._id;
            const entry = await dietService.createEntry(userId, parsed.data);
            return ApiResponseHelper.success(res, entry, "Meal entry created successfully", 201);
        } catch (error: any) {
            return ApiResponseHelper.error(res, error.message || "Internal Server Error", error.status || 500);
        }
    }

    /** PUT /api/v1/diet/entries/:id */
    async updateEntry(req: Request, res: Response) {
        try {
            const parsed = UpdateMealEntryDTO.safeParse(req.body);
            if (!parsed.success) {
                return ApiResponseHelper.error(res, z.prettifyError(parsed.error), 400);
            }
            const userId = req.user!._id;
            const entry = await dietService.updateEntry(userId, req.params.id as string, parsed.data);
            return ApiResponseHelper.success(res, entry, "Meal entry updated successfully");
        } catch (error: any) {
            return ApiResponseHelper.error(res, error.message || "Internal Server Error", error.status || 500);
        }
    }

    /** DELETE /api/v1/diet/entries/:id */
    async deleteEntry(req: Request, res: Response) {
        try {
            const userId = req.user!._id;
            await dietService.deleteEntry(userId, req.params.id as string);
            return ApiResponseHelper.success(res, null, "Meal entry deleted successfully");
        } catch (error: any) {
            return ApiResponseHelper.error(res, error.message || "Internal Server Error", error.status || 500);
        }
    }

    /** POST /api/v1/diet/analyze-photo */
    async analyzePhoto(req: Request, res: Response) {
        const file = req.file;
        try {
            if (!file) {
                return ApiResponseHelper.error(res, "No photo was uploaded", 400);
            }
            const analysis = await foodVisionService.analyzePhoto(
                file.path,
                file.mimetype as "image/jpeg" | "image/png"
            );
            return ApiResponseHelper.success(res, analysis, "Photo analyzed successfully");
        } catch (error: any) {
            return ApiResponseHelper.error(res, error.message || "Internal Server Error", error.status || 500);
        } finally {
            if (file) fs.unlink(file.path, () => {});
        }
    }
}
