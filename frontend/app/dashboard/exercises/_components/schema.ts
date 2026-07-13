import { z } from "zod";

const timePattern = /^([01]\d|2[0-3]):([0-5]\d)$/;
export const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;

export const exerciseFormSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    type: z.enum(["cardio", "strength", "flexibility", "balance"]),
    durationMinutes: z.coerce.number().int().min(1, "Duration must be at least 1 minute"),
    daysOfWeek: z.array(z.enum(WEEKDAYS)).min(1, "Select at least one day"),
    reminderTime: z.string().regex(timePattern, "Enter a valid time"),
    notes: z.string().optional(),
    isActive: z.boolean(),
});

export type ExerciseFormData = z.infer<typeof exerciseFormSchema>;
