import { ExerciseModel, IExercise } from "../models/exercise.model";

export interface IExerciseRepository {
    create(userId: string, data: Partial<IExercise>): Promise<IExercise>;
    findAllForUser(userId: string): Promise<IExercise[]>;
    findById(id: string): Promise<IExercise | null>;
    update(id: string, data: Partial<IExercise>): Promise<IExercise | null>;
    delete(id: string): Promise<boolean>;
}

export class ExerciseMongoRepository implements IExerciseRepository {
    async create(userId: string, data: Partial<IExercise>): Promise<IExercise> {
        return ExerciseModel.create({ ...data, userId });
    }

    async findAllForUser(userId: string): Promise<IExercise[]> {
        return ExerciseModel.find({ userId }).sort({ createdAt: -1 });
    }

    async findById(id: string): Promise<IExercise | null> {
        return ExerciseModel.findById(id);
    }

    async update(id: string, data: Partial<IExercise>): Promise<IExercise | null> {
        return ExerciseModel.findByIdAndUpdate(id, data, { new: true });
    }

    async delete(id: string): Promise<boolean> {
        const deleted = await ExerciseModel.findByIdAndDelete(id);
        return !!deleted;
    }
}
