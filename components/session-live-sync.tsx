"use client";

import { useCallback, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

type SessionLiveSyncProps = {
  sessionId: string;
};

const reconnectDelayMs = 1000;
const maxReconnectDelayMs = 10000;
const fallbackRefreshMs = 15000;

export function SessionLiveSync({ sessionId }: SessionLiveSyncProps) {
  const router = useRouter();
  const sourceRef = useRef<EventSource | null>(null);
  const reconnectTimeoutRef = useRef<number | null>(null);
  const reconnectDelayRef = useRef(reconnectDelayMs);
  const fallbackIntervalRef = useRef<number | null>(null);
  const refresh = useCallback(() => router.refresh(), [router]);

  useEffect(() => {
    let active = true;

    const clearReconnect = () => {
      if (reconnectTimeoutRef.current !== null) {
        window.clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
    };

    const disconnect = () => {
      if (sourceRef.current) {
        sourceRef.current.onmessage = null;
        sourceRef.current.onerror = null;
        sourceRef.current.close();
        sourceRef.current = null;
      }
    };

    const connect = () => {
      if (!active) {
        return;
      }

      disconnect();

      const source = new EventSource(`/api/sessions/${sessionId}/events`);
      sourceRef.current = source;

      source.onmessage = () => {
        reconnectDelayRef.current = reconnectDelayMs;
        refresh();
      };

      source.onerror = () => {
        disconnect();

        if (!active || reconnectTimeoutRef.current !== null) {
          return;
        }

        reconnectTimeoutRef.current = window.setTimeout(() => {
          reconnectTimeoutRef.current = null;
          connect();
        }, reconnectDelayRef.current);

        reconnectDelayRef.current = Math.min(reconnectDelayRef.current * 2, maxReconnectDelayMs);
      };
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState !== "visible") {
        return;
      }

      refresh();

      if (!sourceRef.current || sourceRef.current.readyState === EventSource.CLOSED) {
        clearReconnect();
        reconnectDelayRef.current = reconnectDelayMs;
        connect();
      }
    };

    connect();

    fallbackIntervalRef.current = window.setInterval(() => {
      if (document.visibilityState === "visible") {
        refresh();
      }
    }, fallbackRefreshMs);

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      active = false;
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      clearReconnect();

      if (fallbackIntervalRef.current !== null) {
        window.clearInterval(fallbackIntervalRef.current);
        fallbackIntervalRef.current = null;
      }

      disconnect();
    };
  }, [refresh, sessionId]);

  return null;
}
