import { z } from "zod";

const timePattern = /^([01]\d|2[0-3]):([0-5]\d)$/;

export const medicationFormSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    dosage: z.string().min(1, "Dosage is required"),
    frequencyPerDay: z.coerce.number().int().min(1, "Must be taken at least once a day"),
    reminderTimes: z
        .array(z.object({ time: z.string().regex(timePattern, "Enter a valid time") }))
        .min(1, "Add at least one reminder time"),
    startDate: z.string().min(1, "Start date is required"),
    endDate: z.string().optional(),
    notes: z.string().optional(),
    isActive: z.boolean(),
});

export type MedicationFormData = z.infer<typeof medicationFormSchema>;
