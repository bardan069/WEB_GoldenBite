import axiosInstance from "./axios-instance";
import { API } from "./endpoints";
import { getApiErrorMessage } from "./error";

export const getAdminUsers = async (params: { page?: number; limit?: number; search?: string }) => {
    try {
        const response = await axiosInstance.get(API.ADMIN.USERS, { params });
        return response.data;
    } catch (error: unknown) {
        throw new Error(getApiErrorMessage(error, "Failed to fetch users"));
    }
};

export const getAdminUserById = async (id: string) => {
    try {
        const response = await axiosInstance.get(API.ADMIN.USER(id));
        return response.data;
    } catch (error: unknown) {
        throw new Error(getApiErrorMessage(error, "Failed to fetch user"));
    }
};

export const adminCreateUser = async (data: {
    firstName: string;
    lastName: string;
    email: string;
    username: string;
    password: string;
    role: "admin" | "user";
}) => {
    try {
        const response = await axiosInstance.post(API.ADMIN.USERS, data);
        return response.data;
    } catch (error: unknown) {
        throw new Error(getApiErrorMessage(error, "Failed to create user"));
    }
};

export const adminUpdateUser = async (
    id: string,
    data: { firstName?: string; lastName?: string; email?: string; username?: string; role?: "admin" | "user" }
) => {
    try {
        const response = await axiosInstance.put(API.ADMIN.USER(id), data);
        return response.data;
    } catch (error: unknown) {
        throw new Error(getApiErrorMessage(error, "Failed to update user"));
    }
};

export const adminDeleteUser = async (id: string) => {
    try {
        const response = await axiosInstance.delete(API.ADMIN.USER(id));
        return response.data;
    } catch (error: unknown) {
        throw new Error(getApiErrorMessage(error, "Failed to delete user"));
    }
};
