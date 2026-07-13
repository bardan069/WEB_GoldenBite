import { MealEntryMongoRepository } from "../repositories/meal-entry.repository";
import { CreateMealEntryDTO, UpdateMealEntryDTO } from "../dtos/diet.dto";
import { IMealEntry } from "../models/meal-entry.model";
import { HttpException } from "../exceptions/http-exception";
import { getAge, getNutritionTarget, NutritionTarget } from "../utils/age.util";

const mealEntryRepository = new MealEntryMongoRepository();

/**
 * DietService computes age-based nutrition targets and manages a user's
 * personal meal log, enforcing that a user may only read/modify their own entries.
 */
export class DietService {
    /**
     * Returns daily nutrition targets based on the user's date of birth.
     * @throws HttpException 400 when the user has not set a date of birth yet
     */
    getRecommendation(dateOfBirth?: Date): NutritionTarget {
        if (!dateOfBirth) {
            throw new HttpException(400, "Please set your date of birth in your profile to get a diet recommendation");
        }
        const age = getAge(new Date(dateOfBirth));
        return getNutritionTarget(age);
    }

    /** Returns all meal log entries belonging to the given user. */
    async listEntries(userId: string): Promise<IMealEntry[]> {
        return mealEntryRepository.findAllForUser(userId);
    }

    /**
     * Retrieves a single meal entry owned by the user.
     * @throws HttpException 404 when missing or owned by another user
     */
    async getEntryById(userId: string, id: string): Promise<IMealEntry> {
        const entry = await mealEntryRepository.findById(id);
        if (!entry || entry.userId.toString() !== userId.toString()) {
            throw new HttpException(404, "Meal entry not found");
        }
        return entry;
    }

    async createEntry(userId: string, data: CreateMealEntryDTO): Promise<IMealEntry> {
        return mealEntryRepository.create(userId, data);
    }

    async updateEntry(userId: string, id: string, data: UpdateMealEntryDTO): Promise<IMealEntry> {
        await this.getEntryById(userId, id);
        const updated = await mealEntryRepository.update(id, data);
        if (!updated) throw new HttpException(500, "Failed to update meal entry");
        return updated;
    }

    async deleteEntry(userId: string, id: string): Promise<void> {
        await this.getEntryById(userId, id);
        const deleted = await mealEntryRepository.delete(id);
        if (!deleted) throw new HttpException(500, "Failed to delete meal entry");
    }
}
