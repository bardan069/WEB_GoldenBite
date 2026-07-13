import { z } from "zod";

/** Shape Claude's vision analysis of an uploaded meal photo must conform to. */
export const FoodAnalysisSchema = z.object({
    isFood: z.boolean().describe("Whether the photo shows food or a drink"),
    foodName: z.string().describe("Short name of the dish, or empty string if not food"),
    estimatedCalories: z.number().int().min(0).describe("Estimated calories for the visible serving; 0 if not food"),
    confidence: z.enum(["low", "medium", "high"]).describe("Confidence in the calorie estimate"),
    notes: z.string().optional().describe("Optional one-sentence caveat about the estimate"),
});

export type FoodAnalysis = z.infer<typeof FoodAnalysisSchema>;
