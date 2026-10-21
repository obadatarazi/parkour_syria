import { useMemo } from "react";

import { SelectField } from "@/shared/components";
import { useCrudQuery } from "@/shared/crud";
import { useTranslation } from "@/shared/design-system/localization/contexts/LocalizationContext";
import { apiRequest, type LaravelSuccessResponse } from "@/shared/lib/api";

export type CarePlanUserAddressOption = {
  id: number;
  title?: string | null;
  phoneNumber?: string | null;
  deliveryZoneId?: number | null;
  isDefault?: boolean;
  streetTitle?: string | null;
  block?: string | null;
};

type CarePlanUserAddressPickerProps = {
  userId: number | null;
  value: number | null;
  onSelect: (address: CarePlanUserAddressOption) => void;
  onClear: () => void;
  disabled?: boolean;
  error?: string;
  required?: boolean;
};

async function fetchUserAddresses(
  userId: number,
  signal?: AbortSignal,
): Promise<CarePlanUserAddressOption[]> {
  const response = await apiRequest<LaravelSuccessResponse<CarePlanUserAddressOption[]>>(
    "/admin/care-plans/user-addresses",
    {
      signal,
      params: { userId },
    },
  );
  return response.data ?? [];
}

function getCarePlanUserAddressLabel(address: CarePlanUserAddressOption): string {
  const title = address.title?.trim() || `#${address.id}`;
  const line = [address.streetTitle?.trim(), address.block?.trim()].filter(Boolean).join(", ");
  const suffix = address.isDefault ? " · default" : "";
  return line ? `${title} — ${line}${suffix}` : `${title}${suffix}`;
}

export function CarePlanUserAddressPicker({
  userId,
  value,
  onSelect,
  onClear,
  disabled = false,
  error,
  required = false,
}: CarePlanUserAddressPickerProps) {
  const t = useTranslation();

  const query = useCrudQuery<CarePlanUserAddressOption[]>({
    queryKey: ["care-plans", "user-addresses", String(userId ?? "")],
    queryFn: (signal) => fetchUserAddresses(userId as number, signal),
    enabled: userId != null && userId > 0,
  });

  const options = useMemo(() => {
    const rows = query.data ?? [];
    return rows.map((address) => ({
      value: String(address.id),
      label: getCarePlanUserAddressLabel(address),
    }));
  }, [query.data]);

  const helperText =
    userId == null
      ? t.carePlanSelectCustomerFirst
      : query.isLoading
        ? t.loadingMessage
        : query.isError
          ? t.errorStateDefaultTitle
          : (query.data?.length ?? 0) === 0
            ? t.carePlanNoAddresses
            : undefined;

  return (
    <SelectField
      label={t.carePlanUserAddress}
      value={value == null ? "" : String(value)}
      onValueChange={(next) => {
        if (!next) {
          onClear();
          return;
        }
        const address = (query.data ?? []).find((row) => row.id === Number(next));
        if (address) onSelect(address);
      }}
      options={options}
      placeholder={t.carePlanSelectAddress}
      required={required}
      error={error}
      helperText={helperText}
      disabled={disabled || userId == null || query.isLoading}
    />
  );
}
