import { useMemo } from "react";

import { paymentProvidersService } from "@/features/payment-providers/services/payment-providers.service";
import { useCrudQuery } from "@/shared/crud";
import {
  formatBilingualLabel,
  getBilingualTitle,
} from "@/shared/lib/translation-display.utils";

export function useCarePlanPaymentProviderOptions(enabled = true) {
  const query = useCrudQuery({
    queryKey: ["payment-providers", "care-plan-options"],
    queryFn: (signal) =>
      paymentProvidersService.list({ page: 1, limit: 100, publish: true }, signal),
    enabled,
  });

  const options = useMemo(
    () =>
      (query.data?.data ?? []).map((provider) => {
        const title = getBilingualTitle(provider.translations, provider.title);
        return {
          value: String(provider.id),
          label: formatBilingualLabel(title) || `#${provider.id}`,
        };
      }),
    [query.data?.data],
  );

  return {
    ...query,
    options,
  };
}
