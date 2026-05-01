"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

type SessionLiveSyncProps = {
  sessionId: string;
};

export function SessionLiveSync({ sessionId }: SessionLiveSyncProps) {
  const router = useRouter();

  useEffect(() => {
    const source = new EventSource(`/api/sessions/${sessionId}/events`);
    const refresh = () => router.refresh();

    source.addEventListener("message", refresh);
    source.addEventListener("error", () => {
      source.close();
    });

    return () => {
      source.removeEventListener("message", refresh);
      source.close();
    };
  }, [router, sessionId]);

  return null;
}
