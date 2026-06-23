import DashboardHeader from "./_components/DashboardHeader";

export default function Layout({ children }: { children: React.ReactNode }) {
    return (
        <section className="relative min-h-screen bg-bg">
            <div className="pointer-events-none fixed -top-40 -right-40 h-[500px] w-[500px] rounded-full bg-brand/3 blur-[120px]" />
            <div className="pointer-events-none fixed -bottom-40 -left-40 h-[400px] w-[400px] rounded-full bg-gold/3 blur-[100px]" />

            <div className="relative mx-auto w-full max-w-[1440px] p-4 sm:p-6 lg:p-8 flex flex-col gap-6 min-h-screen">
                <DashboardHeader />
                <main className="flex-1">
                    {children}
                </main>
                <footer className="text-center text-sm text-text-muted py-4 border-t border-border">
                    &copy; {new Date().getFullYear()} Golden Bite. All rights reserved.
                </footer>
            </div>
        </section>
    );
}
