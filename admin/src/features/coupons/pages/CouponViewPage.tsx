import { useCallback, useState } from "react";
import { Navigate, useNavigate, useParams } from "react-router";

import { couponViewPath, decodeAdminRouteKey, ROUTES } from "@/app/router/routes";
import { useCrudPermissions } from "@/features/auth";
import { CouponViewWorkspace } from "@/features/coupons/components/CouponViewWorkspace";
import { useCouponMutations } from "@/features/coupons/hooks/use-coupon-mutations";
import { couponsService } from "@/features/coupons/services/coupons.service";
import { AppButton, ErrorState, LoadingState } from "@/shared/components";
import { PERMISSIONS } from "@/shared/constants/permissions";
import { CrudDeleteDialog, useCrudQuery } from "@/shared/crud";
import { useTranslation } from "@/shared/design-system/localization/contexts/LocalizationContext";
import { resolveServiceErrorMessage } from "@/shared/errors";
import { useCanonicalAdminRoute } from "@/shared/hooks/use-canonical-admin-route";
import {
  formatBilingualLabel,
  getBilingualTitle,
} from "@/shared/lib/translation-display.utils";

export function CouponViewPage() {
  const t = useTranslation();
  const navigate = useNavigate();
  const { couponKey: couponKeyParam } = useParams();
  const routeKey = decodeAdminRouteKey(couponKeyParam);
  const { canShow, canUpdate, canDelete } = useCrudPermissions(PERMISSIONS.MANAGE_COUPON);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const {
    data: coupon,
    isLoading,
    isError,
    error,
    refetch,
  } = useCrudQuery({
    queryKey: ["coupons", "detail", routeKey ?? ""],
    queryFn: (signal) => couponsService.resolveRouteKey(routeKey!, signal),
    enabled: Boolean(routeKey),
  });

  useCanonicalAdminRoute({
    routeKey,
    canonicalKey: coupon?.code,
    buildPath: couponViewPath,
    enabled: Boolean(coupon?.code),
  });

  const { deleteMutation, isDeleting } = useCouponMutations({
    onSuccess: async () => {
      await refetch();
    },
  });

  const goToList = useCallback(() => {
    navigate(ROUTES.admin.coupons);
  }, [navigate]);

  if (!canShow && !canUpdate && !canDelete) {
    return <Navigate to={ROUTES.admin.coupons} replace />;
  }

  if (!routeKey) {
    return (
      <div className="p-6">
        <ErrorState
          title={t.couponNotFound}
          action={
            <AppButton type="button" variant="outline" onClick={goToList}>
              {t.backToCoupons}
            </AppButton>
          }
        />
      </div>
    );
  }

  if (isLoading && !coupon) {
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

  if (!coupon) {
    return (
      <div className="p-6">
        <ErrorState
          title={t.couponNotFound}
          action={
            <AppButton type="button" variant="outline" onClick={goToList}>
              {t.backToCoupons}
            </AppButton>
          }
        />
      </div>
    );
  }

  const deleteLabel = formatBilingualLabel(getBilingualTitle(coupon.translations, coupon.title));

  return (
    <>
      <CouponViewWorkspace
        coupon={coupon}
        canUpdate={canUpdate}
        canDelete={canDelete}
        onBack={goToList}
        onDelete={() => setIsDeleteOpen(true)}
      />

      <CrudDeleteDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        entityLabel={deleteLabel}
        isLoading={isDeleting}
        onConfirm={async () => {
          const result = await deleteMutation.mutate(coupon);
          if (result.ok) {
            setIsDeleteOpen(false);
            navigate(ROUTES.admin.coupons);
          }
        }}
      />
    </>
  );
}
