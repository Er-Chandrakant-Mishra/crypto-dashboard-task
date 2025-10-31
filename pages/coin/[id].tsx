import { useSelector } from "react-redux";
import { wrapper } from "@/store";
import { RootState } from "@/store";
import { fetchCoinChart7d, fetchCoinDetail } from "@/store/slices/coinsSlice";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

export default function CoinDetailPage() {
  const { detail, chart7d } = useSelector((s: RootState) => s.coins);

  const data = (chart7d || []).map(([ts, price]: [number, number]) => ({
    time: new Date(ts).toLocaleDateString(),
    price,
  }));

  if (!detail) return <div className="max-w-5xl mx-auto px-4 py-6">Loading...</div>;

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-semibold mb-2">{detail.name} ({detail.symbol.toUpperCase()})</h1>
      {detail.description?.en && (
        <p className="text-sm text-gray-600 mb-6" dangerouslySetInnerHTML={{ __html: detail.description.en }} />
      )}

      <div className="h-72 w-full border rounded p-3">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ left: 12, right: 12 }}>
            <XAxis dataKey="time" hide />
            <YAxis domain={["auto", "auto"]} tickFormatter={(v) => `$${v}`} width={60} />
            <Tooltip formatter={(v: any) => `$${Number(v).toLocaleString()}`} />
            <Line type="monotone" dataKey="price" stroke="#2563eb" dot={false} strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export const getServerSideProps = wrapper.getServerSideProps((store) => async (ctx) => {
  const id = ctx.params?.id as string;
  if (!id) return { notFound: true };
  await store.dispatch(fetchCoinDetail({ id }));
  await store.dispatch(fetchCoinChart7d({ id }));
  return { props: {} };
});


