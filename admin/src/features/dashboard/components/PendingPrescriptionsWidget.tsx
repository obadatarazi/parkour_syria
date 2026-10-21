import { Check, FileText, X } from "lucide-react";
import { Link } from "react-router";

import { prescriptionEditPath, prescriptionViewPath, ROUTES } from "@/app/router/routes";
import { useCrudPermissions } from "@/features/auth";
import { usePrescriptionMutations } from "@/features/prescriptions/hooks/use-prescription-mutations";
import { prescriptionsService } from "@/features/prescriptions/services/prescriptions.service";
import { PRESCRIPTION_STATUS } from "@/features/prescriptions/types/prescriptions.types";
import { getPrescriptionCustomerLabel } from "@/features/prescriptions/types/prescriptions.types";
import { AppButton, AppCard, ErrorState, LoadingState } from "@/shared/components";
import { PERMISSIONS } from "@/shared/constants/permissions";
import { useCrudQuery } from "@/shared/crud";
import { useTranslation } from "@/shared/design-system/localization/contexts/LocalizationContext";
import { resolveServiceErrorMessage } from "@/shared/errors";

export function PendingPrescriptionsWidget() {
  const t = useTranslation();
  const { canShow, canUpdate } = useCrudPermissions(PERMISSIONS.MANAGE_PRESCRIPTION);

  const { data, isLoading, isError, error, refetch } = useCrudQuery({
    queryKey: ["prescriptions", "pending-widget"],
    queryFn: (signal) =>
      prescriptionsService.list(
        {
          page: 1,
          limit: 5,
          status: PRESCRIPTION_STATUS.PENDING,
          sort: "created_at",
          direction: "desc",
        },
        signal,
      ),
    enabled: canShow || canUpdate,
  });

  const { quickUpdateStatus, isStatusUpdating } = usePrescriptionMutations({
    onSuccess: async () => {
      await refetch();
    },
  });

  if (!canShow && !canUpdate) {
    return null;
  }

  const items = data?.data ?? [];

  return (
    <AppCard padding="none" className="overflow-hidden">
      <div className="flex items-center justify-between border-b border-border/60 px-5 py-3.5">
        <h3 className="flex items-center gap-2 text-sm font-bold text-foreground">
          <FileText className="size-4 text-info" aria-hidden="true" />
          {t.pendingReview}
        </h3>
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-info-muted px-2 py-0.5 text-xs font-bold text-info">
            {data?.total ?? items.length}
          </span>
          <Link
            to={ROUTES.admin.prescriptions}
            className="text-xs font-medium text-brand hover:underline"
          >
            {t.viewAction}
          </Link>
        </div>
      </div>

      {isLoading ? (
        <div className="px-4 py-6">
          <LoadingState label={t.loadingMessage} />
        </div>
      ) : isError ? (
        <div className="px-4 py-6">
          <ErrorState
            title={t.errorStateDefaultTitle}
            description={resolveServiceErrorMessage(error, t)}
            action={
              <AppButton variant="outline" size="sm" onClick={() => void refetch()}>
                {t.tryAgain}
              </AppButton>
            }
          />
        </div>
      ) : items.length === 0 ? (
        <p className="px-4 py-6 text-center text-sm text-muted-foreground">{t.noData}</p>
      ) : (
        <div className="divide-y divide-border/40">
          {items.map((item) => (
            <div key={item.id} className="flex items-center gap-3 px-4 py-3">
              <div className="min-w-0 flex-1">
                <Link
                  to={canUpdate ? prescriptionEditPath(item) : prescriptionViewPath(item)}
                  className="text-xs font-bold text-foreground hover:text-brand hover:underline"
                >
                  {item.prescriptionNumber || `#${item.id}`}
                </Link>
                <p className="truncate text-xs text-muted-foreground">
                  {getPrescriptionCustomerLabel(item, t.notSet)}
                  {item.productsCount != null ? ` · ${item.productsCount}` : ""}
                </p>
              </div>
              {canUpdate ? (
                <div className="flex items-center gap-1">
                  <AppButton
                    variant="ghost"
                    size="icon"
                    className="size-6 bg-success-muted text-success hover:bg-success-muted/80"
                    aria-label={t.approveAction}
                    disabled={isStatusUpdating}
                    onClick={() => void quickUpdateStatus(item, PRESCRIPTION_STATUS.APPROVED)}
                  >
                    <Check className="size-3.5" aria-hidden="true" />
                  </AppButton>
                  <AppButton
                    variant="ghost"
                    size="icon"
                    className="size-6 bg-destructive/10 text-destructive hover:bg-destructive/15"
                    aria-label={t.rejectAction}
                    disabled={isStatusUpdating}
                    onClick={() => void quickUpdateStatus(item, PRESCRIPTION_STATUS.REJECTED)}
                  >
                    <X className="size-3.5" aria-hidden="true" />
                  </AppButton>
                </div>
              ) : null}
            </div>
          ))}
        </div>
      )}
    </AppCard>
  );
}
