import { z } from "zod";

export const registerSchema = z.object({
    email: z.email("Invalid email address"),
    firstName: z.string("First name must be a string")
        .min(2, "First name must be at least 2 characters long"),
    lastName: z.string("Last name must be a string")
        .min(2, "Last name must be at least 2 characters long"),
    username: z.string("Username must be a string")
        .min(3, "Username must be at least 3 characters long"),
    password: z.string("Password must be a string")
        .min(6, "Password must be at least 6 characters long"),
    confirmPassword: z.string("Confirm password must be a string")
        .min(6, "Confirm password must be at least 6 characters long"),
    profileImage: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
});

export type RegisterFormData = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
    email: z.email("Invalid email address"),
    password: z.string("Password must be a string")
        .min(6, "Password must be at least 6 characters long"),
});

export type LoginFormData = z.infer<typeof loginSchema>;
