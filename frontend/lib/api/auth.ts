import axiosInstance from "./axios-instance";
import { API } from "./endpoints";
import { getApiErrorMessage } from "./error";
import { RegisterFormData, LoginFormData } from "@/app/(auth)/_components/schema";
import { UpdatePasswordFormData } from "@/app/dashboard/_components/schema";

export const register = async (data: RegisterFormData) => {
    try {
        const response = await axiosInstance.post(API.AUTH.REGISTER, data);
        return response.data;
    } catch (error: unknown) {
        throw new Error(getApiErrorMessage(error, "Registration failed"));
    }
};

export const login = async (data: LoginFormData) => {
    try {
        const response = await axiosInstance.post(API.AUTH.LOGIN, data);
        return response.data;
    } catch (error: unknown) {
        throw new Error(getApiErrorMessage(error, "Login failed"));
    }
};

export const whoami = async () => {
    try {
        const response = await axiosInstance.get(API.AUTH.WHOAMI);
        return response.data;
    } catch (error: unknown) {
        throw new Error(getApiErrorMessage(error, "Failed to fetch user details"));
    }
};

export const updateProfile = async (data: FormData) => {
    try {
        const response = await axiosInstance.put(API.AUTH.UPDATE, data, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });
        return response.data;
    } catch (error: unknown) {
        throw new Error(getApiErrorMessage(error, "Failed to update profile"));
    }
};

export const updatePassword = async (data: UpdatePasswordFormData) => {
    try {
        const response = await axiosInstance.put(API.AUTH.UPDATE_PASSWORD, data);
        return response.data;
    } catch (error: unknown) {
        throw new Error(getApiErrorMessage(error, "Failed to update password"));
    }
};
