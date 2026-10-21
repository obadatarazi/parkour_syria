import { Gift, Pencil, Plus, Trash2 } from "lucide-react";
import { useCallback, useMemo, useState } from "react";

import { formatKwd } from "@/features/products/utils/product-display.utils";
import {
  BogoConditionForm,
  BogoRewardForm,
} from "@/features/promotions/components/BogoItemForms";
import { useBogoDealMutations } from "@/features/promotions/hooks/use-bogo-deal-mutations";
import { bogoPromotionsService } from "@/features/promotions/services/bogo-promotions.service";
import type {
  BogoCondition,
  BogoPromotion,
  BogoPromotionFormData,
  BogoReward,
} from "@/features/promotions/types/promotions.types";
import {
  bogoDealToFormData,
  createEmptyBogoDealForm,
} from "@/features/promotions/types/promotions.types";
import { handleNestedFormEnter } from "@/features/promotions/utils/nested-form-enter.utils";
import { AppButton, TextField } from "@/shared/components";
import { CrudDeleteDialog, useCrudDialog, useCrudQuery } from "@/shared/crud";
import { Skeleton } from "@/shared/design-system/components/ui/skeleton";
import { useTranslation } from "@/shared/design-system/localization/contexts/LocalizationContext";
import { resolveServiceErrorMessage } from "@/shared/errors";

type ActiveForm =
  | { kind: "deal"; mode: "create" }
  | { kind: "deal"; mode: "edit"; dealId: number }
  | { kind: "condition"; mode: "create"; dealId: number }
  | { kind: "condition"; mode: "edit"; dealId: number; conditionId: number }
  | { kind: "reward"; mode: "create"; dealId: number }
  | { kind: "reward"; mode: "edit"; dealId: number; rewardId: number }
  | null;

type BogoDealsPanelProps = {
  promotionId: number;
  canCreate?: boolean;
  canUpdate?: boolean;
  canDelete?: boolean;
  readOnly?: boolean;
  onChanged?: () => void | Promise<void>;
};

function itemLabel(item?: { title?: string | null; skuCode?: string | null } | null): string {
  if (!item) return "—";
  const title = item.title?.trim();
  const sku = item.skuCode?.trim();
  if (title && sku) return `${title} · ${sku}`;
  return title || sku || "—";
}

function DealForm({
  promotionId,
  entity,
  isLoading,
  onCancel,
  onSubmit,
}: {
  promotionId: number;
  entity?: BogoPromotion | null;
  isLoading?: boolean;
  onCancel: () => void;
  onSubmit: (data: BogoPromotionFormData) => void | Promise<void>;
}) {
  const t = useTranslation();
  const [form, setForm] = useState<BogoPromotionFormData>(
    entity ? bogoDealToFormData(entity) : createEmptyBogoDealForm(promotionId),
  );

  const submit = () => {
    void onSubmit(form);
  };

  return (
    <div
      className="space-y-4 rounded-xl border border-border/70 bg-muted/20 p-4"
      onKeyDown={(event) => handleNestedFormEnter(event, submit, isLoading)}
    >
      <div className="grid gap-4 sm:grid-cols-3">
        <TextField
          label={t.bogoBuyQuantity}
          type="number"
          min={1}
          value={String(form.buyQuantity)}
          onChange={(event) => {
            const raw = event.target.value;
            setForm((current) => ({
              ...current,
              buyQuantity: raw === "" ? 1 : Math.max(1, Number(raw) || 1),
            }));
          }}
          helperText={t.bogoBuyQuantityHint}
          required
        />
        <TextField
          label={t.bogoGetQuantity}
          type="number"
          min={1}
          value={String(form.getQuantity)}
          onChange={(event) => {
            const raw = event.target.value;
            setForm((current) => ({
              ...current,
              getQuantity: raw === "" ? 1 : Math.max(1, Number(raw) || 1),
            }));
          }}
          helperText={t.bogoGetQuantityHint}
          required
        />
        <TextField
          label={t.bogoMaxRewards}
          type="number"
          min={0}
          value={form.maxRewards == null ? "" : String(form.maxRewards)}
          onChange={(event) => {
            const raw = event.target.value;
            setForm((current) => ({
              ...current,
              maxRewards: raw === "" ? null : Math.max(0, Number(raw) || 0),
            }));
          }}
          helperText={t.bogoMaxRewardsHint}
        />
      </div>
      <div className="flex flex-wrap gap-2">
        <AppButton type="button" disabled={isLoading} onClick={submit}>
          {entity ? t.saveChanges : t.addBogoDeal}
        </AppButton>
        <AppButton type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
          {t.cancel}
        </AppButton>
      </div>
    </div>
  );
}

export function BogoDealsPanel({
  promotionId,
  canCreate = false,
  canUpdate = false,
  canDelete = false,
  readOnly = false,
  onChanged,
}: BogoDealsPanelProps) {
  const t = useTranslation();
  const [activeForm, setActiveForm] = useState<ActiveForm>(null);
  const deleteDialog = useCrudDialog<BogoPromotion | BogoCondition | BogoReward>();

  const dealsQuery = useCrudQuery({
    queryKey: ["bogo-promotions", "by-promotion", String(promotionId)],
    queryFn: (signal) =>
      bogoPromotionsService.list(
        {
          promotionId,
          limit: 50,
          sort: "created_at",
          direction: "asc",
        },
        signal,
      ),
    enabled: promotionId > 0,
  });

  const dealIds = useMemo(
    () => (dealsQuery.data?.data ?? []).map((deal) => deal.id).join(","),
    [dealsQuery.data?.data],
  );

  const detailsQuery = useCrudQuery({
    queryKey: ["bogo-promotions", "details", String(promotionId), dealIds],
    queryFn: async (signal) => {
      const deals = dealsQuery.data?.data ?? [];
      return Promise.all(deals.map((deal) => bogoPromotionsService.getById(deal.id, signal)));
    },
    enabled: promotionId > 0 && Boolean(dealIds),
  });

  const deals = detailsQuery.data ?? dealsQuery.data?.data ?? [];

  const refresh = useCallback(async () => {
    await dealsQuery.refetch();
    await detailsQuery.refetch();
    await onChanged?.();
  }, [dealsQuery, detailsQuery, onChanged]);

  const mutations = useBogoDealMutations({
    promotionId,
    onSuccess: refresh,
  });

  const closeForm = () => setActiveForm(null);

  const editingDeal =
    activeForm?.kind === "deal" && activeForm.mode === "edit"
      ? deals.find((deal) => deal.id === activeForm.dealId)
      : null;

  const isLoadingList = dealsQuery.isLoading || (Boolean(dealIds) && detailsQuery.isLoading);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold">{t.bogoDeals}</h3>
          <p className="mt-1 text-sm text-muted-foreground">{t.bogoDealsHint}</p>
        </div>
        {!readOnly && canCreate ? (
          <AppButton
            type="button"
            size="sm"
            onClick={() => setActiveForm({ kind: "deal", mode: "create" })}
          >
            <Plus className="size-4" aria-hidden="true" />
            {t.addBogoDeal}
          </AppButton>
        ) : null}
      </div>

      {activeForm?.kind === "deal" && activeForm.mode === "create" ? (
        <DealForm
          promotionId={promotionId}
          isLoading={mutations.isSaving}
          onCancel={closeForm}
          onSubmit={async (data) => {
            const result = await mutations.createDeal.mutate(data);
            if (result.ok) closeForm();
          }}
        />
      ) : null}

      {isLoadingList ? (
        <div className="space-y-3">
          <Skeleton className="h-28 w-full rounded-xl" />
          <Skeleton className="h-28 w-full rounded-xl" />
        </div>
      ) : dealsQuery.isError ? (
        <div className="space-y-2 rounded-xl border border-destructive/30 bg-destructive/5 p-4">
          <p className="text-sm text-destructive">
            {resolveServiceErrorMessage(dealsQuery.error, t)}
          </p>
          <AppButton type="button" variant="outline" size="sm" onClick={() => void refresh()}>
            {t.tryAgain}
          </AppButton>
        </div>
      ) : deals.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border px-4 py-8 text-center">
          <Gift className="mx-auto size-8 text-muted-foreground/70" aria-hidden="true" />
          <p className="mt-3 text-sm font-medium">{t.bogoDealsEmptyTitle}</p>
          <p className="mt-1 text-sm text-muted-foreground">{t.bogoDealsEmptyDescription}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {deals.map((deal, index) => {
            const isEditingDeal =
              activeForm?.kind === "deal" &&
              activeForm.mode === "edit" &&
              activeForm.dealId === deal.id;
            const conditions = deal.conditions ?? [];
            const rewards = deal.rewards ?? [];

            return (
              <div
                key={deal.id}
                className="rounded-2xl border border-border/70 bg-background p-4 shadow-sm"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold">
                      {t.bogoDealLabel.replace("{n}", String(index + 1))}
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {t.bogoDealSummary
                        .replace("{buy}", String(deal.buyQuantity))
                        .replace("{get}", String(deal.getQuantity))}
                      {deal.maxRewards != null
                        ? ` · ${t.bogoMaxRewards}: ${deal.maxRewards}`
                        : ` · ${t.bogoUnlimitedRewards}`}
                    </p>
                  </div>
                  {!readOnly ? (
                    <div className="flex flex-wrap gap-1">
                      {canUpdate ? (
                        <AppButton
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            setActiveForm({ kind: "deal", mode: "edit", dealId: deal.id })
                          }
                        >
                          <Pencil className="size-3.5" />
                          {t.editAction}
                        </AppButton>
                      ) : null}
                      {canDelete ? (
                        <AppButton
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteDialog.openDelete(deal)}
                        >
                          <Trash2 className="size-3.5" />
                          {t.deleteAction}
                        </AppButton>
                      ) : null}
                    </div>
                  ) : null}
                </div>

                {isEditingDeal ? (
                  <div className="mt-4">
                    <DealForm
                      promotionId={promotionId}
                      entity={editingDeal ?? deal}
                      isLoading={mutations.isSaving}
                      onCancel={closeForm}
                      onSubmit={async (data) => {
                        const result = await mutations.updateDeal.mutate({
                          id: deal.id,
                          data,
                        });
                        if (result.ok) closeForm();
                      }}
                    />
                  </div>
                ) : null}

                <div className="mt-4 grid gap-4 lg:grid-cols-2">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                        {t.bogoConditions}
                      </h4>
                      {!readOnly && canCreate ? (
                        <AppButton
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            setActiveForm({
                              kind: "condition",
                              mode: "create",
                              dealId: deal.id,
                            })
                          }
                        >
                          <Plus className="size-3.5" />
                          {t.addBogoCondition}
                        </AppButton>
                      ) : null}
                    </div>

                    {activeForm?.kind === "condition" &&
                    activeForm.mode === "create" &&
                    activeForm.dealId === deal.id ? (
                      <BogoConditionForm
                        bogoPromotionId={deal.id}
                        isLoading={mutations.isSaving}
                        onCancel={closeForm}
                        onSubmit={async (data) => {
                          const result = await mutations.createCondition.mutate(data);
                          if (result.ok) closeForm();
                        }}
                      />
                    ) : null}

                    {conditions.length === 0 ? (
                      <p className="text-sm text-muted-foreground">{t.bogoConditionsEmpty}</p>
                    ) : (
                      <ul className="space-y-2">
                        {conditions.map((condition) => {
                          const isEditing =
                            activeForm?.kind === "condition" &&
                            activeForm.mode === "edit" &&
                            activeForm.conditionId === condition.id;
                          return (
                            <li
                              key={condition.id}
                              className="rounded-xl border border-border/60 px-3 py-2"
                            >
                              {isEditing ? (
                                <BogoConditionForm
                                  bogoPromotionId={deal.id}
                                  entity={condition}
                                  isLoading={mutations.isSaving}
                                  onCancel={closeForm}
                                  onSubmit={async (data) => {
                                    const result = await mutations.updateCondition.mutate({
                                      id: condition.id,
                                      data,
                                    });
                                    if (result.ok) closeForm();
                                  }}
                                />
                              ) : (
                                <div className="flex items-start justify-between gap-2">
                                  <div>
                                    <p className="text-sm font-medium">
                                      {itemLabel(condition.item)}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                      × {condition.quantity}
                                    </p>
                                  </div>
                                  {!readOnly ? (
                                    <div className="flex gap-1">
                                      {canUpdate ? (
                                        <AppButton
                                          type="button"
                                          variant="ghost"
                                          size="sm"
                                          onClick={() =>
                                            setActiveForm({
                                              kind: "condition",
                                              mode: "edit",
                                              dealId: deal.id,
                                              conditionId: condition.id,
                                            })
                                          }
                                        >
                                          <Pencil className="size-3.5" />
                                        </AppButton>
                                      ) : null}
                                      {canDelete ? (
                                        <AppButton
                                          type="button"
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => deleteDialog.openDelete(condition)}
                                        >
                                          <Trash2 className="size-3.5" />
                                        </AppButton>
                                      ) : null}
                                    </div>
                                  ) : null}
                                </div>
                              )}
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                        {t.bogoRewards}
                      </h4>
                      {!readOnly && canCreate ? (
                        <AppButton
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            setActiveForm({
                              kind: "reward",
                              mode: "create",
                              dealId: deal.id,
                            })
                          }
                        >
                          <Plus className="size-3.5" />
                          {t.addBogoReward}
                        </AppButton>
                      ) : null}
                    </div>

                    {activeForm?.kind === "reward" &&
                    activeForm.mode === "create" &&
                    activeForm.dealId === deal.id ? (
                      <BogoRewardForm
                        bogoPromotionId={deal.id}
                        isLoading={mutations.isSaving}
                        onCancel={closeForm}
                        onSubmit={async (data) => {
                          const result = await mutations.createReward.mutate(data);
                          if (result.ok) closeForm();
                        }}
                      />
                    ) : null}

                    {rewards.length === 0 ? (
                      <p className="text-sm text-muted-foreground">{t.bogoRewardsEmpty}</p>
                    ) : (
                      <ul className="space-y-2">
                        {rewards.map((reward) => {
                          const isEditing =
                            activeForm?.kind === "reward" &&
                            activeForm.mode === "edit" &&
                            activeForm.rewardId === reward.id;
                          return (
                            <li
                              key={reward.id}
                              className="rounded-xl border border-border/60 px-3 py-2"
                            >
                              {isEditing ? (
                                <BogoRewardForm
                                  bogoPromotionId={deal.id}
                                  entity={reward}
                                  isLoading={mutations.isSaving}
                                  onCancel={closeForm}
                                  onSubmit={async (data) => {
                                    const result = await mutations.updateReward.mutate({
                                      id: reward.id,
                                      data,
                                    });
                                    if (result.ok) closeForm();
                                  }}
                                />
                              ) : (
                                <div className="flex items-start justify-between gap-2">
                                  <div>
                                    <p className="text-sm font-medium">{itemLabel(reward.item)}</p>
                                    <p className="text-xs text-muted-foreground">
                                      × {reward.quantity} · {reward.discountValue}%
                                      {reward.unitPrice != null
                                        ? ` · ${formatKwd(reward.unitPrice)}`
                                        : ""}
                                    </p>
                                  </div>
                                  {!readOnly ? (
                                    <div className="flex gap-1">
                                      {canUpdate ? (
                                        <AppButton
                                          type="button"
                                          variant="ghost"
                                          size="sm"
                                          onClick={() =>
                                            setActiveForm({
                                              kind: "reward",
                                              mode: "edit",
                                              dealId: deal.id,
                                              rewardId: reward.id,
                                            })
                                          }
                                        >
                                          <Pencil className="size-3.5" />
                                        </AppButton>
                                      ) : null}
                                      {canDelete ? (
                                        <AppButton
                                          type="button"
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => deleteDialog.openDelete(reward)}
                                        >
                                          <Trash2 className="size-3.5" />
                                        </AppButton>
                                      ) : null}
                                    </div>
                                  ) : null}
                                </div>
                              )}
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <CrudDeleteDialog
        open={deleteDialog.mode === "delete"}
        onOpenChange={(open) => {
          if (!open) deleteDialog.close();
        }}
        entityLabel={t.bogoDeal}
        isLoading={mutations.isDeleting}
        onConfirm={async () => {
          const entity = deleteDialog.entity;
          if (!entity) return;
          if ("buyQuantity" in entity) {
            await mutations.deleteDeal.mutate(entity);
          } else if ("discountValue" in entity) {
            await mutations.deleteReward.mutate(entity as BogoReward);
          } else {
            await mutations.deleteCondition.mutate(entity as BogoCondition);
          }
          deleteDialog.close();
        }}
      />
    </div>
  );
}
