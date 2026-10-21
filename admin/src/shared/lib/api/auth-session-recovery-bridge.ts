/**
 * Bridge between the fetch API client and auth session recovery.
 * Kept in shared/api so api-client does not import the auth feature layer.
 */

export type AuthSessionRecoveryHandlers = {
  /** Single-flight refresh; resolves when new tokens are stored. */
  refreshSession: () => Promise<void>;
  /** Idempotent local session teardown + UI notification side effects via subscribers. */
  endSession: () => void;
};

let handlers: AuthSessionRecoveryHandlers | null = null;

export function registerAuthSessionRecoveryHandlers(
  next: AuthSessionRecoveryHandlers | null,
): void {
  handlers = next;
}

export function getAuthSessionRecoveryHandlers(): AuthSessionRecoveryHandlers | null {
  return handlers;
}
