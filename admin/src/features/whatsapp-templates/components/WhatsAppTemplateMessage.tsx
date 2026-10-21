import type { WhatsAppTemplatePreview } from "@/features/whatsapp-templates/types/whatsapp-templates.types";
import { useTranslation } from "@/shared/design-system/localization/contexts/LocalizationContext";

type WhatsAppTemplateMessageProps = {
  preview: WhatsAppTemplatePreview;
};

export function WhatsAppTemplateMessage({ preview }: WhatsAppTemplateMessageProps) {
  const t = useTranslation();

  if (!preview.available && !preview.body) {
    return (
      <p className="text-sm text-muted-foreground">{t.whatsappTemplatePreviewUnavailable}</p>
    );
  }

  return (
    <div className="max-w-md rounded-2xl rounded-tl-sm border border-border bg-muted/40 px-4 py-3 text-sm text-foreground">
      {preview.header?.text ? (
        <p className="mb-1 font-semibold">{preview.header.text}</p>
      ) : preview.header && preview.header.format !== "TEXT" ? (
        <p className="mb-1 text-xs font-medium tracking-wide text-muted-foreground uppercase">
          {preview.header.format}
        </p>
      ) : null}
      {preview.body ? <p className="whitespace-pre-wrap leading-relaxed">{preview.body}</p> : null}
      {preview.footer ? <p className="mt-2 text-xs text-muted-foreground">{preview.footer}</p> : null}
      {preview.buttons.length > 0 ? (
        <ul className="mt-3 space-y-1 border-t border-border/70 pt-2">
          {preview.buttons.map((button) => (
            <li key={`${button.type}-${button.text}`} className="text-center text-sm font-medium text-primary">
              {button.url ? (
                <a href={button.url} target="_blank" rel="noreferrer" className="hover:underline">
                  {button.text}
                </a>
              ) : (
                button.text
              )}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
