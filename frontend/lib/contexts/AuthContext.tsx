"use client";

import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { clearAuthCookies, getTokenCookie, getUserData } from "../cookies";
import { useRouter } from "next/navigation";
import { AuthUser } from "../types/auth-user";

interface AuthContextProps {
    isAuthenticated: boolean;
    setIsAuthenticated: (value: boolean) => void;
    user: AuthUser | null;
    setUser: (user: AuthUser | null) => void;
    logout: () => Promise<void>;
    loading: boolean;
    checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState<AuthUser | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    const checkAuth = async () => {
        try {
            const token = await getTokenCookie();
            const user = await getUserData();
            setUser(user);
            setIsAuthenticated(!!token);
        } catch {
            setIsAuthenticated(false);
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // Standard mount-time auth check (React's documented "fetching data
        // in an Effect" pattern) — checkAuth reads cookies asynchronously
        // before updating state, it isn't a synchronous render-time setState.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        checkAuth();
    }, []);

    const logout = async () => {
        try {
            await clearAuthCookies();
            setIsAuthenticated(false);
            setUser(null);
            router.push("/login");
        } catch (error) {
            console.error("Logout failed:", error);
        }
    };

    return (
        <AuthContext.Provider
            value={{ isAuthenticated, setIsAuthenticated, user, setUser, logout, loading, checkAuth }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};
