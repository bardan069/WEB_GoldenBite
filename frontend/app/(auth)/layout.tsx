import Link from "next/link";
import Logo from "@/app/_components/Logo";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
    return (
        <main className="relative min-h-screen overflow-hidden bg-bg">
            <div className="pointer-events-none absolute -top-60 -right-60 h-[600px] w-[600px] rounded-full bg-brand/5 blur-[120px] animate-pulse-slow" />
            <div className="pointer-events-none absolute -bottom-40 -left-40 h-[500px] w-[500px] rounded-full bg-gold/5 blur-[100px] animate-pulse-slow" />
            <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[800px] w-[800px] rounded-full bg-brand/3 blur-[160px]" />

            <div className="relative mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
                <header className="glass flex items-center justify-between rounded-2xl px-6 py-3.5">
                    <Link href="/" className="flex items-center gap-2.5">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-gold-light to-gold shadow-lg shadow-gold/25">
                            <Logo className="h-5 w-5 text-white" />
                        </div>
                        <span className="text-lg font-bold tracking-tight text-text-primary">Golden Bite</span>
                    </Link>

                    <nav className="flex items-center gap-1">
                        <Link href="/login" className="rounded-xl px-4 py-2 text-sm font-medium text-text-secondary transition-colors hover:bg-surface-hover hover:text-text-primary">
                            Sign In
                        </Link>
                        <Link href="/register" className="rounded-xl bg-brand px-4 py-2 text-sm font-semibold text-white shadow-md shadow-brand/25 transition-all hover:bg-brand-light hover:shadow-lg hover:shadow-brand/30">
                            Get Started
                        </Link>
                    </nav>
                </header>
            </div>

            <section className="relative flex min-h-[calc(100vh-88px)] items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
                {children}
            </section>

            <footer className="relative border-t border-border px-4 py-5 text-center text-sm text-text-muted">
                &copy; {new Date().getFullYear()} Golden Bite &middot; Nourishing vitality for the golden years.
            </footer>
        </main>
    );
}
