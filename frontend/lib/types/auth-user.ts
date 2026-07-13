export interface AuthUser {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    username: string;
    role: "admin" | "user";
    profileImage?: string;
    dateOfBirth?: string;
}
