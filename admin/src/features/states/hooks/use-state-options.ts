import { useCallback, useMemo } from "react";

import { statesService } from "@/features/states/services/states.service";
import type { State } from "@/features/states/types/states.types";
import { useCrudQuery } from "@/shared/crud";
import {
  formatBilingualLabel,
  getBilingualTitle,
} from "@/shared/lib/translation-display.utils";

const STATE_OPTIONS_STALE_TIME_MS = 30 * 60 * 1000;

export function useStateOptions() {
  const queryFn = useCallback(
    (signal?: AbortSignal) => statesService.list({ limit: 200, publish: true }, signal),
    [],
  );

  const query = useCrudQuery({
    queryKey: ["states", "options"],
    queryFn,
    staleTime: STATE_OPTIONS_STALE_TIME_MS,
  });

  const options = useMemo(
    () =>
      (query.data?.data ?? [])
        .map((state: State) => ({
          value: String(state.id),
          label: formatBilingualLabel(getBilingualTitle(state.translations, state.title)),
        }))
        .sort((a, b) => a.label.localeCompare(b.label)),
    [query.data?.data],
  );

  return {
    options,
    isLoading: query.isLoading,
  };
}
