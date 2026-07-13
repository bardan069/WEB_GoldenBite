"use server";

import {
    getDietRecommendation,
    getMealEntries,
    createMealEntry,
    updateMealEntry,
    deleteMealEntry,
    analyzeFoodPhoto,
    MealEntryInput,
} from "@/lib/api/diet";
import { revalidatePath } from "next/cache";

export const handleGetDietRecommendation = async () => {
    try {
        const result = await getDietRecommendation();
        return { success: true, data: result.data };
    } catch (error: unknown) {
        return { success: false, message: error instanceof Error ? error.message : "Failed to fetch diet recommendation" };
    }
};

export const handleGetMealEntries = async () => {
    try {
        const result = await getMealEntries();
        return { success: true, data: result.data };
    } catch (error: unknown) {
        return { success: false, message: error instanceof Error ? error.message : "Failed to fetch meal entries" };
    }
};

export const handleCreateMealEntry = async (data: MealEntryInput) => {
    try {
        const result = await createMealEntry(data);
        revalidatePath("/dashboard/diet");
        revalidatePath("/dashboard");
        return { success: true, data: result.data, message: result.message };
    } catch (error: unknown) {
        return { success: false, message: error instanceof Error ? error.message : "Failed to create meal entry" };
    }
};

export const handleUpdateMealEntry = async (id: string, data: Partial<MealEntryInput>) => {
    try {
        const result = await updateMealEntry(id, data);
        revalidatePath("/dashboard/diet");
        revalidatePath("/dashboard");
        return { success: true, data: result.data, message: result.message };
    } catch (error: unknown) {
        return { success: false, message: error instanceof Error ? error.message : "Failed to update meal entry" };
    }
};

export const handleDeleteMealEntry = async (id: string) => {
    try {
        const result = await deleteMealEntry(id);
        revalidatePath("/dashboard/diet");
        revalidatePath("/dashboard");
        return { success: true, message: result.message };
    } catch (error: unknown) {
        return { success: false, message: error instanceof Error ? error.message : "Failed to delete meal entry" };
    }
};

export const handleAnalyzeFoodPhoto = async (formData: FormData) => {
    try {
        const result = await analyzeFoodPhoto(formData);
        return { success: true, data: result.data, message: result.message };
    } catch (error: unknown) {
        return { success: false, message: error instanceof Error ? error.message : "Failed to analyze photo" };
    }
};
