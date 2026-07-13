"use client";

import { useEffect, useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import {
    handleGetAdminUsers,
    handleAdminCreateUser,
    handleAdminUpdateUser,
    handleAdminDeleteUser,
} from "@/lib/actions/admin-action";
import PasswordInput from "@/app/_components/PasswordInput";

/* ---------- Types ---------- */
interface User {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    username: string;
    role: "admin" | "user";
    createdAt: string;
}

interface PaginationMeta {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

type ModalMode = "create" | "edit" | "delete" | null;

/* ---------- Form schemas (inline, no extra dep needed) ---------- */
interface UserFormValues {
    firstName: string;
    lastName: string;
    email: string;
    username: string;
    password?: string;
    role: "admin" | "user";
}

/* ---------- Helpers ---------- */
function useDebounce<T>(value: T, delay: number): T {
    const [debounced, setDebounced] = useState(value);
    useEffect(() => {
        const t = setTimeout(() => setDebounced(value), delay);
        return () => clearTimeout(t);
    }, [value, delay]);
    return debounced;
}

function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
}

/* ---------- Component ---------- */
export default function AdminUsersPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [meta, setMeta] = useState<PaginationMeta>({ page: 1, limit: 10, total: 0, totalPages: 1 });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const debouncedSearch = useDebounce(search, 400);

    const [modalMode, setModalMode] = useState<ModalMode>(null);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [submitting, setSubmitting] = useState(false);

    const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<UserFormValues>({
        defaultValues: { role: "user" },
    });

    /* ---------- Fetch ---------- */
    const fetchUsers = useCallback(async () => {
        setLoading(true);
        setError(null);
        const result = await handleGetAdminUsers({ page, limit: 10, search: debouncedSearch || undefined });
        setLoading(false);
        if (result.success && result.data) {
            setUsers(result.data.data);
            setMeta(result.data.meta);
        } else {
            setError(result.message || "Failed to load users");
        }
    }, [page, debouncedSearch]);

    useEffect(() => {
        // Resets to page 1 whenever the debounced search term changes.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setPage(1);
    }, [debouncedSearch]);

    useEffect(() => {
        // Standard mount/refetch-on-change data-fetching effect.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        fetchUsers();
    }, [fetchUsers]);

    /* ---------- Modal helpers ---------- */
    const openCreate = () => {
        reset({ firstName: "", lastName: "", email: "", username: "", password: "", role: "user" });
        setSelectedUser(null);
        setModalMode("create");
    };

    const openEdit = (user: User) => {
        setSelectedUser(user);
        setValue("firstName", user.firstName);
        setValue("lastName", user.lastName);
        setValue("email", user.email);
        setValue("username", user.username);
        setValue("role", user.role);
        setValue("password", "");
        setModalMode("edit");
    };

    const openDelete = (user: User) => {
        setSelectedUser(user);
        setModalMode("delete");
    };

    const closeModal = () => {
        setModalMode(null);
        setSelectedUser(null);
        reset();
    };

    /* ---------- Submit handlers ---------- */
    const onSubmitCreate = async (data: UserFormValues) => {
        if (!data.password || data.password.length < 6) {
            toast.error("Password must be at least 6 characters");
            return;
        }
        setSubmitting(true);
        const result = await handleAdminCreateUser(data as Required<UserFormValues> & { role: "admin" | "user" });
        setSubmitting(false);
        if (result.success) {
            toast.success(result.message || "User created");
            closeModal();
            fetchUsers();
        } else {
            toast.error(result.message || "Failed to create user");
        }
    };

    const onSubmitEdit = async (data: UserFormValues) => {
        if (!selectedUser) return;
        setSubmitting(true);
        const payload: { firstName?: string; lastName?: string; email?: string; username?: string; role?: "admin" | "user" } = {};
        if (data.firstName) payload.firstName = data.firstName;
        if (data.lastName) payload.lastName = data.lastName;
        if (data.email) payload.email = data.email;
        if (data.username) payload.username = data.username;
        if (data.role) payload.role = data.role;
        const result = await handleAdminUpdateUser(selectedUser._id, payload);
        setSubmitting(false);
        if (result.success) {
            toast.success(result.message || "User updated");
            closeModal();
            fetchUsers();
        } else {
            toast.error(result.message || "Failed to update user");
        }
    };

    const onConfirmDelete = async () => {
        if (!selectedUser) return;
        setSubmitting(true);
        const result = await handleAdminDeleteUser(selectedUser._id);
        setSubmitting(false);
        if (result.success) {
            toast.success(result.message || "User deleted");
            closeModal();
            fetchUsers();
        } else {
            toast.error(result.message || "Failed to delete user");
        }
    };

    /* ---------- Render ---------- */
    return (
        <section className="py-8">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <p className="mb-2 text-xs font-bold uppercase tracking-[1.5px] text-brand">Admin</p>
                    <h1 className="text-4xl font-bold text-text-primary">
                        User <span className="gradient-text">Management</span>
                    </h1>
                    <p className="mt-2 text-text-secondary">
                        {meta.total} total {meta.total === 1 ? "user" : "users"}
                    </p>
                </div>
                <button
                    onClick={openCreate}
                    className="self-start rounded-xl bg-brand px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-brand/25 transition hover:bg-brand-dark sm:self-auto"
                >
                    + Add User
                </button>
            </div>

            {/* Search */}
            <div className="mt-6">
                <input
                    type="text"
                    placeholder="Search by name or email..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm text-text-primary placeholder-text-muted outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 sm:max-w-xs"
                />
            </div>

            {/* Table */}
            <div className="glass mt-6 overflow-hidden rounded-2xl">
                <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                        <thead>
                            <tr className="border-b border-border">
                                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-widest text-text-muted">ID</th>
                                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-widest text-text-muted">Name</th>
                                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-widest text-text-muted">Email</th>
                                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-widest text-text-muted">Role</th>
                                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-widest text-text-muted">Joined</th>
                                <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-widest text-text-muted">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-16 text-center text-text-muted">
                                        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-brand border-t-transparent" />
                                    </td>
                                </tr>
                            ) : error ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-16 text-center text-red-400">{error}</td>
                                </tr>
                            ) : users.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-16 text-center text-text-muted">
                                        {debouncedSearch ? "No users match your search." : "No users found."}
                                    </td>
                                </tr>
                            ) : (
                                users.map((user) => (
                                    <tr key={user._id} className="border-b border-border/50 transition hover:bg-surface-hover">
                                        <td className="px-6 py-4 font-mono text-xs text-text-muted">{user._id.slice(-8)}</td>
                                        <td className="px-6 py-4 font-medium text-text-primary">
                                            {user.firstName} {user.lastName}
                                        </td>
                                        <td className="px-6 py-4 text-text-secondary">{user.email}</td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                                                user.role === "admin"
                                                    ? "bg-brand/15 text-brand"
                                                    : "bg-surface-elevated text-text-secondary"
                                            }`}>
                                                {user.role}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-text-muted">{formatDate(user.createdAt)}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => openEdit(user)}
                                                    className="rounded-lg border border-border bg-surface-elevated px-3 py-1.5 text-xs font-medium text-text-secondary transition hover:border-brand/40 hover:text-brand"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => openDelete(user)}
                                                    className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-1.5 text-xs font-medium text-red-400 transition hover:bg-red-500/20"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {!loading && !error && meta.totalPages > 1 && (
                    <div className="flex items-center justify-between border-t border-border px-6 py-4">
                        <p className="text-xs text-text-muted">
                            Page {meta.page} of {meta.totalPages} &middot; {meta.total} users
                        </p>
                        <div className="flex gap-2">
                            <button
                                disabled={page <= 1}
                                onClick={() => setPage((p) => p - 1)}
                                className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-text-secondary transition hover:border-brand/40 hover:text-brand disabled:pointer-events-none disabled:opacity-40"
                            >
                                Previous
                            </button>
                            <button
                                disabled={page >= meta.totalPages}
                                onClick={() => setPage((p) => p + 1)}
                                className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-text-secondary transition hover:border-brand/40 hover:text-brand disabled:pointer-events-none disabled:opacity-40"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* ===== Create / Edit Modal ===== */}
            {(modalMode === "create" || modalMode === "edit") && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
                    <div className="glass w-full max-w-md rounded-2xl p-6 shadow-2xl">
                        <h2 className="mb-6 text-xl font-bold text-text-primary">
                            {modalMode === "create" ? "Create User" : "Edit User"}
                        </h2>
                        <form
                            onSubmit={handleSubmit(modalMode === "create" ? onSubmitCreate : onSubmitEdit)}
                            className="space-y-4"
                        >
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="mb-1 block text-xs font-medium text-text-secondary">First Name</label>
                                    <input
                                        type="text"
                                        {...register("firstName", { required: "Required", minLength: { value: 2, message: "Min 2 chars" } })}
                                        className="w-full rounded-xl border border-border bg-surface px-3 py-2.5 text-sm text-text-primary outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
                                    />
                                    {errors.firstName && <p className="mt-1 text-xs text-red-400">{errors.firstName.message}</p>}
                                </div>
                                <div>
                                    <label className="mb-1 block text-xs font-medium text-text-secondary">Last Name</label>
                                    <input
                                        type="text"
                                        {...register("lastName", { required: "Required", minLength: { value: 2, message: "Min 2 chars" } })}
                                        className="w-full rounded-xl border border-border bg-surface px-3 py-2.5 text-sm text-text-primary outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
                                    />
                                    {errors.lastName && <p className="mt-1 text-xs text-red-400">{errors.lastName.message}</p>}
                                </div>
                            </div>
                            <div>
                                <label className="mb-1 block text-xs font-medium text-text-secondary">Email</label>
                                <input
                                    type="email"
                                    {...register("email", { required: "Required", pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: "Invalid email" } })}
                                    className="w-full rounded-xl border border-border bg-surface px-3 py-2.5 text-sm text-text-primary outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
                                />
                                {errors.email && <p className="mt-1 text-xs text-red-400">{errors.email.message}</p>}
                            </div>
                            <div>
                                <label className="mb-1 block text-xs font-medium text-text-secondary">Username</label>
                                <input
                                    type="text"
                                    {...register("username", { required: "Required", minLength: { value: 3, message: "Min 3 chars" } })}
                                    className="w-full rounded-xl border border-border bg-surface px-3 py-2.5 text-sm text-text-primary outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
                                />
                                {errors.username && <p className="mt-1 text-xs text-red-400">{errors.username.message}</p>}
                            </div>
                            {modalMode === "create" && (
                                <div>
                                    <label className="mb-1 block text-xs font-medium text-text-secondary">Password</label>
                                    <PasswordInput
                                        {...register("password", { required: "Required", minLength: { value: 6, message: "Min 6 chars" } })}
                                        className="w-full rounded-xl border border-border bg-surface px-3 py-2.5 text-sm text-text-primary outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
                                    />
                                    {errors.password && <p className="mt-1 text-xs text-red-400">{errors.password.message}</p>}
                                </div>
                            )}
                            <div>
                                <label className="mb-1 block text-xs font-medium text-text-secondary">Role</label>
                                <select
                                    {...register("role")}
                                    className="w-full rounded-xl border border-border bg-surface px-3 py-2.5 text-sm text-text-primary outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
                                >
                                    <option value="user">User</option>
                                    <option value="admin">Admin</option>
                                </select>
                            </div>
                            <div className="flex justify-end gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="rounded-xl border border-border px-4 py-2 text-sm font-medium text-text-secondary transition hover:bg-surface-hover"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="rounded-xl bg-brand px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-brand/25 transition hover:bg-brand-dark disabled:opacity-60"
                                >
                                    {submitting ? "Saving…" : modalMode === "create" ? "Create" : "Save"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ===== Delete Confirmation Modal ===== */}
            {modalMode === "delete" && selectedUser && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
                    <div className="glass w-full max-w-sm rounded-2xl p-6 shadow-2xl">
                        <h2 className="mb-2 text-xl font-bold text-text-primary">Delete User</h2>
                        <p className="mb-6 text-sm text-text-secondary">
                            Are you sure you want to permanently delete{" "}
                            <span className="font-semibold text-text-primary">
                                {selectedUser.firstName} {selectedUser.lastName}
                            </span>
                            ? This action cannot be undone.
                        </p>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={closeModal}
                                className="rounded-xl border border-border px-4 py-2 text-sm font-medium text-text-secondary transition hover:bg-surface-hover"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={onConfirmDelete}
                                disabled={submitting}
                                className="rounded-xl bg-red-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-60"
                            >
                                {submitting ? "Deleting…" : "Delete"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
}
