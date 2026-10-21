import { CalendarRange, Copy, Gift, History, Pencil, TicketPercent, Trash2 } from "lucide-react";
import { useState } from "react";

import { ROUTES } from "@/app/router/routes";
import { formatKwd } from "@/features/products/utils/product-display.utils";
import { BogoDealsPanel } from "@/features/promotions/components/BogoDealsPanel";
import type { Promotion } from "@/features/promotions/types/promotions.types";
import { AppButton, StatusBadge } from "@/shared/components";
import { CrudDetailField, CrudRecordSection, CrudRecordWorkspace } from "@/shared/crud";
import { useTranslation } from "@/shared/design-system/localization/contexts/LocalizationContext";
import { formatDateTime } from "@/shared/lib/datetime.utils";
import { notify } from "@/shared/lib/notifications";
import {
  formatBilingualLabel,
  getBilingualTitle,
} from "@/shared/lib/translation-display.utils";

type PromotionViewSectionId = "offer" | "schedule" | "deals" | "usage";

type PromotionViewWorkspaceProps = {
  promotion: Promotion;
  canUpdate: boolean;
  canDelete: boolean;
  canManageDeals?: boolean;
  onBack: () => void;
  onDelete: () => void;
  onEdit: () => void;
};

function EmptyValue({ label }: { label: string }) {
  return <span className="text-muted-foreground">{label}</span>;
}

export function PromotionViewWorkspace({
  promotion,
  canUpdate,
  canDelete,
  canManageDeals = false,
  onBack,
  onDelete,
  onEdit,
}: PromotionViewWorkspaceProps) {
  const t = useTranslation();
  const [activeSection, setActiveSection] = useState<PromotionViewSectionId>("offer");

  const bilingual = getBilingualTitle(promotion.translations, promotion.name ?? promotion.code);
  const primaryLabel = formatBilingualLabel(bilingual) || promotion.code;

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(promotion.code);
      notify.success(t.promotionCodeCopied);
    } catch {
      notify.error(t.errorMessage);
    }
  };

  const sectionItems = [
    { id: "offer" as const, label: t.promotionOfferSection, icon: TicketPercent },
    { id: "schedule" as const, label: t.promotionScheduleSection, icon: CalendarRange },
    { id: "deals" as const, label: t.bogoDeals, icon: Gift },
    { id: "usage" as const, label: t.promotionUsageSection, icon: History },
  ];

  return (
    <CrudRecordWorkspace
      breadcrumbHref={ROUTES.admin.promotions}
      breadcrumbLabel={t.promotions}
      title={primaryLabel}
      subtitle={t.viewPromotion}
      meta={
        <StatusBadge
          label={promotion.isActive ? t.active : t.inactive}
          variant={promotion.isActive ? "success" : "neutral"}
        />
      }
      onBack={onBack}
      backLabel={t.backToPromotions}
      headerActions={
        <>
          <AppButton type="button" variant="outline" onClick={() => void copyCode()}>
            <Copy className="size-4" />
            {t.copyCode}
          </AppButton>
          {canUpdate ? (
            <AppButton type="button" onClick={onEdit}>
              <Pencil className="size-4" />
              {t.editAction}
            </AppButton>
          ) : null}
          {canDelete ? (
            <AppButton type="button" variant="destructive" onClick={onDelete}>
              <Trash2 className="size-4" />
              {t.deleteAction}
            </AppButton>
          ) : null}
        </>
      }
      sections={sectionItems}
      activeSection={activeSection}
      onSectionChange={setActiveSection}
      sectionsAriaLabel={t.promotionFormSections}
    >
      {activeSection === "offer" ? (
        <CrudRecordSection title={t.promotionOfferSection}>
          <div className="grid gap-4 sm:grid-cols-2">
            <CrudDetailField label={t.promotionCode}>{promotion.code}</CrudDetailField>
            <CrudDetailField label={t.bogoPromotionType}>
              {promotion.type?.label ?? promotion.type?.value ?? "—"}
            </CrudDetailField>
            <CrudDetailField label={t.titleEnglish}>
              {promotion.translations?.en?.title || promotion.name || "—"}
            </CrudDetailField>
            <CrudDetailField label={t.titleArabic}>
              {promotion.translations?.ar?.title || "—"}
            </CrudDetailField>
            <CrudDetailField label={t.promotionPriority}>
              {String(promotion.priority ?? 0)}
            </CrudDetailField>
            <CrudDetailField label={t.promotionIsRequireLogin}>
              {promotion.isRequireLogin ? t.yes : t.no}
            </CrudDetailField>
            <CrudDetailField label={t.descriptionEnglish}>
              {promotion.translations?.en?.description ||
                promotion.description || <EmptyValue label={t.notSet} />}
            </CrudDetailField>
            <CrudDetailField label={t.descriptionArabic}>
              {promotion.translations?.ar?.description || <EmptyValue label={t.notSet} />}
            </CrudDetailField>
          </div>
        </CrudRecordSection>
      ) : null}

      {activeSection === "schedule" ? (
        <CrudRecordSection title={t.promotionScheduleSection}>
          <div className="grid gap-4 sm:grid-cols-2">
            <CrudDetailField label={t.promotionStartsAt}>
              {promotion.startsAt ? formatDateTime(promotion.startsAt) : t.promotionLifetime}
            </CrudDetailField>
            <CrudDetailField label={t.promotionEndsAt}>
              {promotion.endsAt ? formatDateTime(promotion.endsAt) : t.promotionLifetime}
            </CrudDetailField>
            <CrudDetailField label={t.promotionUsageLimit}>
              {promotion.usageLimit == null || promotion.isUnlimitedUsage
                ? t.couponUsageUnlimited
                : String(promotion.usageLimit)}
            </CrudDetailField>
            <CrudDetailField label={t.promotionUsageLimitPerUser}>
              {promotion.usageLimitPerUser == null || promotion.isUnlimitedUsagePerUser
                ? t.couponUsageUnlimited
                : String(promotion.usageLimitPerUser)}
            </CrudDetailField>
          </div>
        </CrudRecordSection>
      ) : null}

      {activeSection === "deals" ? (
        <CrudRecordSection title={t.bogoDeals} description={t.bogoDealsHint}>
          <BogoDealsPanel
            promotionId={promotion.id}
            canCreate={canManageDeals && canUpdate}
            canUpdate={canManageDeals && canUpdate}
            canDelete={canManageDeals && canDelete}
            readOnly={!canUpdate}
          />
        </CrudRecordSection>
      ) : null}

      {activeSection === "usage" ? (
        <CrudRecordSection title={t.promotionUsageSection}>
          <div className="mb-4 grid gap-4 sm:grid-cols-4">
            <CrudDetailField label={t.promotionUsedCount}>
              {String(promotion.usageSummary?.usedCount ?? 0)}
            </CrudDetailField>
            <CrudDetailField label={t.promotionRemaining}>
              {promotion.usageSummary?.remaining == null
                ? t.couponUsageUnlimited
                : String(promotion.usageSummary.remaining)}
            </CrudDetailField>
            <CrudDetailField label={t.promotionUsageLimit}>
              {promotion.usageSummary?.usageLimit == null
                ? t.couponUsageUnlimited
                : String(promotion.usageSummary.usageLimit)}
            </CrudDetailField>
            <CrudDetailField label={t.promotionTotalGivenAway}>
              {formatKwd(promotion.usageSummary?.totalGivenAway ?? 0)}
            </CrudDetailField>
          </div>

          {(promotion.usages?.length ?? 0) > 0 ? (
            <div className="overflow-x-auto rounded-xl border border-border/70">
              <table className="min-w-full text-sm">
                <thead className="bg-muted/40 text-start text-xs text-muted-foreground">
                  <tr>
                    <th className="px-3 py-2 font-medium">{t.customer}</th>
                    <th className="px-3 py-2 font-medium">{t.orders}</th>
                    <th className="px-3 py-2 font-medium">{t.promotionGivenAway}</th>
                    <th className="px-3 py-2 font-medium">{t.promotionUsedAt}</th>
                  </tr>
                </thead>
                <tbody>
                  {(promotion.usages ?? []).map((usage) => (
                    <tr key={usage.id} className="border-t border-border/60">
                      <td className="px-3 py-2">
                        {usage.userName || usage.userEmail || usage.cartUuid || "—"}
                      </td>
                      <td className="px-3 py-2 font-mono text-xs">
                        {usage.orderRefNumber || (usage.orderId ? `#${usage.orderId}` : "—")}
                      </td>
                      <td className="px-3 py-2">{formatKwd(usage.pricePromotions)}</td>
                      <td className="px-3 py-2">
                        {usage.usedAt ? formatDateTime(usage.usedAt) : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">{t.promotionUsagesEmpty}</p>
          )}
        </CrudRecordSection>
      ) : null}
    </CrudRecordWorkspace>
  );
}
