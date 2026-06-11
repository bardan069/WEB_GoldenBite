import Link from "next/link";

export default function Navbar() {
  return (
    <header className="flex items-center justify-between rounded-3xl border border-slate-700 bg-slate-900/70 px-5 py-4 shadow-xl shadow-slate-950/30 backdrop-blur-sm">
      <div className="flex items-center gap-3 text-slate-50">
        <img src="/logo.svg" alt="Golden Bite" className="h-11 w-auto" />
      </div>
      <nav className="hidden items-center gap-8 md:flex text-sm text-slate-300">
        <Link href="/">Home</Link>
        <Link href="/recipes">Recipes</Link>
        <Link href="/about">About Us</Link>
      </nav>
    </header>
  );
}
