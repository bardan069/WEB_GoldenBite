"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { loginSchema, LoginFormData } from "./schema";
import PasswordInput from "@/app/_components/PasswordInput";
import { handleLoginUser } from "@/lib/actions/auth-action";
import { useAuth } from "@/lib/contexts/AuthContext";
import { toast } from "react-toastify";

export default function LoginForm() {
    const router = useRouter();
    const { checkAuth } = useAuth();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginFormData>();

    const onSubmit = async (data: LoginFormData) => {
        setIsSubmitting(true);
        try {
            const parsed = loginSchema.safeParse(data);
            if (!parsed.success) {
                toast.error("Please fix the form errors");
                setIsSubmitting(false);
                return;
            }

            const result = await handleLoginUser(parsed.data);
            if (result.success) {
                toast.success(result.message || "Login successful!");
                await checkAuth();
                router.push("/dashboard");
            } else {
                toast.error(result.message || "Login failed");
            }
        } catch (error: unknown) {
            toast.error(error instanceof Error ? error.message : "Login failed");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
            <form className="space-y-5" noValidate onSubmit={handleSubmit(onSubmit)}>
                <div className="space-y-2">
                    <label htmlFor="email" className="block text-sm font-medium text-text-secondary">
                        Email
                    </label>
                    <input
                        id="email"
                        type="email"
                        {...register("email", { required: "Email is required" })}
                        placeholder="Enter your email"
                        className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-text-primary placeholder:text-text-muted transition-colors focus:border-brand focus:ring-2 focus:ring-brand/20"
                    />
                    {errors.email && <p className="text-xs text-red-400">{errors.email.message}</p>}
                </div>

                <div className="space-y-2">
                    <label htmlFor="password" className="block text-sm font-medium text-text-secondary">
                        Password
                    </label>
                    <PasswordInput
                        id="password"
                        {...register("password", { required: "Password is required" })}
                        placeholder="Enter your password"
                        className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-text-primary placeholder:text-text-muted transition-colors focus:border-brand focus:ring-2 focus:ring-brand/20"
                    />
                    {errors.password && <p className="text-xs text-red-400">{errors.password.message}</p>}
                </div>

                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full rounded-xl bg-gradient-to-r from-brand to-brand-dark px-5 py-3 text-base font-semibold text-white shadow-lg shadow-brand/25 transition-all hover:shadow-xl hover:shadow-brand/30 hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70"
                >
                    {isSubmitting ? "Signing in..." : "Sign In"}
                </button>
            </form>

            <p className="mt-6 text-center text-sm text-text-muted">
                Don&apos;t have an account?{" "}
                <Link href="/register" className="font-semibold text-brand hover:text-brand-light transition-colors">
                    Create Account
                </Link>
            </p>
        </>
    );
}
