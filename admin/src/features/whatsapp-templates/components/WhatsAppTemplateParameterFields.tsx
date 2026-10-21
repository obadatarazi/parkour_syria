import type { WhatsAppTemplatePreviewParameter } from "@/features/whatsapp-templates/types/whatsapp-templates.types";
import { TextField } from "@/shared/components";
import { useTranslation } from "@/shared/design-system/localization/contexts/LocalizationContext";

type WhatsAppTemplateParameterFieldsProps = {
  parameters: WhatsAppTemplatePreviewParameter[];
  values: Record<string, string>;
  onChange: (key: string, value: string) => void;
  disabled?: boolean;
};

export function WhatsAppTemplateParameterFields({
  parameters,
  values,
  onChange,
  disabled = false,
}: WhatsAppTemplateParameterFieldsProps) {
  const t = useTranslation();

  if (parameters.length === 0) return null;

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {parameters.map((parameter) => (
        <TextField
          key={parameter.key || String(parameter.index)}
          label={parameter.label || parameter.key}
          value={values[parameter.key] ?? ""}
          placeholder={parameter.sample}
          helperText={`${t.whatsappTemplateSampleValue}: ${parameter.sample || "—"}`}
          onChange={(event) => onChange(parameter.key, event.target.value)}
          disabled={disabled}
        />
      ))}
    </div>
  );
}
