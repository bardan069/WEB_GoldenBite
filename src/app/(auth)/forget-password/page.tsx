import Link from "next/link";

export default function Page() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(245,158,11,0.16),_transparent_22%),linear-gradient(180deg,#f7ecd6_0%,#fbf6ed_58%,#f6e8cf_100%)] text-slate-950">
      <div className="mx-auto flex min-h-screen max-w-4xl flex-col items-center justify-center px-4 py-10 sm:px-6 lg:px-8">
        <div className="w-full rounded-[2rem] border border-white/70 bg-white/90 p-8 shadow-2xl shadow-slate-900/10 backdrop-blur-xl sm:p-10">
          <div className="space-y-4 text-center">
            <p className="text-sm uppercase tracking-[0.35em] text-emerald-600">Password help</p>
            <h1 className="text-4xl font-semibold text-slate-950 sm:text-5xl">Forgot your password?</h1>
            <p className="mx-auto max-w-2xl text-sm leading-7 text-slate-600">
              Enter your email below and we&apos;ll send you a link to reset your password.
            </p>
          </div>

          <form className="mt-10 space-y-6 rounded-[2rem] bg-slate-100 p-6 shadow-lg shadow-slate-900/5 sm:p-8" noValidate>
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium text-slate-700">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                placeholder="you@example.com"
                className="w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/10"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full rounded-3xl bg-emerald-600 px-5 py-3 text-base font-semibold text-white shadow-lg shadow-emerald-500/20 transition hover:bg-emerald-500"
            >
              Send reset link
            </button>

            <p className="text-center text-sm text-slate-600">
              Remembered your password?{' '}
              <Link href="/login" className="font-semibold text-emerald-600 hover:text-emerald-700">
                Sign In
              </Link>
            </p>
          </form>
        </div>
      </div>
    </main>
  );
}
