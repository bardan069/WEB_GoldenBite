import mongoose, { Schema, Document } from "mongoose";

export type UserRole = "user" | "admin";

export interface UserType {
  name: string;
  email: string;
  password: string;
  role: UserRole;
}

export interface RegisterUserDto {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface LoginUserDto {
  email: string;
  password: string;
}

export interface IUser extends UserType, Document {
  _id: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const UserMongoSchema: Schema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["user", "admin"], default: "user" },
  },
  { timestamps: true }
);

export const UserModel =
  (mongoose.models.User as mongoose.Model<IUser>) || mongoose.model<IUser>("User", UserMongoSchema);
