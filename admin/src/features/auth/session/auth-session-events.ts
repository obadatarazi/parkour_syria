type SessionEndedListener = (payload: { reason: "expired" }) => void;

const listeners = new Set<SessionEndedListener>();

/** Subscribe to forced session end (e.g. refresh failure). Returns unsubscribe. */
export function subscribeSessionEnded(listener: SessionEndedListener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function emitSessionEnded(reason: "expired" = "expired"): void {
  for (const listener of listeners) {
    try {
      listener({ reason });
    } catch {
      // Listener errors must not break session teardown.
    }
  }
}
