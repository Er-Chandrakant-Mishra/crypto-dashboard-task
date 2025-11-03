import Link from "next/link";
import { useDispatch, useSelector } from "react-redux";
import { useMemo, useState } from "react";
import Image from "next/image";
import { wrapper } from "@/store";
import { RootState } from "@/store";
import { fetchTopCoins, setSearchQuery, setSort, Coin } from "@/store/slices/coinsSlice";
import { toggleFavorite } from "@/store/slices/favoritesSlice";
import MarketCapPie from "@/components/MarketCapPie";

export default function Home() {
  const dispatch = useDispatch();
  const { items, loading, searchQuery, sortBy, sortDir } = useSelector((s: RootState) => s.coins);
  const favoriteIds = useSelector((s: RootState) => s.favorites.ids);

  const [localQuery, setLocalQuery] = useState(searchQuery);
  const [view, setView] = useState<"table" | "grid">("table");

  const filteredSorted = useMemo(() => {
    let list: Coin[] = items;
    if (localQuery.trim()) {
      const q = localQuery.toLowerCase();
      list = list.filter((c) => c.name.toLowerCase().includes(q) || c.symbol.toLowerCase().includes(q));
    }
    const sorted = [...list].sort((a, b) => {
      let av = 0, bv = 0;
      if (sortBy === "price") { av = a.current_price; bv = b.current_price; }
      else if (sortBy === "market_cap") { av = a.market_cap; bv = b.market_cap; }
      else { av = a.price_change_percentage_24h; bv = b.price_change_percentage_24h; }
      return sortDir === "asc" ? av - bv : bv - av;
    });
    return sorted;
  }, [items, localQuery, sortBy, sortDir]);

  const formatUsd = (n: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 8 }).format(n);
  const formatCompact = (n: number) =>
    new Intl.NumberFormat("en-US", { notation: "compact", compactDisplay: "short" }).format(n);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <HeroStats items={items} formatUsd={formatUsd} />
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-semibold bg-gradient-to-r from-fuchsia-400 via-purple-400 to-blue-400 bg-clip-text text-transparent">Top 50 Cryptocurrencies</h1>
          <div className="hidden md:flex gap-1 rounded-md border p-1 bg-white shadow-sm">
            <button onClick={() => setView("table")} className={`px-3 py-1 rounded ${view === "table" ? "bg-black text-white" : "hover:bg-gray-100"}`}>Table</button>
            <button onClick={() => setView("grid")} className={`px-3 py-1 rounded ${view === "grid" ? "bg-black text-white" : "hover:bg-gray-100"}`}>Grid</button>
          </div>
        </div>
        <div className="flex flex-col md:flex-row gap-3">
          <input
            value={localQuery}
            onChange={(e) => setLocalQuery(e.target.value)}
            onBlur={() => dispatch(setSearchQuery(localQuery))}
            placeholder="Search by name or symbol"
            className="border rounded-md px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <select
            value={`${sortBy}:${sortDir}`}
            onChange={(e) => {
              const [sb, sd] = e.target.value.split(":") as ["price"|"market_cap"|"change_24h","asc"|"desc"];
              dispatch(setSort({ sortBy: sb, sortDir: sd }));
            }}
            className="border rounded-md px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="price:asc">Price ↑</option>
            <option value="price:desc">Price ↓</option>
            <option value="market_cap:asc">Market Cap ↑</option>
            <option value="market_cap:desc">Market Cap ↓</option>
            <option value="change_24h:asc">24h Change ↑</option>
            <option value="change_24h:desc">24h Change ↓</option>
          </select>
          <div className="md:hidden flex gap-1 rounded-md border p-1 bg-white shadow-sm">
            <button onClick={() => setView("table")} className={`px-3 py-1 rounded ${view === "table" ? "bg-black text-white" : "hover:bg-gray-100"}`}>Table</button>
            <button onClick={() => setView("grid")} className={`px-3 py-1 rounded ${view === "grid" ? "bg-black text-white" : "hover:bg-gray-100"}`}>Grid</button>
          </div>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 lg:grid-cols-4 gap-4">
        <div className="lg:col-span-1"><MarketCapPie /></div>
        <div className="lg:col-span-1"><PromoCard /></div>
        <div className="lg:col-span-2">
      {view === "table" ? (
        <div className="mt-6 overflow-x-auto rounded-lg border border-slate-800 shadow-sm bg-slate-900">
          <table className="min-w-full text-sm text-slate-200">
            <thead className="bg-slate-900 sticky top-0 text-slate-300">
              <tr>
                <th className="p-3 border-b border-slate-800">Fav</th>
                <th className="p-3 border-b border-slate-800 text-left">Name</th>
                <th className="p-3 border-b border-slate-800">Symbol</th>
                <th className="p-3 border-b border-slate-800">Price (USD)</th>
                <th className="p-3 border-b border-slate-800">24h %</th>
                <th className="p-3 border-b border-slate-800">Market Cap</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {loading ? (
                <tr><td className="p-4 text-center" colSpan={6}>Loading...</td></tr>
              ) : filteredSorted.map((c) => {
                const isFav = favoriteIds.includes(c.id);
                const positive = c.price_change_percentage_24h >= 0;
                return (
                  <tr key={c.id} className="hover:bg-slate-800/60">
                    <td className="p-3 text-center">
                      <button aria-label="toggle favorite" onClick={() => dispatch(toggleFavorite(c.id))} className="text-lg">
                        {isFav ? "★" : "☆"}
                      </button>
                    </td>
                    <td className="p-3 text-left">
                      <Link className="flex items-center gap-2 text-sky-400 hover:underline" href={`/coin/${c.id}`}>
                        <Image src={c.image} alt={c.name} width={20} height={20} className="rounded-full" />
                        {c.name}
                      </Link>
                    </td>
                    <td className="p-3 text-center uppercase text-slate-400">{c.symbol}</td>
                    <td className="p-3 text-right">{formatUsd(c.current_price)}</td>
                    <td className="p-3 text-right">
                      <span className={`inline-flex items-center justify-end min-w-[80px] px-2 py-1 rounded-full text-xs font-medium ${
                        positive ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"
                      }`}>
                        {positive ? "+" : ""}{c.price_change_percentage_24h?.toFixed(2)}%
                      </span>
                    </td>
                    <td className="p-3 text-right">{formatCompact(c.market_cap)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {loading ? (
            <div className="col-span-full text-center p-6">Loading...</div>
          ) : filteredSorted.map((c) => {
            const isFav = favoriteIds.includes(c.id);
            const positive = c.price_change_percentage_24h >= 0;
            return (
              <Link key={c.id} href={`/coin/${c.id}`} className="rounded-lg border shadow-sm p-4 hover:shadow-md transition bg-white block">
                <div className="flex items-start justify-between">
                  <div className="font-semibold hover:underline flex items-center gap-2">
                    <Image src={c.image} alt={c.name} width={20} height={20} className="rounded-full" />
                    {c.name}
                  </div>
                  <button
                    aria-label="toggle favorite"
                    className="text-xl"
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); dispatch(toggleFavorite(c.id)); }}
                  >
                    {isFav ? "★" : "☆"}
                  </button>
                </div>
                <div className="mt-1 text-xs uppercase text-gray-500">{c.symbol}</div>
                <div className="mt-4 flex items-end justify-between">
                  <div className="text-lg font-semibold">{formatUsd(c.current_price)}</div>
                  <div className="text-sm">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      positive ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"
                    }`}>
                      {positive ? "+" : ""}{c.price_change_percentage_24h?.toFixed(2)}%
                    </span>
                  </div>
                </div>
                <div className="mt-2 text-sm text-gray-600">Mkt Cap: {formatCompact(c.market_cap)}</div>
              </Link>
            );
          })}
        </div>
      )}
        </div>
      </div>

      <div className="mt-6">
        <RealtimeWidget />
      </div>
    </div>
  );
}

function RealtimeWidget() {
  const [open, setOpen] = useState(false);
  const [exchange, setExchange] = useState<"BINANCE" | "COINBASE">("BINANCE");
  const [coinId, setCoinId] = useState<string>("bitcoin");
  const [manual, setManual] = useState<string>("");
  const items = useSelector((s: RootState) => s.coins.items);

  const autoSymbol = useMemo(() => {
    const coin = items.find((c) => c.id === coinId);
    const base = (coin?.symbol || "BTC").toUpperCase();
    if (exchange === "BINANCE") return `BINANCE:${base}USDT`;
    // COINBASE uses hyphen and USD pairs typically
    return `COINBASE:${base}-USD`;
  }, [coinId, exchange, items]);

  const symbol = manual.trim() ? manual.trim() : autoSymbol;

  return (
    <div className="rounded border p-4 bg-white shadow-sm">
      <div className="flex flex-col gap-3">
        <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
          <select
            value={coinId}
            onChange={(e) => setCoinId(e.target.value)}
            className="border rounded px-3 py-2 w-full sm:w-56"
          >
            {items.slice(0, 50).map((c) => (
              <option key={c.id} value={c.id}>{c.name} ({c.symbol.toUpperCase()})</option>
            ))}
          </select>
          <select
            value={exchange}
            onChange={(e) => setExchange(e.target.value as any)}
            className="border rounded px-3 py-2 w-full sm:w-40"
          >
            <option value="BINANCE">BINANCE</option>
            <option value="COINBASE">COINBASE</option>
          </select>
          <div className="text-xs text-gray-500">Auto: {autoSymbol}</div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <input
            value={manual}
            onChange={(e) => setManual(e.target.value)}
            className="border rounded px-3 py-2 w-72"
            placeholder="Override (e.g., BINANCE:SOLUSDT) — optional"
          />
          <button onClick={() => setManual("")} className="px-2 py-1 border rounded hover:bg-gray-50">Use Auto</button>
          <button onClick={() => setManual("BINANCE:BTCUSDT")} className="px-2 py-1 border rounded hover:bg-gray-50">BTC</button>
          <button onClick={() => setManual("BINANCE:ETHUSDT")} className="px-2 py-1 border rounded hover:bg-gray-50">ETH</button>
          <button onClick={() => setManual("COINBASE:BTC-USD")} className="px-2 py-1 border rounded hover:bg-gray-50">CB BTC</button>
        </div>
        <div className="flex justify-between items-center gap-3">
          <div className="text-xs text-gray-500 truncate">Subscribing: {symbol}</div>
          <button className="rounded bg-black text-white px-4 py-2 w-full sm:w-auto" onClick={() => setOpen(true)}>Open Live Feed</button>
        </div>
      </div>
      <div className="mt-2 text-xs text-gray-500">Requires NEXT_PUBLIC_FINNHUB_TOKEN in .env.local. Uses your API list to build tokens automatically.</div>
      {open && <RealtimeModal symbol={symbol} onClose={() => setOpen(false)} />}
    </div>
  );
}

import RealtimeModal from "@/components/RealtimeModal";

export const getServerSideProps = wrapper.getServerSideProps((store) => async () => {
  await store.dispatch(fetchTopCoins());
  return { props: {} };
});

type HeroStatsProps = { items: Coin[]; formatUsd: (n: number) => string };
function HeroStats({ items, formatUsd }: HeroStatsProps) {
  if (!items.length) return null;
  const btc = items.find((c) => c.id === "bitcoin" || c.symbol?.toLowerCase() === "btc");
  const eth = items.find((c) => c.id === "ethereum" || c.symbol?.toLowerCase() === "eth");
  const totalMcap = items.reduce((sum, c) => sum + (c.market_cap || 0), 0);
  const btcDom = btc && totalMcap > 0 ? (btc.market_cap / totalMcap) * 100 : 0;
  const topMover = [...items]
    .filter((c) => Number.isFinite(c.price_change_percentage_24h))
    .sort((a, b) => (b.price_change_percentage_24h || 0) - (a.price_change_percentage_24h || 0))[0];
  return (
    <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {btc && (
        <div className="rounded-xl border border-white/10 shadow-sm p-4 bg-white/5 backdrop-blur text-white">
          <div className="text-sm text-gray-500">Bitcoin Price</div>
          <div className="mt-1 text-2xl font-semibold">{formatUsd(btc.current_price)}</div>
          <div className="mt-2">
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${btc.price_change_percentage_24h >= 0 ? "bg-white/20" : "bg-white/20"}`}>{btc.price_change_percentage_24h >= 0 ? "+" : ""}{btc.price_change_percentage_24h?.toFixed(2)}%</span>
          </div>
        </div>
      )}
      {eth && (
        <div className="rounded-xl border border-white/10 shadow-sm p-4 bg-white/5 backdrop-blur text-white">
          <div className="text-sm text-gray-500">Ethereum Price</div>
          <div className="mt-1 text-2xl font-semibold">{formatUsd(eth.current_price)}</div>
          <div className="mt-2">
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-white/20`}>{eth.price_change_percentage_24h >= 0 ? "+" : ""}{eth.price_change_percentage_24h?.toFixed(2)}%</span>
          </div>
        </div>
      )}
      <div className="rounded-xl border border-white/10 shadow-sm p-4 bg-white/5 backdrop-blur text-white">
        <div className="text-sm text-gray-500">Total Market Cap</div>
        <div className="mt-1 text-2xl font-semibold">{new Intl.NumberFormat("en-US", { notation: "compact", compactDisplay: "short", style: "currency", currency: "USD" }).format(totalMcap)}</div>
        <div className="mt-1 text-xs text-gray-500">Across listed assets</div>
      </div>
      <div className="rounded-xl border border-white/10 shadow-sm p-4 bg-white/5 backdrop-blur text-white">
        <div className="text-sm text-gray-500">BTC Dominance</div>
        <div className="mt-1 text-2xl font-semibold">{btcDom.toFixed(1)}%</div>
        {topMover && (
          <div className="mt-2 text-xs">Top mover: {topMover.symbol.toUpperCase()} {topMover.price_change_percentage_24h?.toFixed(2)}%</div>
        )}
      </div>
    </div>
  );
}

function PromoCard() {
  return (
    <div className="rounded-xl border border-white/10 shadow-sm p-4 bg-gradient-to-br from-indigo-700 via-purple-700 to-fuchsia-700 text-white">
      <div className="text-sm opacity-80">Liquid Staking Portfolio</div>
      <div className="mt-2 text-lg font-semibold">Smarter crypto allocations</div>
      <p className="mt-2 text-xs opacity-80">Connect your wallet to simulate and build a diversified portfolio in seconds.</p>
      <div className="mt-4 flex gap-2">
        <button className="px-3 py-2 rounded-md bg-white text-slate-900 text-sm">Connect Wallet</button>
        <button className="px-3 py-2 rounded-md bg-white/10 border border-white/20 text-white text-sm">Learn more</button>
      </div>
    </div>
  );
}
