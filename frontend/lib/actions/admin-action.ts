"use server";

import {
    getAdminUsers,
    getAdminUserById,
    adminCreateUser,
    adminUpdateUser,
    adminDeleteUser,
} from "@/lib/api/admin";
import { revalidatePath } from "next/cache";

export const handleGetAdminUsers = async (params: { page?: number; limit?: number; search?: string }) => {
    try {
        const result = await getAdminUsers(params);
        return { success: true, data: result.data };
    } catch (error: unknown) {
        return { success: false, message: error instanceof Error ? error.message : "Failed to fetch users" };
    }
};

export const handleGetAdminUserById = async (id: string) => {
    try {
        const result = await getAdminUserById(id);
        return { success: true, data: result.data };
    } catch (error: unknown) {
        return { success: false, message: error instanceof Error ? error.message : "Failed to fetch user" };
    }
};

export const handleAdminCreateUser = async (data: {
    firstName: string;
    lastName: string;
    email: string;
    username: string;
    password: string;
    role: "admin" | "user";
}) => {
    try {
        const result = await adminCreateUser(data);
        revalidatePath("/dashboard/admin/users");
        return { success: true, data: result.data, message: result.message };
    } catch (error: unknown) {
        return { success: false, message: error instanceof Error ? error.message : "Failed to create user" };
    }
};

export const handleAdminUpdateUser = async (
    id: string,
    data: { firstName?: string; lastName?: string; email?: string; username?: string; role?: "admin" | "user" }
) => {
    try {
        const result = await adminUpdateUser(id, data);
        revalidatePath("/dashboard/admin/users");
        return { success: true, data: result.data, message: result.message };
    } catch (error: unknown) {
        return { success: false, message: error instanceof Error ? error.message : "Failed to update user" };
    }
};

export const handleAdminDeleteUser = async (id: string) => {
    try {
        const result = await adminDeleteUser(id);
        revalidatePath("/dashboard/admin/users");
        return { success: true, message: result.message };
    } catch (error: unknown) {
        return { success: false, message: error instanceof Error ? error.message : "Failed to delete user" };
    }
};
