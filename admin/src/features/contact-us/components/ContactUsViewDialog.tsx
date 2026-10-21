import type { ContactUsMessage } from "@/features/contact-us/types/contact-us.types";
import { PhoneNumberText, StatusBadge } from "@/shared/components";
import { CrudDetailField, CrudViewDialog, type CrudViewDialogSection } from "@/shared/crud";
import {
  useLocalization,
  useTranslation,
} from "@/shared/design-system/localization/contexts/LocalizationContext";
import type { Translation } from "@/shared/design-system/localization/locales/en";
import { formatDateTime } from "@/shared/lib/datetime.utils";

type ContactUsViewDialogProps = {
  open: boolean;
  message: ContactUsMessage | null;
  canDelete?: boolean;
  onOpenChange: (open: boolean) => void;
  onDelete?: (message: ContactUsMessage) => void;
};

function resolveStatusLabel(t: Translation, status?: ContactUsMessage["status"] | null): string {
  if (status?.value === "PENDING") return t.contactStatusPending;
  if (status?.value === "REVIEWED") return t.contactStatusReviewed;
  return status?.label ?? t.notSet;
}

function resolveStatusVariant(
  status?: ContactUsMessage["status"] | null,
): "warning" | "success" | "neutral" {
  if (status?.value === "PENDING") return "warning";
  if (status?.value === "REVIEWED") return "success";
  return "neutral";
}

export function ContactUsViewDialog({
  open,
  message,
  canDelete = false,
  onOpenChange,
  onDelete,
}: ContactUsViewDialogProps) {
  const t = useTranslation();
  const { language } = useLocalization();

  if (!message) return null;

  const sections: CrudViewDialogSection[] = [
    {
      id: "content",
      title: t.contactContent,
      content: (
        <CrudDetailField label={t.message}>
          <p className="whitespace-pre-wrap">{message.message}</p>
        </CrudDetailField>
      ),
    },
    {
      id: "details",
      title: t.contactDetails,
      content: (
        <div className="grid gap-4 sm:grid-cols-2">
          <CrudDetailField label={t.fullName}>{message.userFullName}</CrudDetailField>
          <CrudDetailField label={t.email}>{message.userEmail}</CrudDetailField>
          <CrudDetailField label={t.phoneNumber}>
            <PhoneNumberText
              value={message.userPhoneNumber}
              fallback={<span className="text-muted-foreground">{t.notSet}</span>}
            />
          </CrudDetailField>
          <CrudDetailField label={t.date}>
            {formatDateTime(message.createdAt, language)}
          </CrudDetailField>
        </div>
      ),
    },
  ];

  return (
    <CrudViewDialog
      open={open}
      entity={message}
      onOpenChange={onOpenChange}
      title={t.viewContactMessage}
      cancelLabel={t.cancel}
      canDelete={canDelete}
      deleteLabel={t.deleteAction}
      onDelete={onDelete}
      sections={sections}
      hero={
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
          <div
            className="flex size-20 shrink-0 items-center justify-center rounded-xl border border-dashed border-border bg-background text-3xl"
            aria-hidden="true"
          >
            ✉️
          </div>

          <div className="min-w-0 flex-1 space-y-3">
            <div>
              <p className="text-lg font-semibold text-foreground">{message.userFullName}</p>
              <p className="mt-1 text-sm text-muted-foreground">{message.userEmail}</p>
            </div>

            <div className="flex flex-wrap gap-2">
              <StatusBadge
                label={resolveStatusLabel(t, message.status)}
                variant={resolveStatusVariant(message.status)}
              />
            </div>
          </div>
        </div>
      }
    />
  );
}
