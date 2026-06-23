import { UserMongoRepository } from "../repositories/user.repository";
import { CreateUserDTO, LoginUserDTO, UpdateUserDTO, UpdatePasswordDTO } from "../dtos/user.dto";
import { IUser } from "../models/user.model";
import { HttpException } from "../exceptions/http-exception";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import { SECRET_KEY } from "../configs/constant";

const userRepository = new UserMongoRepository();

export class UserService {
    async createUser(userData: CreateUserDTO): Promise<IUser> {
        const existingEmail = await userRepository.getUserByEmail(userData.email);
        if (existingEmail) {
            throw new HttpException(400, "Email already exists");
        }

        const existingUsername = await userRepository.getUserByUsername(userData.username);
        if (existingUsername) {
            throw new HttpException(400, "Username already exists");
        }

        const hashedPassword = await bcryptjs.hash(userData.password, 10);
        userData.password = hashedPassword;

        const user = await userRepository.createUser(userData);
        return user;
    }

    async loginUser(loginData: LoginUserDTO) {
        const user = await userRepository.getUserByEmail(loginData.email);
        if (!user) {
            throw new HttpException(400, "Invalid email");
        }

        const isPasswordValid = await bcryptjs.compare(
            loginData.password,
            user.password
        );

        if (!isPasswordValid) {
            throw new HttpException(400, "Invalid password");
        }

        const token = jwt.sign(
            { id: user._id, email: user.email, role: user.role },
            SECRET_KEY,
            { expiresIn: "30d" }
        );

        return { user, token };
    }

    async updateUser(id: string, userData: UpdateUserDTO): Promise<IUser> {
        const existingUser = await userRepository.getUserById(id);
        if (!existingUser) {
            throw new HttpException(404, "User not found");
        }

        if (userData.email && userData.email !== existingUser.email) {
            const existingEmail = await userRepository.getUserByEmail(userData.email);
            if (existingEmail) {
                throw new HttpException(400, "Email already exists");
            }
        }

        if (userData.username && userData.username !== existingUser.username) {
            const existingUsername = await userRepository.getUserByUsername(userData.username);
            if (existingUsername) {
                throw new HttpException(400, "Username already exists");
            }
        }

        if (userData.password) {
            const hashedPassword = await bcryptjs.hash(userData.password, 10);
            userData.password = hashedPassword;
        }

        const updatedUser = await userRepository.update(id, userData);
        if (!updatedUser) {
            throw new HttpException(500, "Failed to update user");
        }

        return updatedUser;
    }

    async updatePassword(id: string, passwordData: UpdatePasswordDTO): Promise<IUser> {
        const existingUser = await userRepository.getUserById(id);
        if (!existingUser) {
            throw new HttpException(404, "User not found");
        }

        const isCurrentValid = await bcryptjs.compare(
            passwordData.currentPassword,
            existingUser.password
        );
        if (!isCurrentValid) {
            throw new HttpException(400, "Current password is incorrect");
        }

        const hashedPassword = await bcryptjs.hash(passwordData.newPassword, 10);
        const updatedUser = await userRepository.update(id, { password: hashedPassword });
        if (!updatedUser) {
            throw new HttpException(500, "Failed to update password");
        }

        return updatedUser;
    }
}
