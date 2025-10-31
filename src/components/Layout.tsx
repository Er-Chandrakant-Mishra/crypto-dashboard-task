import Link from "next/link";
import { ReactNode } from "react";

type Props = { children: ReactNode };

export default function Layout({ children }: Props) {
  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900">
      <aside className="fixed inset-y-0 left-0 w-60 border-r bg-white p-4 hidden md:flex flex-col gap-2">
        <div className="text-lg font-semibold px-2 py-1">Crypto Admin</div>
        <nav className="mt-2 flex-1 overflow-auto">
          <Section title="Dashboard">
            <NavLink href="/">Overview</NavLink>
            <NavLink href="/coin/bitcoin">Bitcoin</NavLink>
          </Section>
          <Section title="Markets">
            <NavLink href="/">Cryptocurrencies</NavLink>
          </Section>
          <Section title="Realtime">
            <NavLink href="/">Websocket Feed</NavLink>
          </Section>
        </nav>
        <div className="text-xs text-zinc-500 px-2">v1.0</div>
      </aside>
      <div className="md:pl-60">
        <header className="sticky top-0 z-10 bg-white/80 backdrop-blur border-b">
          <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
            <div className="font-semibold">Dashboard</div>
            <div className="flex items-center gap-3">
              <input className="hidden sm:block border rounded-md px-3 py-1.5 text-sm" placeholder="Search" />
              <div className="h-8 w-8 rounded-full bg-zinc-200" />
            </div>
          </div>
        </header>
        <main>{children}</main>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="mb-3">
      <div className="px-2 py-1 text-xs uppercase tracking-wide text-zinc-500">{title}</div>
      <div className="flex flex-col">{children}</div>
    </div>
  );
}

function NavLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link href={href} className="px-2 py-2 rounded hover:bg-zinc-100 text-sm">
      {children}
    </Link>
  );
}


