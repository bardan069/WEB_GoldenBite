import { Request, Response } from "express";
import { z } from "zod";
import { MedicationService } from "../services/medication.service";
import { CreateMedicationDTO, UpdateMedicationDTO } from "../dtos/medication.dto";
import { ApiResponseHelper } from "../utils/apihelper.util";
import { withLinks } from "../utils/hateoas.util";

const medicationService = new MedicationService();

/**
 * MedicationController handles HTTP layer concerns for medication reminders.
 * All methods delegate business logic to MedicationService and respond with
 * standardised JSON via ApiResponseHelper.
 */
export class MedicationController {
    /** GET /api/v1/medications */
    async list(req: Request, res: Response) {
        try {
            const userId = req.user!._id.toString();
            const medications = await medicationService.list(userId);
            return ApiResponseHelper.success(res, medications, "Medications fetched successfully");
        } catch (error) {
            const { status, message } = ApiResponseHelper.resolveError(error);
            return ApiResponseHelper.error(res, message, status);
        }
    }

    /** GET /api/v1/medications/today */
    async listDueToday(req: Request, res: Response) {
        try {
            const userId = req.user!._id.toString();
            const medications = await medicationService.listDueToday(userId);
            return ApiResponseHelper.success(res, medications, "Today's medications fetched successfully");
        } catch (error) {
            const { status, message } = ApiResponseHelper.resolveError(error);
            return ApiResponseHelper.error(res, message, status);
        }
    }

    /** GET /api/v1/medications/:id */
    async getById(req: Request, res: Response) {
        try {
            const userId = req.user!._id.toString();
            const medication = await medicationService.getById(userId, req.params.id as string);
            const withHateoas = withLinks(medication, {
                self: `/api/v1/medications/${medication._id}`,
                update: `/api/v1/medications/${medication._id}`,
                delete: `/api/v1/medications/${medication._id}`,
            });
            return ApiResponseHelper.success(res, withHateoas, "Medication fetched successfully");
        } catch (error) {
            const { status, message } = ApiResponseHelper.resolveError(error);
            return ApiResponseHelper.error(res, message, status);
        }
    }

    /** POST /api/v1/medications */
    async create(req: Request, res: Response) {
        try {
            const parsed = CreateMedicationDTO.safeParse(req.body);
            if (!parsed.success) {
                return ApiResponseHelper.error(res, z.prettifyError(parsed.error), 400);
            }
            const userId = req.user!._id.toString();
            const medication = await medicationService.create(userId, parsed.data);
            return ApiResponseHelper.success(res, medication, "Medication created successfully", 201);
        } catch (error) {
            const { status, message } = ApiResponseHelper.resolveError(error);
            return ApiResponseHelper.error(res, message, status);
        }
    }

    /** PUT /api/v1/medications/:id */
    async update(req: Request, res: Response) {
        try {
            const parsed = UpdateMedicationDTO.safeParse(req.body);
            if (!parsed.success) {
                return ApiResponseHelper.error(res, z.prettifyError(parsed.error), 400);
            }
            const userId = req.user!._id.toString();
            const medication = await medicationService.update(userId, req.params.id as string, parsed.data);
            return ApiResponseHelper.success(res, medication, "Medication updated successfully");
        } catch (error) {
            const { status, message } = ApiResponseHelper.resolveError(error);
            return ApiResponseHelper.error(res, message, status);
        }
    }

    /** DELETE /api/v1/medications/:id */
    async delete(req: Request, res: Response) {
        try {
            const userId = req.user!._id.toString();
            await medicationService.delete(userId, req.params.id as string);
            return ApiResponseHelper.success(res, null, "Medication deleted successfully");
        } catch (error) {
            const { status, message } = ApiResponseHelper.resolveError(error);
            return ApiResponseHelper.error(res, message, status);
        }
    }

    /** PATCH /api/v1/medications/:id/taken */
    async markTaken(req: Request, res: Response) {
        try {
            const userId = req.user!._id.toString();
            const medication = await medicationService.markTaken(userId, req.params.id as string);
            return ApiResponseHelper.success(res, medication, "Medication marked as taken");
        } catch (error) {
            const { status, message } = ApiResponseHelper.resolveError(error);
            return ApiResponseHelper.error(res, message, status);
        }
    }
}
