import Link from "next/link";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET ?? "dev_jwt_secret";

type JwtPayload = {
  sub: string;
  email: string;
  name: string;
};

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  let user: JwtPayload | null = null;

  if (token) {
    try {
      user = jwt.verify(token, JWT_SECRET) as JwtPayload;
    } catch {
      user = null;
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <div className="mx-auto max-w-4xl px-6 py-12">
        <div className="rounded-[2rem] border border-slate-200 bg-white p-10 shadow-xl shadow-slate-900/5">
          <h1 className="text-4xl font-semibold tracking-tight">Dashboard</h1>
          {user ? (
            <div className="mt-6 space-y-4">
              <p className="text-lg text-slate-700">Welcome back, <span className="font-semibold text-slate-950">{user.name}</span>.</p>
              <p className="text-sm text-slate-600">
                You are signed in with <span className="font-medium text-slate-800">{user.email}</span>.
              </p>
              <div className="rounded-3xl bg-emerald-50 p-5 text-emerald-700 shadow-sm">
                <p className="text-sm">Your session is active. You can now build or explore your wellness dashboard.</p>
              </div>
            </div>
          ) : (
            <div className="mt-6 space-y-4">
              <p className="text-lg text-slate-700">No valid session found.</p>
              <p className="text-sm text-slate-600">Please sign in again to access the dashboard.</p>
              <Link
                href="/login"
                className="inline-flex rounded-full bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-500"
              >
                Go to Login
              </Link>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
