import { useEffect, useMemo, useRef, useState } from "react";

type FinnhubMessage = any;

export function useFinnhubWs(symbolOrSymbols: string | string[]) {
  const token = process.env.NEXT_PUBLIC_FINNHUB_TOKEN;
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [messages, setMessages] = useState<FinnhubMessage[]>([]);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const symbols = Array.isArray(symbolOrSymbols) ? symbolOrSymbols : [symbolOrSymbols];

  const url = useMemo(() => `wss://ws.finnhub.io?token=${token ?? ""}`,[token]);

  useEffect(() => {
    if (!token) {
      setError("Missing NEXT_PUBLIC_FINNHUB_TOKEN. Set it in your .env.local");
      return;
    }
    const ws = new WebSocket(url);
    wsRef.current = ws;
    ws.onopen = () => {
      setConnected(true);
      setError(null);
      for (const s of symbols) {
        if (s) ws.send(JSON.stringify({ type: "subscribe", symbol: s }));
      }
      reconnectAttemptsRef.current = 0;
    };
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        // Keep only the latest 500 messages to bound memory
        setMessages((prev) => {
          const next = [...prev, data];
          if (next.length > 500) return next.slice(next.length - 500);
          return next;
        });
      } catch (e: any) {
        // ignore
      }
    };
    ws.onerror = () => setError("WebSocket error");
    ws.onclose = () => {
      setConnected(false);
      // try to reconnect with backoff
      const attempt = reconnectAttemptsRef.current + 1;
      reconnectAttemptsRef.current = attempt;
      const delayMs = Math.min(30000, 1000 * Math.pow(2, attempt));
      // Only reconnect if symbol/token still present
      if (symbols.length > 0 && token) {
        setTimeout(() => {
          // trigger effect by updating a no-op dependency via changing url by same values won't help; just recreate connection here
          try {
            const ws2 = new WebSocket(url);
            wsRef.current = ws2;
            ws2.onopen = () => {
              setConnected(true);
              setError(null);
              for (const s of symbols) {
                if (s) ws2.send(JSON.stringify({ type: "subscribe", symbol: s }));
              }
              reconnectAttemptsRef.current = 0;
            };
            ws2.onmessage = ws.onmessage as any;
            ws2.onerror = ws.onerror as any;
            ws2.onclose = ws.onclose as any;
          } catch {}
        }, delayMs);
      }
    };
    return () => {
      for (const s of symbols) {
        try { ws.send(JSON.stringify({ type: "unsubscribe", symbol: s })); } catch {}
      }
      ws.close();
    };
  }, [url, token, ...symbols]);

  return { connected, error, messages };
}


