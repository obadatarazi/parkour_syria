import { useCallback, useState } from "react";
import { Navigate, useNavigate, useParams } from "react-router";

import { ROUTES } from "@/app/router/routes";
import { useCrudPermissions } from "@/features/auth";
import { CarePlanViewWorkspace } from "@/features/care-plans/components/CarePlanViewWorkspace";
import { useCarePlanMutations } from "@/features/care-plans/hooks/use-care-plan-mutations";
import { carePlansService } from "@/features/care-plans/services/care-plans.service";
import type { CarePlanCycle } from "@/features/care-plans/types/care-plans.types";
import { AppButton, ConfirmDialog, ErrorState, LoadingState } from "@/shared/components";
import { PERMISSIONS } from "@/shared/constants/permissions";
import { useCrudQuery } from "@/shared/crud";
import { useTranslation } from "@/shared/design-system/localization/contexts/LocalizationContext";
import { resolveServiceErrorMessage } from "@/shared/errors";

export function CarePlanViewPage() {
  const t = useTranslation();
  const navigate = useNavigate();
  const { carePlanId: carePlanIdParam } = useParams();
  const carePlanId = Number(carePlanIdParam);
  const isValidId = Number.isFinite(carePlanId) && carePlanId > 0;
  const { canShow, canUpdate, canDelete } = useCrudPermissions(PERMISSIONS.MANAGE_CARE_PLAN);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const {
    data: carePlan,
    isLoading,
    isError,
    error,
    refetch,
    patchData,
  } = useCrudQuery({
    queryKey: ["care-plans", "detail", String(carePlanId || "")],
    queryFn: (signal) => carePlansService.getById(carePlanId, signal),
    enabled: isValidId,
  });

  const {
    deleteMutation,
    pauseMutation,
    resumeMutation,
    cancelMutation,
    skipCycleMutation,
    isDeleting,
    isLifecyclePending,
    isSkippingCycle,
  } = useCarePlanMutations({
    onSuccess: async () => {
      await refetch();
    },
  });

  const goToList = useCallback(() => {
    navigate(ROUTES.admin.carePlans);
  }, [navigate]);

  if (!canShow && !canUpdate && !canDelete) {
    return <Navigate to={ROUTES.admin.carePlans} replace />;
  }

  if (!isValidId) {
    return (
      <div className="p-6">
        <ErrorState
          title={t.carePlanNotFound}
          action={
            <AppButton type="button" variant="outline" onClick={goToList}>
              {t.backToCarePlans}
            </AppButton>
          }
        />
      </div>
    );
  }

  if (isLoading && !carePlan) {
    return <LoadingState label={t.loadingMessage} className="min-h-[50vh]" />;
  }

  if (isError) {
    return (
      <div className="p-6">
        <ErrorState
          title={t.errorStateDefaultTitle}
          description={resolveServiceErrorMessage(error, t)}
          action={
            <AppButton type="button" variant="outline" onClick={() => void refetch()}>
              {t.tryAgain}
            </AppButton>
          }
        />
      </div>
    );
  }

  if (!carePlan) {
    return (
      <div className="p-6">
        <ErrorState
          title={t.carePlanNotFound}
          action={
            <AppButton type="button" variant="outline" onClick={goToList}>
              {t.backToCarePlans}
            </AppButton>
          }
        />
      </div>
    );
  }

  const applyLifecycleResult = async (
    mutate: () => Promise<{ ok: boolean; data?: typeof carePlan }>,
  ) => {
    const result = await mutate();
    if (result.ok && result.data) {
      patchData(() => result.data!);
    }
  };

  return (
    <>
      <CarePlanViewWorkspace
        carePlan={carePlan}
        canUpdate={canUpdate}
        canDelete={canDelete}
        isLifecyclePending={isLifecyclePending}
        isSkippingCycle={isSkippingCycle}
        onBack={goToList}
        onDelete={() => setIsDeleteOpen(true)}
        onPause={() => void applyLifecycleResult(() => pauseMutation.mutate(carePlan))}
        onResume={() => void applyLifecycleResult(() => resumeMutation.mutate(carePlan))}
        onCancelPlan={() => void applyLifecycleResult(() => cancelMutation.mutate(carePlan))}
        onSkipCycle={(cycle: CarePlanCycle) =>
          void applyLifecycleResult(() =>
            skipCycleMutation.mutate({ carePlanId: carePlan.id, cycleId: cycle.id }),
          )
        }
      />

      <ConfirmDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        title={t.carePlanCancelTitle}
        description={t.carePlanCancelDescription}
        confirmLabel={t.carePlanCancelAction}
        cancelLabel={t.cancel}
        variant="destructive"
        isLoading={isDeleting}
        onConfirm={async () => {
          const result = await deleteMutation.mutate(carePlan);
          if (result.ok) {
            setIsDeleteOpen(false);
            navigate(ROUTES.admin.carePlans);
          }
        }}
      />
    </>
  );
}
