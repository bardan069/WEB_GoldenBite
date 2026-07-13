import { MealEntryModel, IMealEntry } from "../models/meal-entry.model";

export interface IMealEntryRepository {
    create(userId: string, data: Partial<IMealEntry>): Promise<IMealEntry>;
    findAllForUser(userId: string): Promise<IMealEntry[]>;
    findById(id: string): Promise<IMealEntry | null>;
    update(id: string, data: Partial<IMealEntry>): Promise<IMealEntry | null>;
    delete(id: string): Promise<boolean>;
}

export class MealEntryMongoRepository implements IMealEntryRepository {
    async create(userId: string, data: Partial<IMealEntry>): Promise<IMealEntry> {
        return MealEntryModel.create({ ...data, userId });
    }

    async findAllForUser(userId: string): Promise<IMealEntry[]> {
        return MealEntryModel.find({ userId }).sort({ date: -1 });
    }

    async findById(id: string): Promise<IMealEntry | null> {
        return MealEntryModel.findById(id);
    }

    async update(id: string, data: Partial<IMealEntry>): Promise<IMealEntry | null> {
        return MealEntryModel.findByIdAndUpdate(id, data, { new: true });
    }

    async delete(id: string): Promise<boolean> {
        const deleted = await MealEntryModel.findByIdAndDelete(id);
        return !!deleted;
    }
}
