"use server";

import { register, login, whoami, updateProfile, updatePassword } from "@/lib/api/auth";
import { LoginFormData, RegisterFormData } from "@/app/(auth)/_components/schema";
import { clearAuthCookies, setTokenCookie, storeUserData } from "@/lib/cookies";
import { revalidatePath } from "next/cache";
import { UpdatePasswordFormData } from "@/app/dashboard/_components/schema";
import { redirect, RedirectType } from "next/navigation";

export const handleRegisterUser = async (data: RegisterFormData) => {
    try {
        const result = await register(data);
        if (result.success) {
            return { success: true, message: result.message, data: result.data };
        } else {
            return { success: false, message: result.message || "Registration failed" };
        }
    } catch (error: unknown) {
        return { success: false, message: error instanceof Error ? error.message : "Registration failed" };
    }
};

export const handleLoginUser = async (data: LoginFormData) => {
    try {
        const result = await login(data);
        const user = result.data.user;
        const token = result.data.token;
        await setTokenCookie(token);
        await storeUserData(user);

        if (result.success) {
            return { success: true, message: result.message, data: result.data };
        } else {
            return { success: false, message: result.message || "Login failed" };
        }
    } catch (error: unknown) {
        return { success: false, message: error instanceof Error ? error.message : "Login failed" };
    }
};

export const handleUserDetails = async () => {
    try {
        const result = await whoami();
        if (result.success) {
            return { success: true, message: result.message, data: result.data };
        } else {
            return { success: false, message: result.message || "Failed to fetch user details" };
        }
    } catch (error: unknown) {
        return { success: false, message: error instanceof Error ? error.message : "Failed to fetch user details" };
    }
};

export const handleUpdateProfile = async (formData: FormData) => {
    try {
        const result = await updateProfile(formData);
        if (result.success) {
            await storeUserData(result.data);
            revalidatePath("/dashboard/profile");
            return { success: true, message: result.message, data: result.data };
        } else {
            return { success: false, message: result.message || "Failed to update profile" };
        }
    } catch (error: unknown) {
        return { success: false, message: error instanceof Error ? error.message : "Failed to update profile" };
    }
};

export const handleUpdatePassword = async (data: UpdatePasswordFormData) => {
    try {
        const result = await updatePassword(data);
        if (result.success) {
            return { success: true, message: result.message, data: result.data };
        } else {
            return { success: false, message: result.message || "Failed to update password" };
        }
    } catch (error: unknown) {
        return { success: false, message: error instanceof Error ? error.message : "Failed to update password" };
    }
};

export const handleLogout = async () => {
    await clearAuthCookies();
    redirect("/login", RedirectType.replace);
};
