import { useMemo } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";

const COLORS = [
  "#2563eb", "#16a34a", "#f59e0b", "#ef4444", "#8b5cf6",
  "#06b6d4", "#f97316", "#84cc16", "#0ea5e9", "#14b8a6",
];

export default function MarketCapPie() {
  const items = useSelector((s: RootState) => s.coins.items);

  const data = useMemo(() => {
    const top = [...items]
      .sort((a, b) => b.market_cap - a.market_cap)
      .slice(0, 10)
      .map((c) => ({ name: c.symbol.toUpperCase(), value: c.market_cap }));
    const others = items.slice(10).reduce((sum, c) => sum + c.market_cap, 0);
    if (others > 0) top.push({ name: "OTHERS", value: others });
    return top;
  }, [items]);

  if (!items.length) return null;

  return (
    <div className="rounded-lg border shadow-sm p-4 bg-white">
      <h2 className="text-lg font-semibold mb-3">Market Cap Distribution (Top 10)</h2>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} dataKey="value" nameKey="name" outerRadius={110} innerRadius={50}>
              {data.map((_, idx) => (
                <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(v: any) => new Intl.NumberFormat("en-US", { notation: "compact", compactDisplay: "short" }).format(Number(v))} />
            <Legend layout="horizontal" verticalAlign="bottom" align="center" />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}


