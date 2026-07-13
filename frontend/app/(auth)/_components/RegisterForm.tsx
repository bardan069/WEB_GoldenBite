"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { registerSchema, RegisterFormData } from "./schema";
import PasswordInput from "@/app/_components/PasswordInput";
import { handleRegisterUser } from "@/lib/actions/auth-action";
import { toast } from "react-toastify";

export default function RegisterForm() {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<RegisterFormData>();

    const onSubmit = async (data: RegisterFormData) => {
        setIsSubmitting(true);
        try {
            const parsed = registerSchema.safeParse(data);
            if (!parsed.success) {
                toast.error("Please fix the form errors");
                setIsSubmitting(false);
                return;
            }

            const result = await handleRegisterUser(parsed.data);
            if (result.success) {
                toast.success(result.message || "Registration successful!");
                router.push("/login");
            } else {
                toast.error(result.message || "Registration failed");
            }
        } catch (error: unknown) {
            toast.error(error instanceof Error ? error.message : "Registration failed");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
            <form className="space-y-5" noValidate onSubmit={handleSubmit(onSubmit)}>
                <div className="grid gap-5 sm:grid-cols-2">
                    <div className="space-y-2">
                        <label htmlFor="firstName" className="block text-sm font-medium text-text-secondary">
                            First Name
                        </label>
                        <input
                            id="firstName"
                            type="text"
                            {...register("firstName", { required: "First name is required" })}
                            placeholder="First name"
                            className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-text-primary placeholder:text-text-muted transition-colors focus:border-brand focus:ring-2 focus:ring-brand/20"
                        />
                        {errors.firstName && <p className="text-xs text-red-400">{errors.firstName.message}</p>}
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="lastName" className="block text-sm font-medium text-text-secondary">
                            Last Name
                        </label>
                        <input
                            id="lastName"
                            type="text"
                            {...register("lastName", { required: "Last name is required" })}
                            placeholder="Last name"
                            className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-text-primary placeholder:text-text-muted transition-colors focus:border-brand focus:ring-2 focus:ring-brand/20"
                        />
                        {errors.lastName && <p className="text-xs text-red-400">{errors.lastName.message}</p>}
                    </div>
                </div>

                <div className="space-y-2">
                    <label htmlFor="username" className="block text-sm font-medium text-text-secondary">
                        Username
                    </label>
                    <input
                        id="username"
                        type="text"
                        {...register("username", { required: "Username is required" })}
                        placeholder="Choose a username"
                        className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-text-primary placeholder:text-text-muted transition-colors focus:border-brand focus:ring-2 focus:ring-brand/20"
                    />
                    {errors.username && <p className="text-xs text-red-400">{errors.username.message}</p>}
                </div>

                <div className="space-y-2">
                    <label htmlFor="email" className="block text-sm font-medium text-text-secondary">
                        Email
                    </label>
                    <input
                        id="email"
                        type="email"
                        {...register("email", { required: "Email is required" })}
                        placeholder="you@example.com"
                        className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-text-primary placeholder:text-text-muted transition-colors focus:border-brand focus:ring-2 focus:ring-brand/20"
                    />
                    {errors.email && <p className="text-xs text-red-400">{errors.email.message}</p>}
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                    <div className="space-y-2">
                        <label htmlFor="password" className="block text-sm font-medium text-text-secondary">
                            Password
                        </label>
                        <PasswordInput
                            id="password"
                            {...register("password", { required: "Password is required" })}
                            placeholder="Create a password"
                            className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-text-primary placeholder:text-text-muted transition-colors focus:border-brand focus:ring-2 focus:ring-brand/20"
                        />
                        {errors.password && <p className="text-xs text-red-400">{errors.password.message}</p>}
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="confirmPassword" className="block text-sm font-medium text-text-secondary">
                            Confirm Password
                        </label>
                        <PasswordInput
                            id="confirmPassword"
                            {...register("confirmPassword", { required: "Please confirm your password" })}
                            placeholder="Repeat your password"
                            className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-text-primary placeholder:text-text-muted transition-colors focus:border-brand focus:ring-2 focus:ring-brand/20"
                        />
                        {errors.confirmPassword && <p className="text-xs text-red-400">{errors.confirmPassword.message}</p>}
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full rounded-xl bg-gradient-to-r from-brand to-brand-dark px-5 py-3 text-base font-semibold text-white shadow-lg shadow-brand/25 transition-all hover:shadow-xl hover:shadow-brand/30 hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70"
                >
                    {isSubmitting ? "Creating account..." : "Create Account"}
                </button>
            </form>

            <p className="mt-6 text-center text-sm text-text-muted">
                Already have an account?{" "}
                <Link href="/login" className="font-semibold text-brand hover:text-brand-light transition-colors">
                    Sign In
                </Link>
            </p>
        </>
    );
}
