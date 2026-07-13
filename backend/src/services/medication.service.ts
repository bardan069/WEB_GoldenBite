import { MedicationMongoRepository } from "../repositories/medication.repository";
import { CreateMedicationDTO, UpdateMedicationDTO } from "../dtos/medication.dto";
import { IMedication } from "../models/medication.model";
import { HttpException } from "../exceptions/http-exception";

const medicationRepository = new MedicationMongoRepository();

/**
 * MedicationService encapsulates business logic for a user's medication
 * reminders, enforcing that a user may only read/modify their own records.
 */
export class MedicationService {
    /** Returns all medications belonging to the given user. */
    async list(userId: string): Promise<IMedication[]> {
        return medicationRepository.findAllForUser(userId);
    }

    /** Returns active medications whose schedule window covers today. */
    async listDueToday(userId: string): Promise<IMedication[]> {
        const all = await medicationRepository.findAllForUser(userId);
        const today = new Date();
        return all.filter((medication) => this._isDueToday(medication, today));
    }

    /**
     * Retrieves a single medication owned by the user.
     * @throws HttpException 404 when missing or owned by another user
     */
    async getById(userId: string, id: string): Promise<IMedication> {
        const medication = await medicationRepository.findById(id);
        if (!medication || medication.userId.toString() !== userId.toString()) {
            throw new HttpException(404, "Medication not found");
        }
        return medication;
    }

    async create(userId: string, data: CreateMedicationDTO): Promise<IMedication> {
        return medicationRepository.create(userId, data);
    }

    async update(userId: string, id: string, data: UpdateMedicationDTO): Promise<IMedication> {
        await this.getById(userId, id);
        const updated = await medicationRepository.update(id, data);
        if (!updated) throw new HttpException(500, "Failed to update medication");
        return updated;
    }

    async delete(userId: string, id: string): Promise<void> {
        await this.getById(userId, id);
        const deleted = await medicationRepository.delete(id);
        if (!deleted) throw new HttpException(500, "Failed to delete medication");
    }

    /** Records that today's dose was taken. */
    async markTaken(userId: string, id: string): Promise<IMedication> {
        await this.getById(userId, id);
        const updated = await medicationRepository.update(id, { lastTakenAt: new Date() });
        if (!updated) throw new HttpException(500, "Failed to update medication");
        return updated;
    }

    private _isDueToday(medication: IMedication, today: Date): boolean {
        if (!medication.isActive) return false;

        const start = new Date(medication.startDate);
        start.setHours(0, 0, 0, 0);
        if (today < start) return false;

        if (medication.endDate) {
            const end = new Date(medication.endDate);
            end.setHours(23, 59, 59, 999);
            if (today > end) return false;
        }

        return true;
    }
}
