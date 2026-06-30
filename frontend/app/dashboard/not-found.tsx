import Link from "next/link";

export default function NotFound() {
    return (
        <div className="flex min-h-[50vh] flex-col items-center justify-center text-center">
            <p className="text-8xl font-bold gradient-text">404</p>
            <p className="mt-4 text-lg text-text-secondary">Page not found</p>
            <Link
                href="/dashboard"
                className="mt-8 rounded-xl bg-gradient-to-r from-brand to-brand-dark px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-brand/25 transition-all hover:shadow-xl hover:brightness-110"
            >
                Back to Dashboard
            </Link>
        </div>
    );
}
