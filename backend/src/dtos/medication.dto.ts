import { z } from "zod";

const timePattern = /^([01]\d|2[0-3]):([0-5]\d)$/;

export const MedicationSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters long"),
    dosage: z.string().min(1, "Dosage is required"),
    frequencyPerDay: z.coerce.number().int().min(1, "Must be taken at least once a day"),
    reminderTimes: z
        .array(z.string().regex(timePattern, "Time must be in HH:mm format"))
        .min(1, "Add at least one reminder time"),
    startDate: z.coerce.date(),
    endDate: z.coerce.date().optional(),
    notes: z.string().optional(),
    isActive: z.boolean().default(true),
});

export const CreateMedicationDTO = MedicationSchema;
export type CreateMedicationDTO = z.infer<typeof CreateMedicationDTO>;

export const UpdateMedicationDTO = MedicationSchema.partial();
export type UpdateMedicationDTO = z.infer<typeof UpdateMedicationDTO>;
