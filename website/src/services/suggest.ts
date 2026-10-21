import type { SuggestionPayload } from '@/types';

/** Local success only — no network. */
export function submitSuggestion(payload: SuggestionPayload): Promise<void> {
  void payload;
  return Promise.resolve();
}
