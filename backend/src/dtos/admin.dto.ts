import { z } from "zod";

/** DTO for admin creating a new user — role is settable. */
export const AdminCreateUserDTO = z.object({
    firstName: z.string().min(2, "First name must be at least 2 characters"),
    lastName: z.string().min(2, "Last name must be at least 2 characters"),
    email: z.email("Invalid email address"),
    username: z.string().min(3, "Username must be at least 3 characters"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    role: z.enum(["admin", "user"]).default("user"),
});

export type AdminCreateUserDTO = z.infer<typeof AdminCreateUserDTO>;

/** DTO for admin partially updating any user field. */
export const AdminUpdateUserDTO = z.object({
    firstName: z.string().min(2).optional(),
    lastName: z.string().min(2).optional(),
    email: z.email().optional(),
    username: z.string().min(3).optional(),
    role: z.enum(["admin", "user"]).optional(),
    dateOfBirth: z.coerce.date().optional(),
});

export type AdminUpdateUserDTO = z.infer<typeof AdminUpdateUserDTO>;

/** Validated query parameters for the paginated user list. */
export const AdminListQueryDTO = z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(10),
    search: z.string().optional(),
});

export type AdminListQueryDTO = z.infer<typeof AdminListQueryDTO>;
