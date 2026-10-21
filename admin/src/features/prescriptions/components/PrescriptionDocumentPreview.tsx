import { FileText } from "lucide-react";

import { MediaImage } from "@/shared/components";
import { cn } from "@/shared/design-system/components/ui/utils";
import { useTranslation } from "@/shared/design-system/localization/contexts/LocalizationContext";
import { resolveMediaUrl } from "@/shared/lib/resolve-media-url";

type PrescriptionDocumentPreviewProps = {
  fileUrl?: string | null;
  fileName?: string | null;
  compact?: boolean;
};

function isPdfUrl(url: string): boolean {
  return /\.pdf($|\?)/i.test(url);
}

export function PrescriptionDocumentPreview({
  fileUrl,
  fileName,
  compact = false,
}: PrescriptionDocumentPreviewProps) {
  const t = useTranslation();
  const resolved = resolveMediaUrl(fileUrl);

  if (!resolved) {
    return <span className="text-muted-foreground">{t.notSet}</span>;
  }

  const label = fileName?.trim() || t.prescriptionOpenFile;
  const isPdf = isPdfUrl(resolved) || isPdfUrl(fileUrl ?? "");

  if (isPdf) {
    return (
      <div className="space-y-2">
        <iframe
          title={label}
          src={resolved}
          className={cn(
            "w-full rounded-xl border border-border bg-muted/40",
            compact ? "h-64" : "h-[28rem]",
          )}
        />
        <a
          href={resolved}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 text-sm font-medium text-brand hover:underline"
        >
          <FileText className="size-4" aria-hidden="true" />
          {label}
        </a>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <a href={resolved} target="_blank" rel="noreferrer" className="block">
        <MediaImage
          src={resolved}
          alt={label}
          className={cn(
            "w-full rounded-xl border border-border bg-muted/40 object-contain",
            compact ? "max-h-64" : "max-h-[28rem]",
          )}
        />
      </a>
      <a
        href={resolved}
        target="_blank"
        rel="noreferrer"
        className="inline-flex items-center gap-2 text-sm font-medium text-brand hover:underline"
      >
        {t.prescriptionOpenFile}
      </a>
    </div>
  );
}
