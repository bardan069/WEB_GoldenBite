"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().nonempty("Email is required").email("Please enter a valid email address"),
  password: z.string().nonempty("Password is required").min(8, "Password must contain at least 8 characters."),
});

type LoginForm = z.infer<typeof loginSchema>;

type FieldErrors = Partial<Record<keyof LoginForm | "server", string>>;

export default function Page() {
  const router = useRouter();
  const [registered, setRegistered] = useState(false);
  const [formState, setFormState] = useState<LoginForm>({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState<FieldErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      setRegistered(params.get("registered") === "1");
    }
  }, []);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "", server: "" }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setErrors({});

    const result = loginSchema.safeParse(formState);
    if (!result.success) {
      const fieldErrors: FieldErrors = {};
      Object.entries(result.error.flatten().fieldErrors).forEach(([key, value]) => {
        if (value?.[0]) {
          fieldErrors[key as keyof LoginForm] = value[0];
        }
      });
      setErrors(fieldErrors);
      setIsSubmitting(false);
      return;
    }

    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(result.data),
    });

    const payload = await response.json();
    if (!response.ok) {
      setErrors({ server: payload.error || "Login failed. Please check your credentials." });
      setIsSubmitting(false);
      return;
    }

    router.push("/dashboard");
  };

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(245,158,11,0.16),_transparent_22%),linear-gradient(180deg,#f7ecd6_0%,#fbf6ed_58%,#f6e8cf_100%)] text-slate-950">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <header className="flex flex-wrap items-center justify-between gap-4 rounded-full border border-white/70 bg-white/80 px-5 py-4 shadow-2xl shadow-slate-900/10 backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <img src="/logo.svg" alt="Golden Bite" className="h-11 w-auto" />
          </div>

          <nav className="hidden items-center gap-8 text-sm text-slate-700 md:flex">
            <Link href="/" className="transition hover:text-emerald-700">
              Home
            </Link>
            <Link href="/recipes" className="transition hover:text-emerald-700">
              Recipes
            </Link>
            <Link href="/about" className="transition hover:text-emerald-700">
              About Us
            </Link>
          </nav>

          <Link
            href="/register"
            className="rounded-full bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-500/20 transition hover:bg-emerald-500"
          >
            Get Started
          </Link>
        </header>
      </div>

      <section className="flex min-h-[calc(100vh-100px)] items-center justify-center px-4 py-10 sm:px-6 lg:px-8">
        <div className="w-full max-w-5xl rounded-[2.5rem] border border-white/70 bg-white/90 p-6 shadow-2xl shadow-slate-900/10 backdrop-blur-xl sm:p-10">
          <div className="grid gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
            <div className="space-y-6">
              <p className="text-sm uppercase tracking-[0.35em] text-emerald-600">Welcome Back</p>
              <h1 className="text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
                Sign in to Golden Bite
              </h1>
              <p className="max-w-xl text-sm leading-7 text-slate-600">
                Continue your wellness journey with a simple, clean sign-in experience. Access recipes, meal plans, and healthy inspiration in one place.
              </p>

              <div className="rounded-[2rem] bg-slate-100 p-6 shadow-lg shadow-slate-900/5 sm:p-8">
                <form className="space-y-5" noValidate onSubmit={handleSubmit}>
                  {registered ? (
                    <p className="rounded-3xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                      Registration success! Please sign in with your new account.
                    </p>
                  ) : null}
                  {errors.server ? (
                    <p className="rounded-3xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{errors.server}</p>
                  ) : null}

                  <div className="space-y-2">
                    <label htmlFor="email" className="block text-sm font-medium text-slate-700">
                      Email
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      value={formState.email}
                      onChange={handleChange}
                      placeholder="Enter your email"
                      className="w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/10"
                    />
                    {errors.email ? <p className="text-xs text-rose-600">{errors.email}</p> : null}
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="password" className="block text-sm font-medium text-slate-700">
                      Password
                    </label>
                    <input
                      id="password"
                      name="password"
                      type="password"
                      value={formState.password}
                      onChange={handleChange}
                      placeholder="Enter your password"
                      className="w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/10"
                    />
                    {errors.password ? <p className="text-xs text-rose-600">{errors.password}</p> : null}
                  </div>

                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <label className="inline-flex items-center gap-2 text-sm text-slate-600">
                      <input type="checkbox" className="h-4 w-4 rounded border-slate-300 bg-white text-emerald-600 focus:ring-emerald-500" />
                      Remember me
                    </label>
                    <Link href="/forget-password" className="text-sm font-medium text-emerald-600 hover:text-emerald-700">
                      Forgot Password?
                    </Link>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full rounded-3xl bg-emerald-600 px-5 py-3 text-base font-semibold text-white shadow-lg shadow-emerald-500/20 transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {isSubmitting ? "Signing in..." : "Sign In"}
                  </button>
                </form>

                <p className="mt-6 text-center text-sm text-slate-600">
                  Don&apos;t have an account?{' '}
                  <Link href="/register" className="font-semibold text-emerald-600 hover:text-emerald-700">
                    Create Account
                  </Link>
                </p>
              </div>
            </div>

            <div className="rounded-[2rem] bg-emerald-600/10 p-6 text-slate-950 shadow-lg shadow-slate-900/10 sm:p-8">
              <p className="text-sm uppercase tracking-[0.35em] text-emerald-700">Golden Bite</p>
              <h2 className="mt-4 text-3xl font-semibold text-slate-950">Healthy recipes made easy.</h2>
              <p className="mt-4 text-sm leading-7 text-slate-700">
                Save your favorite meals, build balanced nutrition plans, and get inspired with weekly ideas made for adults who want a calm, polished experience.
              </p>
              <div className="mt-8 space-y-4 rounded-[1.75rem] bg-white p-5 shadow-sm shadow-slate-900/5">
                <div>
                  <p className="text-xs uppercase tracking-[0.35em] text-slate-500">Why Golden Bite?</p>
                  <p className="mt-2 text-sm text-slate-600">A refined wellness platform for recipes, meal planning, and mindful eating.</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.35em] text-slate-500">Fast login</p>
                  <p className="mt-2 text-sm text-slate-600">Secure sign-in with a friendly, distraction-free interface.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-slate-200 bg-white/90 px-4 py-6 text-sm text-slate-600 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-semibold text-slate-700">© 2026 Golden Bite. Nourishing vitality for the golden years.</p>
          <div className="flex flex-wrap gap-4 text-slate-600">
            <Link href="#" className="transition hover:text-slate-900">
              Privacy Policy
            </Link>
            <Link href="#" className="transition hover:text-slate-900">
              Support
            </Link>
            <Link href="#" className="transition hover:text-slate-900">
              FAQ
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
