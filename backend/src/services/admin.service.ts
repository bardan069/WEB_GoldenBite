import { UserMongoRepository } from "../repositories/user.repository";
import { AdminCreateUserDTO, AdminUpdateUserDTO } from "../dtos/admin.dto";
import { IUser } from "../models/user.model";
import { HttpException } from "../exceptions/http-exception";
import bcryptjs from "bcryptjs";

const userRepository = new UserMongoRepository();

/** Pagination metadata returned alongside list results. */
export interface PaginationMeta {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

/** Paginated list result shape. */
export interface PaginatedUsers {
    data: IUser[];
    meta: PaginationMeta;
}

/**
 * AdminService encapsulates all admin-specific business logic for user management.
 * It builds on top of UserMongoRepository and enforces rules such as
 * uniqueness checks and password hashing before writing to the database.
 */
export class AdminService {
    /**
     * Returns a paginated, optionally-searched list of users.
     * @param page  1-based page number
     * @param limit Number of items per page
     * @param search Optional search term matched against name / email / username
     */
    async listUsers(page: number, limit: number, search?: string): Promise<PaginatedUsers> {
        const skip = (page - 1) * limit;
        const [data, total] = await Promise.all([
            userRepository.getUsersWithPagination(skip, limit, search),
            userRepository.countUsers(search),
        ]);

        return {
            data,
            meta: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    /**
     * Retrieves a single user by their MongoDB ObjectId.
     * @throws HttpException 404 when the user does not exist
     */
    async getUserById(id: string): Promise<IUser> {
        const user = await userRepository.getUserById(id);
        if (!user) throw new HttpException(404, "User not found");
        return user;
    }

    /**
     * Creates a new user with the provided data; the role may be set by the admin.
     * Password is hashed before persistence.
     * @throws HttpException 400 on duplicate email or username
     */
    async createUser(data: AdminCreateUserDTO): Promise<IUser> {
        const [byEmail, byUsername] = await Promise.all([
            userRepository.getUserByEmail(data.email),
            userRepository.getUserByUsername(data.username),
        ]);
        if (byEmail) throw new HttpException(400, "Email already exists");
        if (byUsername) throw new HttpException(400, "Username already exists");

        const hashed = await bcryptjs.hash(data.password, 10);
        return userRepository.createUser({ ...data, password: hashed });
    }

    /**
     * Partially updates a user's profile fields.
     * Checks for uniqueness violations before saving.
     * @throws HttpException 404 when the user does not exist
     * @throws HttpException 400 on email / username conflict
     */
    async updateUser(id: string, data: AdminUpdateUserDTO): Promise<IUser> {
        const existing = await userRepository.getUserById(id);
        if (!existing) throw new HttpException(404, "User not found");

        if (data.email && data.email !== existing.email) {
            const conflict = await userRepository.getUserByEmail(data.email);
            if (conflict) throw new HttpException(400, "Email already exists");
        }

        if (data.username && data.username !== existing.username) {
            const conflict = await userRepository.getUserByUsername(data.username);
            if (conflict) throw new HttpException(400, "Username already exists");
        }

        const updated = await userRepository.update(id, data);
        if (!updated) throw new HttpException(500, "Failed to update user");
        return updated;
    }

    /**
     * Permanently removes a user from the database.
     * @throws HttpException 404 when the user does not exist
     */
    async deleteUser(id: string): Promise<void> {
        const deleted = await userRepository.delete(id);
        if (!deleted) throw new HttpException(404, "User not found");
    }
}
