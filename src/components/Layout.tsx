import Link from "next/link";
import { ReactNode, useEffect, useState } from "react";
import { useRouter } from "next/router";

type Props = { children: ReactNode };

export default function Layout({ children }: Props) {
  const [theme, setTheme] = useState<string>("dark");
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const router = useRouter();
  useEffect(() => {
    const saved = typeof window !== "undefined" ? localStorage.getItem("theme") : null;
    if (saved) setTheme(saved);
  }, []);
  useEffect(() => {
    if (typeof document === "undefined") return;
    const body = document.body;
    body.classList.remove("theme-light", "theme-dark");
    if (theme === "light") body.classList.add("theme-light");
    else if (theme === "dark") body.classList.add("theme-dark");
    if (typeof window !== "undefined") localStorage.setItem("theme", theme);
  }, [theme]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-30 bg-black/40 md:hidden" onClick={() => setSidebarOpen(false)} />
      )}
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-60 border-r border-slate-800 bg-slate-900 p-4 flex-col gap-2 transition-transform duration-200 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0 md:flex`}>
        <div className="flex items-center justify-between px-2 py-1">
          <div className="text-lg font-semibold bg-gradient-to-r from-fuchsia-500 to-blue-500 bg-clip-text text-transparent">Crypto Admin</div>
          <button className="md:hidden px-2 py-1 border border-slate-700 rounded" onClick={() => setSidebarOpen(false)} aria-label="Close sidebar">✕</button>
        </div>
        <nav className="mt-2 flex-1 overflow-auto">
          <Section title="Dashboard">
            <NavLink href="/" active={router.pathname === "/"}>Overview</NavLink>
            <NavLink href="/coin/bitcoin" active={router.asPath.startsWith("/coin/bitcoin")}>Bitcoin</NavLink>
          </Section>
          <Section title="Markets">
            <NavLink href="/" active={router.pathname === "/"}>Cryptocurrencies</NavLink>
          </Section>
          <Section title="Realtime">
            <NavLink href="/" active={router.pathname === "/"}> Feed</NavLink>
          </Section>
        </nav>
        <div className="text-xs text-slate-400 px-2">v1.0</div>
      </aside>
      {/* Main */}
      <div className="md:pl-60">
        <header className="sticky top-0 z-20 bg-slate-900/80 backdrop-blur border-b border-slate-800">
          <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button className="md:hidden px-2 py-1 border border-slate-700 rounded" onClick={() => setSidebarOpen(true)} aria-label="Open sidebar">☰</button>
              <div className="font-semibold">Dashboard</div>
              <div className="hidden sm:block text-xs text-slate-400">/ Overview</div>
            </div>
            <div className="flex items-center gap-3">
              <input className="hidden sm:block border border-slate-700 bg-slate-800 text-slate-100 rounded-md px-3 py-1.5 text-sm placeholder:text-slate-400" placeholder="Search" />
              <button className="h-8 w-8 rounded-full border border-slate-700 grid place-items-center" aria-label="Notifications">🔔</button>
              <ThemeToggle value={theme} onChange={setTheme} />
              <div className="h-8 w-8 rounded-full bg-slate-700" />
            </div>
          </div>
        </header>
        <main>{children}</main>
        <footer className="mt-8 border-t border-slate-800">
          <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between text-sm text-slate-400">
            <div>© {new Date().getFullYear()} Crypto Admin</div>
            <div className="flex items-center gap-4">
              <Link href="/" className="hover:underline">Terms</Link>
              <Link href="/" className="hover:underline">Privacy</Link>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="mb-3">
      <div className="px-2 py-1 text-xs uppercase tracking-wide text-slate-400">{title}</div>
      <div className="flex flex-col">{children}</div>
    </div>
  );
}

function NavLink({ href, children, active }: { href: string; children: ReactNode; active?: boolean }) {
  return (
    <Link
      href={href}
      className={`px-2 py-2 rounded text-sm transition ${active ? "bg-indigo-600 text-white" : "hover:bg-slate-800 text-slate-200"}`}
    >
      {children}
    </Link>
  );
}

function ThemeToggle({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex items-center gap-1 text-xs">
      <button
        className={`px-2 py-1 border rounded ${value === "light" ? "bg-zinc-900 text-white" : "bg-white"}`}
        onClick={() => onChange("light")}
        aria-label="Light theme"
      >L</button>
      <button
        className={`px-2 py-1 border rounded ${value === "auto" ? "bg-zinc-900 text-white" : "bg-white"}`}
        onClick={() => onChange("auto")}
        aria-label="Auto theme"
      >A</button>
      <button
        className={`px-2 py-1 border rounded ${value === "dark" ? "bg-zinc-900 text-white" : "bg-white"}`}
        onClick={() => onChange("dark")}
        aria-label="Dark theme"
      >D</button>
    </div>
  );
}


