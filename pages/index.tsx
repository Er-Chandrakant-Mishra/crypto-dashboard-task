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
      <BTCSection items={items} formatUsd={formatUsd} />
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-semibold">Top 50 Cryptocurrencies</h1>
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

      <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-1">
          <MarketCapPie />
        </div>
        <div className="lg:col-span-2">
      {view === "table" ? (
        <div className="mt-6 overflow-x-auto rounded-lg border shadow-sm">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 sticky top-0">
              <tr>
                <th className="p-3 border-b">Fav</th>
                <th className="p-3 border-b text-left">Name</th>
                <th className="p-3 border-b">Symbol</th>
                <th className="p-3 border-b">Price (USD)</th>
                <th className="p-3 border-b">24h %</th>
                <th className="p-3 border-b">Market Cap</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {loading ? (
                <tr><td className="p-4 text-center" colSpan={6}>Loading...</td></tr>
              ) : filteredSorted.map((c) => {
                const isFav = favoriteIds.includes(c.id);
                return (
                  <tr key={c.id} className="hover:bg-gray-50">
                    <td className="p-3 text-center">
                      <button aria-label="toggle favorite" onClick={() => dispatch(toggleFavorite(c.id))} className="text-lg">
                        {isFav ? "★" : "☆"}
                      </button>
                    </td>
                    <td className="p-3 text-left">
                      <Link className="flex items-center gap-2 text-blue-600 hover:underline" href={`/coin/${c.id}`}>
                        <Image src={c.image} alt={c.name} width={20} height={20} className="rounded-full" />
                        {c.name}
                      </Link>
                    </td>
                    <td className="p-3 text-center uppercase text-gray-600">{c.symbol}</td>
                    <td className="p-3 text-right">{formatUsd(c.current_price)}</td>
                    <td className={`p-3 text-right ${c.price_change_percentage_24h >= 0 ? "text-green-600" : "text-red-600"}`}>
                      {c.price_change_percentage_24h?.toFixed(2)}%
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
                  <div className={`${positive ? "text-green-600" : "text-red-600"} text-sm`}>{c.price_change_percentage_24h?.toFixed(2)}%</div>
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
  const [symbol, setSymbol] = useState("AAPL");
  return (
    <div className="rounded border p-4">
      <div className="flex items-center gap-3">
        <input value={symbol} onChange={(e) => setSymbol(e.target.value)} className="border rounded px-3 py-2" placeholder="Symbol e.g. BTCUSD, AAPL" />
        <button className="rounded bg-black text-white px-4 py-2" onClick={() => setOpen(true)}>Open Live Feed</button>
      </div>
      {open && <RealtimeModal symbol={symbol} onClose={() => setOpen(false)} />}
    </div>
  );
}

import RealtimeModal from "@/components/RealtimeModal";

export const getServerSideProps = wrapper.getServerSideProps((store) => async () => {
  await store.dispatch(fetchTopCoins());
  return { props: {} };
});

type BTCSectionProps = { items: Coin[]; formatUsd: (n: number) => string };
function BTCSection({ items, formatUsd }: BTCSectionProps) {
  const btc = items.find((c) => c.id === "bitcoin" || c.symbol?.toLowerCase() === "btc");
  if (!btc) return null;
  const positive = btc.price_change_percentage_24h >= 0;
  return (
    <div className="mb-6 rounded-xl border shadow-sm bg-gradient-to-r from-yellow-50 to-white p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Image src={btc.image} alt={btc.name} width={32} height={32} className="rounded-full" />
          <div>
            <div className="text-sm text-gray-500">Bitcoin Dashboard</div>
            <div className="text-xl font-semibold">{formatUsd(btc.current_price)}</div>
          </div>
        </div>
        <div className={`${positive ? "text-green-700" : "text-red-700"} text-sm`}>
          {btc.price_change_percentage_24h?.toFixed(2)}%
        </div>
      </div>
    </div>
  );
}
