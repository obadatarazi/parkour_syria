import { Check, X } from "lucide-react";
import { useCallback } from "react";

import { formatEventDateTime } from "@/features/events/utils/event-labels";
import { suggestionsService } from "@/features/suggestions/services/suggestions.service";
import {
  type Suggestion,
  suggestionStatusLabel,
  suggestionStatusVariant,
  suggestionTypeLabel,
} from "@/features/suggestions/types/suggestions.types";
import { AppButton, MediaImage, StatusBadge } from "@/shared/components";
import { CrudDetailField, CrudViewDialog, useCrudQuery } from "@/shared/crud";
import {
  useLocalization,
  useTranslation,
} from "@/shared/design-system/localization/contexts/LocalizationContext";

type SuggestionViewDialogProps = {
  open: boolean;
  suggestion: Suggestion | null;
  canUpdate?: boolean;
  canDelete?: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit?: (suggestion: Suggestion) => void;
  onDelete?: (suggestion: Suggestion) => void;
  onAccept?: (suggestion: Suggestion) => void;
  onReject?: (suggestion: Suggestion) => void;
};

function Value({ value, empty }: { value?: string | null; empty: string }) {
  return value ? (
    <span className="whitespace-pre-line">{value}</span>
  ) : (
    <span className="text-muted-foreground">{empty}</span>
  );
}

export function SuggestionViewDialog({
  suggestion: listRow,
  canUpdate = false,
  onAccept,
  onReject,
  onEdit,
  ...props
}: SuggestionViewDialogProps) {
  const t = useTranslation();
  const { language } = useLocalization();

  // The list row has no payload or reviewer, the details call does.
  const queryFn = useCallback(
    () => (listRow ? suggestionsService.getById(listRow.id) : Promise.resolve(null)),
    [listRow],
  );
  const details = useCrudQuery({
    queryKey: ["suggestions", "details", String(listRow?.id ?? "")],
    queryFn,
    enabled: Boolean(listRow) && props.open,
    staleTime: 0,
  });

  const suggestion = details.data ?? listRow;
  if (!suggestion) return null;

  const isPending = suggestion.status === "pending";
  const formatDate = (value?: string | null) => (value ? formatEventDateTime(value, language) : null);
  const payloadEntries = Object.entries(suggestion.payload ?? {}).filter(
    ([, value]) => value !== null && value !== "",
  );

  return (
    <CrudViewDialog
      {...props}
      entity={suggestion}
      size="xl"
      title={t.viewSuggestion}
      cancelLabel={t.cancel}
      canUpdate={canUpdate && isPending}
      editLabel={t.editAction}
      deleteLabel={t.deleteAction}
      onEdit={onEdit}
      footerActions={
        canUpdate && isPending ? (
          <>
            <AppButton type="button" variant="outline" onClick={() => onReject?.(suggestion)}>
              <X className="size-4" aria-hidden="true" />
              {t.rejectAction}
            </AppButton>
            <AppButton type="button" onClick={() => onAccept?.(suggestion)}>
              <Check className="size-4" aria-hidden="true" />
              {t.acceptAction}
            </AppButton>
          </>
        ) : null
      }
      hero={
        <div className="space-y-3">
          <p className="text-lg font-semibold text-foreground">{suggestion.name || "—"}</p>
          <div className="flex flex-wrap gap-2">
            <StatusBadge label={suggestionTypeLabel(t, suggestion.type)} variant="info" />
            <StatusBadge
              label={suggestionStatusLabel(t, suggestion.status)}
              variant={suggestionStatusVariant(suggestion.status)}
            />
          </div>
          {!isPending && canUpdate ? (
            <p className="text-xs text-muted-foreground">{t.suggestionLocked}</p>
          ) : null}
        </div>
      }
      sections={[
        {
          id: "content",
          title: t.sectionContent,
          content: (
            <div className="grid gap-4 sm:grid-cols-2">
              <CrudDetailField label={t.fieldDescription}>
                <Value value={suggestion.description} empty={t.notSet} />
              </CrudDetailField>
              <CrudDetailField label={t.fieldArea}>
                <Value value={suggestion.area?.name} empty={t.noArea} />
              </CrudDetailField>
              {suggestion.type === "event" ? (
                <CrudDetailField label={t.fieldStartsAt}>
                  <Value value={formatDate(suggestion.startsAt)} empty={t.notSet} />
                </CrudDetailField>
              ) : null}
              <CrudDetailField label={t.fieldContact}>
                <Value value={suggestion.contact} empty={t.notSet} />
              </CrudDetailField>
              {suggestion.imageFileUrl ? (
                <CrudDetailField label={t.sectionImage}>
                  <a href={suggestion.imageFileUrl} target="_blank" rel="noreferrer">
                    <MediaImage
                      src={suggestion.imageFileUrl}
                      alt=""
                      className="h-32 w-full rounded-xl border border-border object-cover"
                    />
                  </a>
                </CrudDetailField>
              ) : null}
            </div>
          ),
        },
        {
          id: "proposer",
          title: t.suggestionProposer,
          content: (
            <div className="grid gap-4 sm:grid-cols-2">
              <CrudDetailField label={t.fieldName}>
                <Value value={suggestion.proposerName} empty={t.notSet} />
              </CrudDetailField>
              <CrudDetailField label={t.suggestionProposerContact}>
                <Value value={suggestion.proposerContact} empty={t.notSet} />
              </CrudDetailField>
              <CrudDetailField label={t.suggestionSafetyAccepted}>
                {suggestion.safetyAccepted ? "✓" : "—"}
              </CrudDetailField>
              <CrudDetailField label={t.createdAt}>
                <Value value={formatDate(suggestion.createdAt)} empty={t.notSet} />
              </CrudDetailField>
            </div>
          ),
        },
        ...(payloadEntries.length
          ? [
              {
                id: "payload",
                title: t.suggestionPayload,
                content: (
                  <div className="grid gap-4 sm:grid-cols-2">
                    {payloadEntries.map(([key, value]) => (
                      <CrudDetailField key={key} label={key}>
                        <span className="break-all">
                          {typeof value === "string" ? value : JSON.stringify(value)}
                        </span>
                      </CrudDetailField>
                    ))}
                  </div>
                ),
              },
            ]
          : []),
        ...(!isPending
          ? [
              {
                id: "review",
                title: t.suggestionStatus,
                content: (
                  <div className="grid gap-4 sm:grid-cols-2">
                    <CrudDetailField label={t.suggestionReviewedAt}>
                      <Value value={formatDate(suggestion.reviewedAt)} empty={t.notSet} />
                    </CrudDetailField>
                    <CrudDetailField label={t.suggestionReviewedBy}>
                      <Value value={suggestion.reviewedBy?.fullName} empty={t.notSet} />
                    </CrudDetailField>
                    {suggestion.status === "rejected" ? (
                      <CrudDetailField label={t.suggestionRejectReason}>
                        <Value value={suggestion.rejectReason} empty={t.notSet} />
                      </CrudDetailField>
                    ) : null}
                    {suggestion.promotedId ? (
                      <CrudDetailField label={t.suggestionPromoted}>
                        <span dir="ltr" className="font-mono text-sm">
                          {suggestion.promotedType} #{suggestion.promotedId}
                        </span>
                      </CrudDetailField>
                    ) : null}
                  </div>
                ),
              },
            ]
          : []),
      ]}
    />
  );
}
