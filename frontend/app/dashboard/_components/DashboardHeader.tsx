"use client";

import Link from "next/link";
import { useAuth } from "@/lib/contexts/AuthContext";
import { usePathname } from "next/navigation";

const navLinks = [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/dashboard/profile", label: "Profile" },
    { href: "/dashboard/password", label: "Password" },
];

export default function DashboardHeader() {
    const { user, logout } = useAuth();
    const pathname = usePathname();

    const getInitials = () => {
        if (user?.firstName && user?.lastName) {
            return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
        }
        return user?.username?.[0]?.toUpperCase() || "U";
    };

    return (
        <header className="glass rounded-2xl px-6 py-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand to-brand-dark text-sm font-bold text-white shadow-lg shadow-brand/25">
                        GB
                    </div>
                    <span className="text-lg font-bold text-text-primary">Golden Bite</span>
                </div>

                <nav className="flex items-center gap-1">
                    {navLinks.map((link) => {
                        const isActive = pathname === link.href;
                        return (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                                    isActive
                                        ? "bg-brand/10 text-brand"
                                        : "text-text-secondary hover:bg-surface-hover hover:text-text-primary"
                                }`}
                            >
                                {link.label}
                            </Link>
                        );
                    })}
                </nav>

                <div className="flex items-center gap-3">
                    {user && (
                        <div className="flex items-center gap-2.5">
                            {user.profileImage ? (
                                <img
                                    src={user.profileImage}
                                    alt="Avatar"
                                    className="h-8 w-8 rounded-full object-cover ring-2 ring-border"
                                />
                            ) : (
                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-surface-elevated text-xs font-bold text-brand ring-2 ring-border">
                                    {getInitials()}
                                </div>
                            )}
                            <span className="hidden text-sm font-medium text-text-secondary sm:block">
                                {user.firstName || user.username || user.email}
                            </span>
                        </div>
                    )}
                    <button
                        onClick={logout}
                        className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-2 text-sm font-medium text-red-400 transition-all hover:bg-red-500/20 hover:text-red-300"
                    >
                        Logout
                    </button>
                </div>
            </div>
        </header>
    );
}
