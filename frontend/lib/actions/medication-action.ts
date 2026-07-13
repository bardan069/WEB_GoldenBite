"use server";

import {
    getMedications,
    getMedicationsDueToday,
    createMedication,
    updateMedication,
    deleteMedication,
    markMedicationTaken,
    MedicationInput,
} from "@/lib/api/medications";
import { revalidatePath } from "next/cache";

export const handleGetMedications = async () => {
    try {
        const result = await getMedications();
        return { success: true, data: result.data };
    } catch (error: unknown) {
        return { success: false, message: error instanceof Error ? error.message : "Failed to fetch medications" };
    }
};

export const handleGetMedicationsDueToday = async () => {
    try {
        const result = await getMedicationsDueToday();
        return { success: true, data: result.data };
    } catch (error: unknown) {
        return { success: false, message: error instanceof Error ? error.message : "Failed to fetch today's medications" };
    }
};

export const handleCreateMedication = async (data: MedicationInput) => {
    try {
        const result = await createMedication(data);
        revalidatePath("/dashboard/medications");
        revalidatePath("/dashboard");
        return { success: true, data: result.data, message: result.message };
    } catch (error: unknown) {
        return { success: false, message: error instanceof Error ? error.message : "Failed to create medication" };
    }
};

export const handleUpdateMedication = async (id: string, data: Partial<MedicationInput>) => {
    try {
        const result = await updateMedication(id, data);
        revalidatePath("/dashboard/medications");
        revalidatePath("/dashboard");
        return { success: true, data: result.data, message: result.message };
    } catch (error: unknown) {
        return { success: false, message: error instanceof Error ? error.message : "Failed to update medication" };
    }
};

export const handleDeleteMedication = async (id: string) => {
    try {
        const result = await deleteMedication(id);
        revalidatePath("/dashboard/medications");
        revalidatePath("/dashboard");
        return { success: true, message: result.message };
    } catch (error: unknown) {
        return { success: false, message: error instanceof Error ? error.message : "Failed to delete medication" };
    }
};

export const handleMarkMedicationTaken = async (id: string) => {
    try {
        const result = await markMedicationTaken(id);
        revalidatePath("/dashboard/medications");
        revalidatePath("/dashboard");
        return { success: true, data: result.data, message: result.message };
    } catch (error: unknown) {
        return { success: false, message: error instanceof Error ? error.message : "Failed to update medication" };
    }
};
