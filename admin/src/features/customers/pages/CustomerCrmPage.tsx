import { ArrowLeft } from "lucide-react";
import { useCallback } from "react";
import { Navigate, useNavigate, useParams } from "react-router";

import { ROUTES } from "@/app/router/routes";
import { useCrudPermissions } from "@/features/auth";
import { CustomerCrmWorkspace } from "@/features/customers/components/CustomerCrmWorkspace";
import { customersService } from "@/features/customers/services/customers.service";
import type { CrmCustomer } from "@/features/customers/types/customers.types";
import {
  AppButton,
  ErrorState,
  LoadingState,
  PageContainer,
  PageHeader,
} from "@/shared/components";
import { PERMISSIONS } from "@/shared/constants/permissions";
import { useCrudQuery } from "@/shared/crud";
import { useTranslation } from "@/shared/design-system/localization/contexts/LocalizationContext";
import { resolveServiceErrorMessage } from "@/shared/errors";

export function CustomerCrmPage() {
  const t = useTranslation();
  const navigate = useNavigate();
  const { customerId: customerIdParam } = useParams();
  const customerId = Number(customerIdParam);
  const isValidId = Number.isFinite(customerId) && customerId > 0;
  const { canShow } = useCrudPermissions(PERMISSIONS.MANAGE_CUSTOMER);

  const queryFn = useCallback(
    (signal?: AbortSignal) => customersService.getById(customerId, signal),
    [customerId],
  );

  const { data, isLoading, isError, error, refetch, patchData } = useCrudQuery<CrmCustomer>({
    queryKey: ["crm-customers", "detail", String(customerId || "")],
    queryFn,
    enabled: isValidId,
  });

  const goToList = useCallback(() => {
    navigate(ROUTES.admin.customers);
  }, [navigate]);

  if (!canShow) {
    return <Navigate to={ROUTES.admin.customers} replace />;
  }

  if (!isValidId) {
    return (
      <PageContainer>
        <ErrorState
          title={t.crmCustomerNotFound}
          action={
            <AppButton type="button" variant="outline" onClick={goToList}>
              {t.crmBackToList}
            </AppButton>
          }
        />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader
        title={data?.fullName ?? t.crmCustomerFile}
        description={t.crmFileDescription}
        actions={
          <AppButton variant="outline" onClick={goToList}>
            <ArrowLeft className="size-4" aria-hidden="true" />
            {t.crmBackToList}
          </AppButton>
        }
      />

      {isLoading && !data ? <LoadingState label={t.loadingMessage} /> : null}

      {isError || (!isLoading && !data) ? (
        <ErrorState
          title={t.errorStateDefaultTitle}
          description={resolveServiceErrorMessage(error, t)}
          action={
            <AppButton variant="outline" onClick={() => void refetch()}>
              {t.tryAgain}
            </AppButton>
          }
        />
      ) : null}

      {data ? (
        <CustomerCrmWorkspace
          customer={data}
          onCustomerChange={(customer) => patchData(() => customer)}
          onRefresh={refetch}
        />
      ) : null}
    </PageContainer>
  );
}
