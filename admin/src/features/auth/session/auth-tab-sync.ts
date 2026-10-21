import { AUTH_STORAGE_KEY } from "@/shared/constants/auth";

export type AuthTabSyncMessage =
  | { type: "logout" }
  | { type: "session_expired" }
  | { type: "login" };

const AUTH_TAB_CHANNEL = "parkour-admin-auth-sync";
/** Fallback when BroadcastChannel is unavailable — other tabs hear via `storage`. */
const AUTH_TAB_STORAGE_EVENT_KEY = `${AUTH_STORAGE_KEY}:tab-sync`;

type AuthTabSyncListener = (message: AuthTabSyncMessage) => void;

let channel: BroadcastChannel | null | undefined;

function getBroadcastChannel(): BroadcastChannel | null {
  if (channel !== undefined) return channel;
  if (typeof BroadcastChannel === "undefined") {
    channel = null;
    return null;
  }
  try {
    channel = new BroadcastChannel(AUTH_TAB_CHANNEL);
  } catch {
    channel = null;
  }
  return channel;
}

/** Notify other tabs of an auth state change (same tab is not notified). */
export function broadcastAuthTabMessage(message: AuthTabSyncMessage): void {
  const bc = getBroadcastChannel();
  if (bc) {
    bc.postMessage(message);
    return;
  }

  try {
    localStorage.setItem(
      AUTH_TAB_STORAGE_EVENT_KEY,
      JSON.stringify({ ...message, ts: Date.now() }),
    );
  } catch {
    // Storage may be unavailable.
  }
}

/** Subscribe to auth changes from other tabs. */
export function subscribeAuthTabMessages(listener: AuthTabSyncListener): () => void {
  const bc = getBroadcastChannel();

  if (bc) {
    const onMessage = (event: MessageEvent<AuthTabSyncMessage>) => {
      if (!event.data?.type) return;
      listener(event.data);
    };
    bc.addEventListener("message", onMessage);
    return () => bc.removeEventListener("message", onMessage);
  }

  const onStorage = (event: StorageEvent) => {
    if (event.key !== AUTH_TAB_STORAGE_EVENT_KEY || !event.newValue) return;
    try {
      const parsed = JSON.parse(event.newValue) as AuthTabSyncMessage & { ts?: number };
      if (parsed.type === "logout" || parsed.type === "session_expired" || parsed.type === "login") {
        listener({ type: parsed.type });
      }
    } catch {
      // Ignore malformed sync payloads.
    }
  };

  window.addEventListener("storage", onStorage);
  return () => window.removeEventListener("storage", onStorage);
}
