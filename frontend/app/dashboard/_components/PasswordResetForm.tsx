"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { updatePasswordSchema, UpdatePasswordFormData } from "./schema";
import PasswordInput from "@/app/_components/PasswordInput";
import { handleUpdatePassword } from "@/lib/actions/auth-action";
import { toast } from "react-toastify";

export default function PasswordResetForm() {
    const [isSubmitting, setIsSubmitting] = useState(false);

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<UpdatePasswordFormData>();

    const onSubmit = async (data: UpdatePasswordFormData) => {
        setIsSubmitting(true);
        try {
            const parsed = updatePasswordSchema.safeParse(data);
            if (!parsed.success) {
                toast.error("Please fix the form errors");
                setIsSubmitting(false);
                return;
            }

            const result = await handleUpdatePassword(parsed.data);
            if (result.success) {
                toast.success(result.message || "Password updated!");
                reset();
            } else {
                toast.error(result.message || "Failed to update password");
            }
        } catch (error: unknown) {
            toast.error(error instanceof Error ? error.message : "Failed to update password");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="glass rounded-2xl p-6 sm:p-8">
            <div className="flex items-center gap-3 pb-6 border-b border-border mb-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gold/10 text-gold">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5"><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" /></svg>
                </div>
                <div>
                    <p className="font-semibold text-text-primary">Password Settings</p>
                    <p className="text-xs text-text-muted">Update your password to keep your account secure</p>
                </div>
            </div>

            <form className="space-y-5" noValidate onSubmit={handleSubmit(onSubmit)}>
                <div className="space-y-2">
                    <label htmlFor="currentPassword" className="block text-sm font-medium text-text-secondary">
                        Current Password
                    </label>
                    <PasswordInput
                        id="currentPassword"
                        {...register("currentPassword", { required: "Current password is required" })}
                        placeholder="Enter current password"
                        className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-text-primary placeholder:text-text-muted transition-colors focus:border-gold focus:ring-2 focus:ring-gold/20"
                    />
                    {errors.currentPassword && <p className="text-xs text-red-400">{errors.currentPassword.message}</p>}
                </div>

                <div className="space-y-2">
                    <label htmlFor="newPassword" className="block text-sm font-medium text-text-secondary">
                        New Password
                    </label>
                    <PasswordInput
                        id="newPassword"
                        {...register("newPassword", { required: "New password is required" })}
                        placeholder="Enter new password"
                        className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-text-primary placeholder:text-text-muted transition-colors focus:border-gold focus:ring-2 focus:ring-gold/20"
                    />
                    {errors.newPassword && <p className="text-xs text-red-400">{errors.newPassword.message}</p>}
                </div>

                <div className="space-y-2">
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-text-secondary">
                        Confirm New Password
                    </label>
                    <PasswordInput
                        id="confirmPassword"
                        {...register("confirmPassword", { required: "Please confirm your new password" })}
                        placeholder="Repeat new password"
                        className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-text-primary placeholder:text-text-muted transition-colors focus:border-gold focus:ring-2 focus:ring-gold/20"
                    />
                    {errors.confirmPassword && <p className="text-xs text-red-400">{errors.confirmPassword.message}</p>}
                </div>

                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full rounded-xl bg-gradient-to-r from-gold-light to-gold px-5 py-3 text-base font-semibold text-white shadow-lg shadow-gold/25 transition-all hover:shadow-xl hover:shadow-gold/30 hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70"
                >
                    {isSubmitting ? (
                        <span className="flex items-center justify-center gap-2">
                            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                            Updating...
                        </span>
                    ) : (
                        "Change Password"
                    )}
                </button>
            </form>
        </div>
    );
}
