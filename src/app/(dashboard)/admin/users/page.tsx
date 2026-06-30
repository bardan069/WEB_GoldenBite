"use client";

import { useState, useEffect, useCallback } from "react";

// ── Types ──────────────────────────────────────────────────────────────────────

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

interface Meta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface UserFormData {
  name: string;
  email: string;
  password: string;
  role: string;
}

// ── API helpers ────────────────────────────────────────────────────────────────

async function api<T>(url: string, opts?: RequestInit): Promise<T> {
  const res = await fetch(url, { credentials: "include", ...opts });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error ?? "Request failed");
  return json;
}

// ── Validation ─────────────────────────────────────────────────────────────────

function validateForm(data: UserFormData, isEdit: boolean): Record<string, string> {
  const errors: Record<string, string> = {};
  if (data.name.trim().length < 3) errors.name = "Name must be at least 3 characters.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) errors.email = "Please enter a valid email.";
  if (!isEdit && data.password.length < 8) errors.password = "Password must be at least 8 characters.";
  if (isEdit && data.password && data.password.length < 8) errors.password = "Password must be at least 8 characters.";
  return errors;
}

// ── Sub-components ─────────────────────────────────────────────────────────────

function SearchBar({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <input
      type="text"
      placeholder="Search by name or email..."
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/20 sm:w-80"
    />
  );
}

function Pagination({ meta, onPageChange }: { meta: Meta; onPageChange: (p: number) => void }) {
  if (meta.totalPages <= 1) return null;

  const pages: number[] = [];
  const start = Math.max(1, meta.page - 2);
  const end = Math.min(meta.totalPages, meta.page + 2);
  for (let i = start; i <= end; i++) pages.push(i);

  return (
    <div className="flex items-center justify-between border-t border-slate-200 px-1 pt-4">
      <p className="text-sm text-slate-500">
        Showing {(meta.page - 1) * meta.limit + 1}–{Math.min(meta.page * meta.limit, meta.total)} of {meta.total}
      </p>
      <div className="flex gap-1">
        <button
          onClick={() => onPageChange(meta.page - 1)}
          disabled={meta.page <= 1}
          className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-600 transition hover:bg-slate-50 disabled:opacity-40"
        >
          Prev
        </button>
        {pages.map((p) => (
          <button
            key={p}
            onClick={() => onPageChange(p)}
            className={`rounded-lg px-3 py-1.5 text-sm transition ${
              p === meta.page
                ? "bg-emerald-500 text-white"
                : "border border-slate-200 text-slate-600 hover:bg-slate-50"
            }`}
          >
            {p}
          </button>
        ))}
        <button
          onClick={() => onPageChange(meta.page + 1)}
          disabled={meta.page >= meta.totalPages}
          className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-600 transition hover:bg-slate-50 disabled:opacity-40"
        >
          Next
        </button>
      </div>
    </div>
  );
}

function UserFormModal({
  user,
  onClose,
  onSaved,
}: {
  user: User | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const isEdit = !!user;
  const [form, setForm] = useState<UserFormData>({
    name: user?.name ?? "",
    email: user?.email ?? "",
    password: "",
    role: user?.role ?? "user",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validateForm(form, isEdit);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setSubmitting(true);
    setServerError("");

    try {
      const payload: Record<string, string> = { name: form.name, email: form.email, role: form.role };
      if (form.password) payload.password = form.password;
      if (!isEdit) payload.password = form.password;

      if (isEdit) {
        await api(`/api/v1/admin/users/${user._id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        await api("/api/v1/admin/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }
      onSaved();
    } catch (err) {
      setServerError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  };

  const setField = (field: keyof UserFormData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => {
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div
        className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-semibold text-slate-900">{isEdit ? "Edit User" : "Create User"}</h2>

        {serverError && (
          <div className="mt-3 rounded-xl bg-red-50 px-4 py-2.5 text-sm text-red-700">{serverError}</div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700">Name</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setField("name", e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/20"
            />
            {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">Email</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setField("email", e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/20"
            />
            {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">
              Password{isEdit && <span className="text-slate-400"> (leave blank to keep current)</span>}
            </label>
            <input
              type="password"
              value={form.password}
              onChange={(e) => setField("password", e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/20"
            />
            {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">Role</label>
            <select
              value={form.role}
              onChange={(e) => setField("role", e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/20"
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-600 disabled:opacity-50"
            >
              {submitting ? "Saving..." : isEdit ? "Update" : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function DeleteModal({
  user,
  onClose,
  onDeleted,
}: {
  user: User;
  onClose: () => void;
  onDeleted: () => void;
}) {
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  const handleDelete = async () => {
    setDeleting(true);
    setError("");
    try {
      await api(`/api/v1/admin/users/${user._id}`, { method: "DELETE" });
      onDeleted();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div
        className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-semibold text-slate-900">Delete User</h2>
        <p className="mt-2 text-sm text-slate-600">
          Are you sure you want to delete <span className="font-semibold text-slate-900">{user.name}</span> ({user.email})? This action cannot be undone.
        </p>

        {error && <div className="mt-3 rounded-xl bg-red-50 px-4 py-2.5 text-sm text-red-700">{error}</div>}

        <div className="mt-5 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-50"
          >
            {deleting ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────────

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [meta, setMeta] = useState<Meta>({ page: 1, limit: 10, total: 0, totalPages: 0 });
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [formUser, setFormUser] = useState<User | null | "new">(null);
  const [deleteUser, setDeleteUser] = useState<User | null>(null);

  const fetchUsers = useCallback(async (page: number, searchTerm: string) => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams({ page: String(page), limit: "10" });
      if (searchTerm) params.set("search", searchTerm);
      const json = await api<{ data: User[]; meta: Meta }>(`/api/v1/admin/users?${params}`);
      setUsers(json.data);
      setMeta(json.meta);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load users.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers(meta.page, search);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => {
      fetchUsers(1, search);
    }, 400);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const handlePageChange = (page: number) => {
    fetchUsers(page, search);
  };

  const handleSaved = () => {
    setFormUser(null);
    fetchUsers(meta.page, search);
  };

  const handleDeleted = () => {
    setDeleteUser(null);
    fetchUsers(meta.page, search);
  };

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-6xl px-6 py-10">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">User Management</h1>
            <p className="mt-1 text-sm text-slate-500">Manage all registered users from one place.</p>
          </div>
          <button
            onClick={() => setFormUser("new")}
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-600"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Add User
          </button>
        </div>

        {/* Search */}
        <div className="mt-6">
          <SearchBar value={search} onChange={setSearch} />
        </div>

        {/* Content */}
        <div className="mt-6 rounded-2xl border border-slate-200 bg-white shadow-sm">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" />
              <span className="ml-3 text-sm text-slate-500">Loading users...</span>
            </div>
          ) : error ? (
            <div className="px-6 py-20 text-center">
              <p className="text-sm text-red-600">{error}</p>
              <button
                onClick={() => fetchUsers(meta.page, search)}
                className="mt-3 rounded-xl bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-200"
              >
                Retry
              </button>
            </div>
          ) : users.length === 0 ? (
            <div className="px-6 py-20 text-center">
              <p className="text-sm text-slate-500">{search ? "No users match your search." : "No users found."}</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="border-b border-slate-200 bg-slate-50">
                    <tr>
                      <th className="px-6 py-3 font-medium text-slate-500">Name</th>
                      <th className="px-6 py-3 font-medium text-slate-500">Email</th>
                      <th className="px-6 py-3 font-medium text-slate-500">Role</th>
                      <th className="px-6 py-3 font-medium text-slate-500">Created</th>
                      <th className="px-6 py-3 font-medium text-slate-500">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {users.map((u) => (
                      <tr key={u._id} className="transition hover:bg-slate-50">
                        <td className="whitespace-nowrap px-6 py-4 font-medium text-slate-900">{u.name}</td>
                        <td className="whitespace-nowrap px-6 py-4 text-slate-600">{u.email}</td>
                        <td className="whitespace-nowrap px-6 py-4">
                          <span
                            className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                              u.role === "admin"
                                ? "bg-purple-100 text-purple-700"
                                : "bg-slate-100 text-slate-600"
                            }`}
                          >
                            {u.role}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-slate-500">
                          {new Date(u.createdAt).toLocaleDateString()}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4">
                          <div className="flex gap-2">
                            <button
                              onClick={() => setFormUser(u)}
                              className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-slate-50"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => setDeleteUser(u)}
                              className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 transition hover:bg-red-50"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="px-6 py-4">
                <Pagination meta={meta} onPageChange={handlePageChange} />
              </div>
            </>
          )}
        </div>
      </div>

      {/* Modals */}
      {formUser && (
        <UserFormModal
          user={formUser === "new" ? null : formUser}
          onClose={() => setFormUser(null)}
          onSaved={handleSaved}
        />
      )}
      {deleteUser && (
        <DeleteModal user={deleteUser} onClose={() => setDeleteUser(null)} onDeleted={handleDeleted} />
      )}
    </main>
  );
}
