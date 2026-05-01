type SessionEvent = {
  type: "session.updated";
  sessionId: string;
  stage?: string;
  at: string;
};

type SessionListener = (event: SessionEvent) => void;

const globalForListeners = globalThis as unknown as {
  ginDerListeners?: Map<string, Set<SessionListener>>;
};

const listeners = globalForListeners.ginDerListeners ?? new Map<string, Set<SessionListener>>();

if (!globalForListeners.ginDerListeners) {
  globalForListeners.ginDerListeners = listeners;
}

export function subscribeToSession(sessionId: string, listener: SessionListener) {
  const bucket = listeners.get(sessionId) ?? new Set<SessionListener>();
  bucket.add(listener);
  listeners.set(sessionId, bucket);

  return () => {
    const nextBucket = listeners.get(sessionId);
    if (!nextBucket) {
      return;
    }

    nextBucket.delete(listener);

    if (nextBucket.size === 0) {
      listeners.delete(sessionId);
    }
  };
}

export function emitSessionEvent(sessionId: string, stage?: string) {
  const payload: SessionEvent = {
    type: "session.updated",
    sessionId,
    stage,
    at: new Date().toISOString(),
  };

  listeners.get(sessionId)?.forEach((listener) => listener(payload));
}
