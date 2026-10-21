import { useEffect, useState } from "react";

import type { EventType } from "@/features/events/types/events.types";
import { apiDateTimeToInput } from "@/features/events/types/events.types";
import { eventTypeOptions } from "@/features/events/utils/event-labels";
import type { Suggestion, SuggestionAcceptData } from "@/features/suggestions/types/suggestions.types";
import {
  AppButton,
  AppDialog,
  SelectField,
  TextAreaField,
  TextField,
  ToggleField,
} from "@/shared/components";
import { useTranslation } from "@/shared/design-system/localization/contexts/LocalizationContext";

type AcceptDialogProps = {
  suggestion: Suggestion | null;
  isLoading?: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (data: SuggestionAcceptData) => void;
};

/** Accept = promote: the backend builds a directory entry or an event from the suggestion. */
export function SuggestionAcceptDialog({
  suggestion,
  isLoading,
  onOpenChange,
  onConfirm,
}: AcceptDialogProps) {
  const t = useTranslation();
  const [data, setData] = useState<SuggestionAcceptData>({ publish: true, verified: false });
  const isEvent = suggestion?.type === "event";

  useEffect(() => {
    if (!suggestion) return;
    setData({
      publish: true,
      verified: false,
      slug: "",
      eventType: suggestion.type === "event" ? "gathering" : undefined,
      startsAt: suggestion.type === "event" ? apiDateTimeToInput(suggestion.startsAt) : undefined,
    });
  }, [suggestion]);

  const missingEventDate = isEvent && !data.startsAt;

  return (
    <AppDialog
      open={Boolean(suggestion)}
      onOpenChange={onOpenChange}
      title={t.acceptSuggestionTitle}
      description={t.acceptSuggestionDescription}
      size="md"
      isLoading={isLoading}
      footer={
        <div className="flex w-full gap-3">
          <AppButton
            type="button"
            variant="outline"
            className="flex-1"
            disabled={isLoading}
            onClick={() => onOpenChange(false)}
          >
            {t.cancel}
          </AppButton>
          <AppButton
            type="button"
            className="flex-1"
            isLoading={isLoading}
            disabled={missingEventDate}
            onClick={() => onConfirm(data)}
          >
            {t.acceptAction}
          </AppButton>
        </div>
      }
    >
      <div className="space-y-4">
        <ToggleField
          label={t.acceptPublishNow}
          checked={data.publish}
          onCheckedChange={(publish) => setData((current) => ({ ...current, publish }))}
        />
        {!isEvent ? (
          <ToggleField
            label={t.acceptMarkVerified}
            checked={data.verified}
            onCheckedChange={(verified) => setData((current) => ({ ...current, verified }))}
          />
        ) : null}
        <TextField
          label={t.slug}
          value={data.slug ?? ""}
          onChange={(event) => setData((current) => ({ ...current, slug: event.target.value }))}
          helperText={t.slugHelper}
          maxLength={140}
          dir="ltr"
        />
        {isEvent ? (
          <>
            <SelectField
              label={t.eventType}
              value={data.eventType ?? "gathering"}
              onValueChange={(eventType) =>
                setData((current) => ({ ...current, eventType: eventType as EventType }))
              }
              options={eventTypeOptions(t)}
            />
            <TextField
              label={t.fieldStartsAt}
              type="datetime-local"
              value={data.startsAt ?? ""}
              onChange={(event) =>
                setData((current) => ({ ...current, startsAt: event.target.value }))
              }
              error={missingEventDate ? t.required : undefined}
              required
              dir="ltr"
            />
          </>
        ) : null}
      </div>
    </AppDialog>
  );
}

type RejectDialogProps = {
  suggestion: Suggestion | null;
  isLoading?: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (reason: string) => void;
};

export function SuggestionRejectDialog({
  suggestion,
  isLoading,
  onOpenChange,
  onConfirm,
}: RejectDialogProps) {
  const t = useTranslation();
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string>();

  useEffect(() => {
    setReason("");
    setError(undefined);
  }, [suggestion]);

  return (
    <AppDialog
      open={Boolean(suggestion)}
      onOpenChange={onOpenChange}
      title={t.rejectSuggestionTitle}
      description={t.rejectSuggestionDescription}
      size="md"
      isLoading={isLoading}
      footer={
        <div className="flex w-full gap-3">
          <AppButton
            type="button"
            variant="outline"
            className="flex-1"
            disabled={isLoading}
            onClick={() => onOpenChange(false)}
          >
            {t.cancel}
          </AppButton>
          <AppButton
            type="button"
            variant="destructive"
            className="flex-1"
            isLoading={isLoading}
            onClick={() => {
              if (!reason.trim()) {
                setError(t.required);
                return;
              }
              onConfirm(reason.trim());
            }}
          >
            {t.rejectAction}
          </AppButton>
        </div>
      }
    >
      <TextAreaField
        label={t.suggestionRejectReason}
        value={reason}
        onChange={(event) => {
          setReason(event.target.value);
          setError(undefined);
        }}
        error={error}
        rows={4}
        maxLength={2000}
        required
        autoFocus
      />
    </AppDialog>
  );
}
