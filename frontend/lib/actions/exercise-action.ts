"use server";

import {
    getExercises,
    getExercisesDueToday,
    createExercise,
    updateExercise,
    deleteExercise,
    markExerciseComplete,
    ExerciseInput,
} from "@/lib/api/exercises";
import { revalidatePath } from "next/cache";

export const handleGetExercises = async () => {
    try {
        const result = await getExercises();
        return { success: true, data: result.data };
    } catch (error: unknown) {
        return { success: false, message: error instanceof Error ? error.message : "Failed to fetch exercises" };
    }
};

export const handleGetExercisesDueToday = async () => {
    try {
        const result = await getExercisesDueToday();
        return { success: true, data: result.data };
    } catch (error: unknown) {
        return { success: false, message: error instanceof Error ? error.message : "Failed to fetch today's exercises" };
    }
};

export const handleCreateExercise = async (data: ExerciseInput) => {
    try {
        const result = await createExercise(data);
        revalidatePath("/dashboard/exercises");
        revalidatePath("/dashboard");
        return { success: true, data: result.data, message: result.message };
    } catch (error: unknown) {
        return { success: false, message: error instanceof Error ? error.message : "Failed to create exercise" };
    }
};

export const handleUpdateExercise = async (id: string, data: Partial<ExerciseInput>) => {
    try {
        const result = await updateExercise(id, data);
        revalidatePath("/dashboard/exercises");
        revalidatePath("/dashboard");
        return { success: true, data: result.data, message: result.message };
    } catch (error: unknown) {
        return { success: false, message: error instanceof Error ? error.message : "Failed to update exercise" };
    }
};

export const handleDeleteExercise = async (id: string) => {
    try {
        const result = await deleteExercise(id);
        revalidatePath("/dashboard/exercises");
        revalidatePath("/dashboard");
        return { success: true, message: result.message };
    } catch (error: unknown) {
        return { success: false, message: error instanceof Error ? error.message : "Failed to delete exercise" };
    }
};

export const handleMarkExerciseComplete = async (id: string) => {
    try {
        const result = await markExerciseComplete(id);
        revalidatePath("/dashboard/exercises");
        revalidatePath("/dashboard");
        return { success: true, data: result.data, message: result.message };
    } catch (error: unknown) {
        return { success: false, message: error instanceof Error ? error.message : "Failed to update exercise" };
    }
};
