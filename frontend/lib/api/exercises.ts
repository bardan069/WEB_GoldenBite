import axiosInstance from "./axios-instance";
import { API } from "./endpoints";
import { getApiErrorMessage } from "./error";

export interface ExerciseInput {
    name: string;
    type: "cardio" | "strength" | "flexibility" | "balance";
    durationMinutes: number;
    daysOfWeek: string[];
    reminderTime: string;
    notes?: string;
    isActive?: boolean;
}

export const getExercises = async () => {
    try {
        const response = await axiosInstance.get(API.EXERCISES.LIST);
        return response.data;
    } catch (error: unknown) {
        throw new Error(getApiErrorMessage(error, "Failed to fetch exercises"));
    }
};

export const getExercisesDueToday = async () => {
    try {
        const response = await axiosInstance.get(API.EXERCISES.TODAY);
        return response.data;
    } catch (error: unknown) {
        throw new Error(getApiErrorMessage(error, "Failed to fetch today's exercises"));
    }
};

export const createExercise = async (data: ExerciseInput) => {
    try {
        const response = await axiosInstance.post(API.EXERCISES.LIST, data);
        return response.data;
    } catch (error: unknown) {
        throw new Error(getApiErrorMessage(error, "Failed to create exercise"));
    }
};

export const updateExercise = async (id: string, data: Partial<ExerciseInput>) => {
    try {
        const response = await axiosInstance.put(API.EXERCISES.DETAIL(id), data);
        return response.data;
    } catch (error: unknown) {
        throw new Error(getApiErrorMessage(error, "Failed to update exercise"));
    }
};

export const deleteExercise = async (id: string) => {
    try {
        const response = await axiosInstance.delete(API.EXERCISES.DETAIL(id));
        return response.data;
    } catch (error: unknown) {
        throw new Error(getApiErrorMessage(error, "Failed to delete exercise"));
    }
};

export const markExerciseComplete = async (id: string) => {
    try {
        const response = await axiosInstance.patch(API.EXERCISES.COMPLETE(id));
        return response.data;
    } catch (error: unknown) {
        throw new Error(getApiErrorMessage(error, "Failed to update exercise"));
    }
};
