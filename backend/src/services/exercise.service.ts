import { ExerciseMongoRepository } from "../repositories/exercise.repository";
import { CreateExerciseDTO, UpdateExerciseDTO } from "../dtos/exercise.dto";
import { IExercise } from "../models/exercise.model";
import { HttpException } from "../exceptions/http-exception";

const exerciseRepository = new ExerciseMongoRepository();

const WEEKDAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

/**
 * ExerciseService encapsulates business logic for a user's exercise
 * reminders, enforcing that a user may only read/modify their own records.
 */
export class ExerciseService {
    /** Returns all exercises belonging to the given user. */
    async list(userId: string): Promise<IExercise[]> {
        return exerciseRepository.findAllForUser(userId);
    }

    /** Returns active exercises scheduled for today's weekday. */
    async listDueToday(userId: string): Promise<IExercise[]> {
        const all = await exerciseRepository.findAllForUser(userId);
        const todayLabel = WEEKDAY_LABELS[new Date().getDay()];
        return all.filter((exercise) => exercise.isActive && exercise.daysOfWeek.includes(todayLabel));
    }

    /**
     * Retrieves a single exercise owned by the user.
     * @throws HttpException 404 when missing or owned by another user
     */
    async getById(userId: string, id: string): Promise<IExercise> {
        const exercise = await exerciseRepository.findById(id);
        if (!exercise || exercise.userId.toString() !== userId.toString()) {
            throw new HttpException(404, "Exercise not found");
        }
        return exercise;
    }

    async create(userId: string, data: CreateExerciseDTO): Promise<IExercise> {
        return exerciseRepository.create(userId, data);
    }

    async update(userId: string, id: string, data: UpdateExerciseDTO): Promise<IExercise> {
        await this.getById(userId, id);
        const updated = await exerciseRepository.update(id, data);
        if (!updated) throw new HttpException(500, "Failed to update exercise");
        return updated;
    }

    async delete(userId: string, id: string): Promise<void> {
        await this.getById(userId, id);
        const deleted = await exerciseRepository.delete(id);
        if (!deleted) throw new HttpException(500, "Failed to delete exercise");
    }

    /** Records that today's session was completed. */
    async markComplete(userId: string, id: string): Promise<IExercise> {
        await this.getById(userId, id);
        const updated = await exerciseRepository.update(id, { lastCompletedAt: new Date() });
        if (!updated) throw new HttpException(500, "Failed to update exercise");
        return updated;
    }
}
