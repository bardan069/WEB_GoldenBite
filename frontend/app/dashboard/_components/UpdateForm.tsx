"use client";

import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { updateProfileSchema, UpdateProfileFormData } from "./schema";
import { handleUpdateProfile } from "@/lib/actions/auth-action";
import { useAuth } from "@/lib/contexts/AuthContext";
import { toast } from "react-toastify";

export default function UpdateForm() {
    const { user, loading, checkAuth } = useAuth();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<UpdateProfileFormData>();

    useEffect(() => {
        // Syncs the form (and image preview) with the auth context's user
        // object once it loads — an external-system sync, not derived render state.
        if (user) {
            reset({
                firstName: user.firstName || "",
                lastName: user.lastName || "",
                email: user.email || "",
                username: user.username || "",
                dateOfBirth: user.dateOfBirth ? String(user.dateOfBirth).slice(0, 10) : "",
            });
            if (user.profileImage) {
                // eslint-disable-next-line react-hooks/set-state-in-effect
                setPreview(user.profileImage);
            }
        }
    }, [user, reset]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null;
        setSelectedFile(file);
        if (file) {
            setPreview(URL.createObjectURL(file));
        }
    };

    const onSubmit = async (data: UpdateProfileFormData) => {
        setIsSubmitting(true);
        try {
            const dataWithFile = { ...data, image: selectedFile || undefined };
            const parsed = updateProfileSchema.safeParse(dataWithFile);
            if (!parsed.success) {
                toast.error("Please fix the form errors");
                setIsSubmitting(false);
                return;
            }

            const formData = new FormData();
            formData.append("firstName", parsed.data.firstName);
            formData.append("lastName", parsed.data.lastName);
            formData.append("email", parsed.data.email);
            formData.append("username", parsed.data.username);
            if (parsed.data.dateOfBirth) {
                formData.append("dateOfBirth", parsed.data.dateOfBirth);
            }
            if (selectedFile) {
                formData.append("profileImage", selectedFile);
            }

            const result = await handleUpdateProfile(formData);
            if (result.success) {
                toast.success(result.message || "Profile updated!");
                await checkAuth();
            } else {
                toast.error(result.message || "Failed to update profile");
            }
        } catch (error: unknown) {
            toast.error(error instanceof Error ? error.message : "Failed to update profile");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="glass rounded-2xl p-8">
                <div className="flex items-center gap-3">
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-brand border-t-transparent" />
                    <p className="text-sm text-text-muted">Loading profile...</p>
                </div>
            </div>
        );
    }

    const getInitials = () => {
        if (user?.firstName && user?.lastName) {
            return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
        }
        return user?.username?.[0]?.toUpperCase() || "U";
    };

    return (
        <div className="glass rounded-2xl p-6 sm:p-8">
            <form className="space-y-6" noValidate onSubmit={handleSubmit(onSubmit)}>
                {/* Avatar section */}
                <div className="flex items-center gap-5 pb-6 border-b border-border">
                    <div className="relative group">
                        {preview ? (
                            // next/image can't optimize blob: URLs from the local file picker
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                                src={preview}
                                alt="Profile preview"
                                className="h-20 w-20 rounded-2xl object-cover ring-2 ring-border"
                            />
                        ) : (
                            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-surface-elevated text-2xl font-bold text-brand ring-2 ring-border">
                                {getInitials()}
                            </div>
                        )}
                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-lg bg-brand text-white shadow-lg shadow-brand/30 transition-transform hover:scale-110"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-3.5 w-3.5"><path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125" /></svg>
                        </button>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            onChange={handleFileChange}
                            className="hidden"
                        />
                    </div>
                    <div>
                        <p className="font-semibold text-text-primary">{user?.firstName} {user?.lastName}</p>
                        <p className="text-sm text-text-muted">@{user?.username}</p>
                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="mt-1 text-xs font-medium text-brand hover:text-brand-light transition-colors"
                        >
                            Change photo
                        </button>
                    </div>
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                    <div className="space-y-2">
                        <label htmlFor="firstName" className="block text-sm font-medium text-text-secondary">First Name</label>
                        <input
                            id="firstName"
                            type="text"
                            {...register("firstName")}
                            className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-text-primary transition-colors focus:border-brand focus:ring-2 focus:ring-brand/20"
                        />
                        {errors.firstName && <p className="text-xs text-red-400">{errors.firstName.message}</p>}
                    </div>
                    <div className="space-y-2">
                        <label htmlFor="lastName" className="block text-sm font-medium text-text-secondary">Last Name</label>
                        <input
                            id="lastName"
                            type="text"
                            {...register("lastName")}
                            className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-text-primary transition-colors focus:border-brand focus:ring-2 focus:ring-brand/20"
                        />
                        {errors.lastName && <p className="text-xs text-red-400">{errors.lastName.message}</p>}
                    </div>
                </div>

                <div className="space-y-2">
                    <label htmlFor="email" className="block text-sm font-medium text-text-secondary">Email</label>
                    <input
                        id="email"
                        type="email"
                        {...register("email")}
                        className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-text-primary transition-colors focus:border-brand focus:ring-2 focus:ring-brand/20"
                    />
                    {errors.email && <p className="text-xs text-red-400">{errors.email.message}</p>}
                </div>

                <div className="space-y-2">
                    <label htmlFor="username" className="block text-sm font-medium text-text-secondary">Username</label>
                    <input
                        id="username"
                        type="text"
                        {...register("username")}
                        className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-text-primary transition-colors focus:border-brand focus:ring-2 focus:ring-brand/20"
                    />
                    {errors.username && <p className="text-xs text-red-400">{errors.username.message}</p>}
                </div>

                <div className="space-y-2">
                    <label htmlFor="dateOfBirth" className="block text-sm font-medium text-text-secondary">Date of Birth</label>
                    <input
                        id="dateOfBirth"
                        type="date"
                        {...register("dateOfBirth")}
                        className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-text-primary transition-colors focus:border-brand focus:ring-2 focus:ring-brand/20"
                    />
                    <p className="text-xs text-text-muted">Used to personalise your daily diet targets.</p>
                    {errors.dateOfBirth && <p className="text-xs text-red-400">{errors.dateOfBirth.message}</p>}
                </div>

                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full rounded-xl bg-gradient-to-r from-brand to-brand-dark px-5 py-3 text-base font-semibold text-white shadow-lg shadow-brand/25 transition-all hover:shadow-xl hover:shadow-brand/30 hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70"
                >
                    {isSubmitting ? (
                        <span className="flex items-center justify-center gap-2">
                            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                            Updating...
                        </span>
                    ) : (
                        "Update Profile"
                    )}
                </button>
            </form>
        </div>
    );
}
