import { useMemo } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";

const COLORS = [
  "#7c3aed", // violet-600
  "#2563eb", // blue-600
  "#0ea5e9", // sky-500
  "#06b6d4", // cyan-500
  "#10b981", // emerald-500
  "#84cc16", // lime-500
  "#f59e0b", // amber-500
  "#f97316", // orange-500
  "#ef4444", // red-500
  "#ec4899", // pink-500
];

export default function MarketCapPie() {
  const items = useSelector((s: RootState) => s.coins.items);

  const data = useMemo(() => {
    const top = [...items]
      .sort((a, b) => b.market_cap - a.market_cap)
      .slice(0, 10)
      .map((c) => ({ name: c.symbol.toUpperCase(), value: c.market_cap }));
    const others = items
  .slice(10)
  .reduce((sum: number, c: { market_cap: number }) => sum + c.market_cap, 0);
    if (others > 0) top.push({ name: "OTHERS", value: others });
    return top;
  }, [items]);

  if (!items.length) return null;

  return (
    <div className="rounded-lg border border-white/10 shadow-sm p-4 bg-white/5 backdrop-blur text-white">
      <h2 className="text-lg font-semibold mb-3">Market Cap Distribution (Top 10)</h2>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
            <PieChart>
            <Pie data={data} dataKey="value" nameKey="name" outerRadius={110} innerRadius={50}>
              {data.map((_, idx) => (
                <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              formatter={(v: any) => new Intl.NumberFormat("en-US", { notation: "compact", compactDisplay: "short" }).format(Number(v))}
              contentStyle={{ background: "#0f172a", border: "1px solid #334155", color: "#e5e7eb" }}
              itemStyle={{ color: "#e5e7eb" }}
            />
            <Legend layout="horizontal" verticalAlign="bottom" align="center" wrapperStyle={{ color: "#e5e7eb" }} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}


