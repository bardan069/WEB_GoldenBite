import { MedicationModel, IMedication } from "../models/medication.model";

export interface IMedicationRepository {
    create(userId: string, data: Partial<IMedication>): Promise<IMedication>;
    findAllForUser(userId: string): Promise<IMedication[]>;
    findById(id: string): Promise<IMedication | null>;
    update(id: string, data: Partial<IMedication>): Promise<IMedication | null>;
    delete(id: string): Promise<boolean>;
}

export class MedicationMongoRepository implements IMedicationRepository {
    async create(userId: string, data: Partial<IMedication>): Promise<IMedication> {
        return MedicationModel.create({ ...data, userId });
    }

    async findAllForUser(userId: string): Promise<IMedication[]> {
        return MedicationModel.find({ userId }).sort({ createdAt: -1 });
    }

    async findById(id: string): Promise<IMedication | null> {
        return MedicationModel.findById(id);
    }

    async update(id: string, data: Partial<IMedication>): Promise<IMedication | null> {
        return MedicationModel.findByIdAndUpdate(id, data, { new: true });
    }

    async delete(id: string): Promise<boolean> {
        const deleted = await MedicationModel.findByIdAndDelete(id);
        return !!deleted;
    }
}
