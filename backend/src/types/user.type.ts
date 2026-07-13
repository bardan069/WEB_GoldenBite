import { z } from "zod";

export const UserSchema = z.object({
    firstName: z.string().min(2, "First name must be at least 2 characters long"),
    lastName: z.string().min(2, "Last name must be at least 2 characters long"),
    email: z.email("Invalid email address"),
    username: z.string().min(3, "Username must be at least 3 characters long"),
    password: z.string().min(6, "Password must be at least 6 characters long"),
    role: z.enum(["admin", "user"]).default("user"),
    profileImage: z.string().optional(),
    dateOfBirth: z.coerce.date().optional(),
});

export type UserType = z.infer<typeof UserSchema>;
