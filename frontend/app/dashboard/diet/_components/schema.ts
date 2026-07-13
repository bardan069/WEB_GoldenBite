import { z } from "zod";

export const mealFormSchema = z.object({
    mealType: z.enum(["breakfast", "lunch", "dinner", "snack"]),
    foodName: z.string().min(1, "Food name is required"),
    calories: z.coerce.number().min(0, "Calories cannot be negative"),
    date: z.string().min(1, "Date is required"),
    notes: z.string().optional(),
});

export type MealFormData = z.infer<typeof mealFormSchema>;
