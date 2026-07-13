import { z } from "zod";

export const MealEntrySchema = z.object({
    mealType: z.enum(["breakfast", "lunch", "dinner", "snack"]),
    foodName: z.string().min(1, "Food name is required"),
    calories: z.coerce.number().min(0, "Calories cannot be negative"),
    date: z.coerce.date(),
    notes: z.string().optional(),
});

export const CreateMealEntryDTO = MealEntrySchema;
export type CreateMealEntryDTO = z.infer<typeof CreateMealEntryDTO>;

export const UpdateMealEntryDTO = MealEntrySchema.partial();
export type UpdateMealEntryDTO = z.infer<typeof UpdateMealEntryDTO>;
