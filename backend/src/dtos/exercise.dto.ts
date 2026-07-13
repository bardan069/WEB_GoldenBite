import { z } from "zod";

const timePattern = /^([01]\d|2[0-3]):([0-5]\d)$/;
const weekdays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;

export const ExerciseSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters long"),
    type: z.enum(["cardio", "strength", "flexibility", "balance"]),
    durationMinutes: z.coerce.number().int().min(1, "Duration must be at least 1 minute"),
    daysOfWeek: z.array(z.enum(weekdays)).min(1, "Select at least one day"),
    reminderTime: z.string().regex(timePattern, "Time must be in HH:mm format"),
    notes: z.string().optional(),
    isActive: z.boolean().default(true),
});

export const CreateExerciseDTO = ExerciseSchema;
export type CreateExerciseDTO = z.infer<typeof CreateExerciseDTO>;

export const UpdateExerciseDTO = ExerciseSchema.partial();
export type UpdateExerciseDTO = z.infer<typeof UpdateExerciseDTO>;
