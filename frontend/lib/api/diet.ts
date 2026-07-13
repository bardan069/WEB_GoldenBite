import axiosInstance from "./axios-instance";
import { API } from "./endpoints";
import { getApiErrorMessage } from "./error";

export interface MealEntryInput {
    mealType: "breakfast" | "lunch" | "dinner" | "snack";
    foodName: string;
    calories: number;
    date: string;
    notes?: string;
}

export interface FoodAnalysisResult {
    isFood: boolean;
    foodName: string;
    estimatedCalories: number;
    confidence: "low" | "medium" | "high";
    notes?: string;
}

export const getDietRecommendation = async () => {
    try {
        const response = await axiosInstance.get(API.DIET.RECOMMENDATION);
        return response.data;
    } catch (error: unknown) {
        throw new Error(getApiErrorMessage(error, "Failed to fetch diet recommendation"));
    }
};

export const getMealEntries = async () => {
    try {
        const response = await axiosInstance.get(API.DIET.ENTRIES);
        return response.data;
    } catch (error: unknown) {
        throw new Error(getApiErrorMessage(error, "Failed to fetch meal entries"));
    }
};

export const createMealEntry = async (data: MealEntryInput) => {
    try {
        const response = await axiosInstance.post(API.DIET.ENTRIES, data);
        return response.data;
    } catch (error: unknown) {
        throw new Error(getApiErrorMessage(error, "Failed to create meal entry"));
    }
};

export const updateMealEntry = async (id: string, data: Partial<MealEntryInput>) => {
    try {
        const response = await axiosInstance.put(API.DIET.ENTRY(id), data);
        return response.data;
    } catch (error: unknown) {
        throw new Error(getApiErrorMessage(error, "Failed to update meal entry"));
    }
};

export const deleteMealEntry = async (id: string) => {
    try {
        const response = await axiosInstance.delete(API.DIET.ENTRY(id));
        return response.data;
    } catch (error: unknown) {
        throw new Error(getApiErrorMessage(error, "Failed to delete meal entry"));
    }
};

export const analyzeFoodPhoto = async (formData: FormData) => {
    try {
        const response = await axiosInstance.post(API.DIET.ANALYZE_PHOTO, formData, {
            headers: { "Content-Type": "multipart/form-data" },
        });
        return response.data;
    } catch (error: unknown) {
        throw new Error(getApiErrorMessage(error, "Failed to analyze photo"));
    }
};
