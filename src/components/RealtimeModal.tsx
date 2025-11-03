import { useFinnhubWs } from "@/hooks/useFinnhubWs";

type Props = { symbol: string; onClose: () => void };

export default function RealtimeModal({ symbol, onClose }: Props) {
  const { messages, connected, error } = useFinnhubWs(symbol);
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="rounded shadow max-w-2xl w-full p-4 bg-slate-900 text-slate-100 border border-slate-800">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold">Live feed: {symbol}</h2>
          <button onClick={onClose} className="px-2 py-1 border border-slate-700 rounded">Close</button>
        </div>
        <div className="text-sm mb-2">
          <span className={connected ? "text-emerald-400" : "text-slate-400"}>{connected ? "Connected" : "Connecting..."}</span>
          {error && <span className="text-rose-400 ml-2">{error}</span>}
        </div>
        <TradesView messages={messages} />
      </div>
    </div>
  );
}

function TradesView({ messages }: { messages: any[] }) {
  // Extract latest trade items from messages
  const trades: { price: number; volume: number; time: number; symbol?: string }[] = [];
  for (let i = Math.max(0, messages.length - 300); i < messages.length; i++) {
    const m = messages[i];
    if (m && m.type === "trade" && Array.isArray(m.data)) {
      for (const d of m.data) {
        if (typeof d.p === "number" && typeof d.v === "number") {
          trades.push({ price: d.p, volume: d.v, time: d.t, symbol: d.s });
        }
      }
    }
  }
  trades.sort((a, b) => a.time - b.time);
  const recent = trades.slice(-150);

  if (messages.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center border rounded p-2 text-sm bg-gray-50 text-gray-500">
        Waiting for messages...
      </div>
    );
  }

  return (
    <div className="h-64 overflow-auto border border-slate-800 rounded bg-slate-950">
      <table className="min-w-full text-xs">
        <thead className="bg-slate-900 sticky top-0">
          <tr>
            <th className="text-left p-2 border-b">Time</th>
            <th className="text-right p-2 border-b">Price</th>
            <th className="text-right p-2 border-b">Volume</th>
            <th className="text-left p-2 border-b">Symbol</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800">
          {recent.map((t, idx) => (
            <tr key={idx}>
              <td className="p-2">{new Date(t.time).toLocaleTimeString()}</td>
              <td className="p-2 text-right">{t.price.toLocaleString(undefined, { maximumFractionDigits: 8 })}</td>
              <td className="p-2 text-right">{t.volume.toLocaleString()}</td>
              <td className="p-2">{t.symbol}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}


