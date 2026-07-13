import { UserModel, IUser } from "../models/user.model";

export interface IUserRepository {
    getUserByEmail(email: string): Promise<IUser | null>;
    getUserByUsername(username: string): Promise<IUser | null>;
    createUser(user: Partial<IUser>): Promise<IUser>;
    getUserById(id: string): Promise<IUser | null>;
    getAll(): Promise<IUser[]>;
    getUsersWithPagination(skip: number, limit: number, search?: string): Promise<IUser[]>;
    countUsers(search?: string): Promise<number>;
    update(id: string, user: Partial<IUser>): Promise<IUser | null>;
    delete(id: string): Promise<boolean>;
}

export class UserMongoRepository implements IUserRepository {
    async getUserById(id: string): Promise<IUser | null> {
        return UserModel.findOne({ _id: id });
    }

    async getUserByEmail(email: string): Promise<IUser | null> {
        return UserModel.findOne({ email });
    }

    async getUserByUsername(username: string): Promise<IUser | null> {
        return UserModel.findOne({ username });
    }

    async createUser(user: Partial<IUser>): Promise<IUser> {
        return UserModel.create(user);
    }

    async getAll(): Promise<IUser[]> {
        return UserModel.find();
    }

    /** Returns a paginated, optionally-searched slice of users. */
    async getUsersWithPagination(skip: number, limit: number, search?: string): Promise<IUser[]> {
        const filter = this._buildSearchFilter(search);
        return UserModel.find(filter).skip(skip).limit(limit).sort({ createdAt: -1 }).select("-password");
    }

    /** Counts total documents matching an optional search term. */
    async countUsers(search?: string): Promise<number> {
        const filter = this._buildSearchFilter(search);
        return UserModel.countDocuments(filter);
    }

    async update(id: string, user: Partial<IUser>): Promise<IUser | null> {
        return UserModel.findByIdAndUpdate(id, user, { new: true });
    }

    async delete(id: string): Promise<boolean> {
        const deleted = await UserModel.findByIdAndDelete(id);
        return !!deleted;
    }

    private _buildSearchFilter(search?: string): Record<string, unknown> {
        if (!search) return {};
        const regex = new RegExp(search, "i");
        return { $or: [{ firstName: regex }, { lastName: regex }, { email: regex }, { username: regex }] };
    }
}
