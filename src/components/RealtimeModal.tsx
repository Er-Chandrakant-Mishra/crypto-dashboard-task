import { useFinnhubWs } from "@/hooks/useFinnhubWs";

type Props = { symbol: string; onClose: () => void };

export default function RealtimeModal({ symbol, onClose }: Props) {
  const { messages, connected, error } = useFinnhubWs(symbol);
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded shadow max-w-2xl w-full p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold">Live feed: {symbol}</h2>
          <button onClick={onClose} className="px-2 py-1 border rounded">Close</button>
        </div>
        <div className="text-sm mb-2">
          <span className={connected ? "text-green-600" : "text-gray-500"}>{connected ? "Connected" : "Connecting..."}</span>
          {error && <span className="text-red-600 ml-2">{error}</span>}
        </div>
        <div className="h-64 overflow-auto border rounded p-2 text-xs bg-gray-50">
          {messages.length === 0 ? (
            <div className="text-gray-500">Waiting for messages...</div>
          ) : (
            messages.slice(-200).map((m, idx) => (
              <pre key={idx} className="whitespace-pre-wrap break-words">{JSON.stringify(m)}</pre>
            ))
          )}
        </div>
      </div>
    </div>
  );
}


