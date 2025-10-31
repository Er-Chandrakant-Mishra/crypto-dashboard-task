import { useEffect, useMemo, useRef, useState } from "react";

type FinnhubMessage = any;

export function useFinnhubWs(symbol: string) {
  const token = process.env.NEXT_PUBLIC_FINNHUB_TOKEN;
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [messages, setMessages] = useState<FinnhubMessage[]>([]);
  const wsRef = useRef<WebSocket | null>(null);

  const url = useMemo(() => `wss://ws.finnhub.io?token=${token ?? ""}`,[token]);

  useEffect(() => {
    if (!token) {
      setError("Missing NEXT_PUBLIC_FINNHUB_TOKEN");
      return;
    }
    const ws = new WebSocket(url);
    wsRef.current = ws;
    ws.onopen = () => {
      setConnected(true);
      setError(null);
      ws.send(JSON.stringify({ type: "subscribe", symbol }));
    };
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        setMessages((prev) => [...prev, data]);
      } catch (e: any) {
        // ignore
      }
    };
    ws.onerror = () => setError("WebSocket error");
    ws.onclose = () => setConnected(false);
    return () => {
      try { ws.send(JSON.stringify({ type: "unsubscribe", symbol })); } catch {}
      ws.close();
    };
  }, [symbol, token, url]);

  return { connected, error, messages };
}


