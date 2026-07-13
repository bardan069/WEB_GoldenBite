import axiosInstance from "./axios-instance";
import { API } from "./endpoints";
import { getApiErrorMessage } from "./error";

export interface MedicationInput {
    name: string;
    dosage: string;
    frequencyPerDay: number;
    reminderTimes: string[];
    startDate: string;
    endDate?: string;
    notes?: string;
    isActive?: boolean;
}

export const getMedications = async () => {
    try {
        const response = await axiosInstance.get(API.MEDICATIONS.LIST);
        return response.data;
    } catch (error: unknown) {
        throw new Error(getApiErrorMessage(error, "Failed to fetch medications"));
    }
};

export const getMedicationsDueToday = async () => {
    try {
        const response = await axiosInstance.get(API.MEDICATIONS.TODAY);
        return response.data;
    } catch (error: unknown) {
        throw new Error(getApiErrorMessage(error, "Failed to fetch today's medications"));
    }
};

export const createMedication = async (data: MedicationInput) => {
    try {
        const response = await axiosInstance.post(API.MEDICATIONS.LIST, data);
        return response.data;
    } catch (error: unknown) {
        throw new Error(getApiErrorMessage(error, "Failed to create medication"));
    }
};

export const updateMedication = async (id: string, data: Partial<MedicationInput>) => {
    try {
        const response = await axiosInstance.put(API.MEDICATIONS.DETAIL(id), data);
        return response.data;
    } catch (error: unknown) {
        throw new Error(getApiErrorMessage(error, "Failed to update medication"));
    }
};

export const deleteMedication = async (id: string) => {
    try {
        const response = await axiosInstance.delete(API.MEDICATIONS.DETAIL(id));
        return response.data;
    } catch (error: unknown) {
        throw new Error(getApiErrorMessage(error, "Failed to delete medication"));
    }
};

export const markMedicationTaken = async (id: string) => {
    try {
        const response = await axiosInstance.patch(API.MEDICATIONS.TAKEN(id));
        return response.data;
    } catch (error: unknown) {
        throw new Error(getApiErrorMessage(error, "Failed to update medication"));
    }
};
