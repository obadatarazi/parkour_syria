import { useCallback } from "react";
import { Navigate, useNavigate, useParams } from "react-router";

import { decodeAdminRouteKey, orderViewPath, ROUTES } from "@/app/router/routes";
import { useAbility, useCrudPermissions } from "@/features/auth";
import { OrderViewWorkspace } from "@/features/orders/components/OrderViewWorkspace";
import { ordersService } from "@/features/orders/services/orders.service";
import { AppButton, ErrorState, LoadingState } from "@/shared/components";
import { PERMISSIONS } from "@/shared/constants/permissions";
import { useCrudQuery } from "@/shared/crud";
import { useTranslation } from "@/shared/design-system/localization/contexts/LocalizationContext";
import { resolveServiceErrorMessage } from "@/shared/errors";
import { useCanonicalAdminRoute } from "@/shared/hooks/use-canonical-admin-route";

export function OrderViewPage() {
  const t = useTranslation();
  const navigate = useNavigate();
  const ability = useAbility();
  const { orderKey: orderKeyParam } = useParams();
  const routeKey = decodeAdminRouteKey(orderKeyParam);
  const { canShow, canUpdate, canDelete } = useCrudPermissions(PERMISSIONS.MANAGE_ORDER);
  const canDownloadPackingSlip = ability.can(PERMISSIONS.PERMISSION_DOWNLOAD_ORDER, "all");
  const canDownloadInvoice = ability.can(PERMISSIONS.PERMISSION_DOWNLOAD_INVOICE, "all");

  const {
    data: order,
    isLoading,
    isError,
    error,
    refetch,
  } = useCrudQuery({
    queryKey: ["orders", "detail", routeKey ?? ""],
    queryFn: (signal) => ordersService.resolveRouteKey(routeKey!, signal),
    enabled: Boolean(routeKey),
  });

  useCanonicalAdminRoute({
    routeKey,
    canonicalKey: order?.orderRefNumber,
    buildPath: orderViewPath,
    enabled: Boolean(order),
  });

  const goToList = useCallback(() => {
    navigate(ROUTES.admin.orders);
  }, [navigate]);

  if (!canShow && !canUpdate && !canDelete) {
    return <Navigate to={ROUTES.admin.orders} replace />;
  }

  if (!routeKey) {
    return (
      <div className="p-6">
        <ErrorState
          title={t.orderNotFound}
          action={
            <AppButton type="button" variant="outline" onClick={goToList}>
              {t.backToOrders}
            </AppButton>
          }
        />
      </div>
    );
  }

  if (isLoading && !order) {
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

  if (!order) {
    return (
      <div className="p-6">
        <ErrorState
          title={t.orderNotFound}
          action={
            <AppButton type="button" variant="outline" onClick={goToList}>
              {t.backToOrders}
            </AppButton>
          }
        />
      </div>
    );
  }

  return (
    <OrderViewWorkspace
      order={order}
      canUpdate={canUpdate}
      canDownloadPackingSlip={canDownloadPackingSlip}
      canDownloadInvoice={canDownloadInvoice}
      onBack={goToList}
    />
  );
}
