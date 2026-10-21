import { FileUploadField } from "@/shared/components/forms/FileUploadField";
import { useTranslation } from "@/shared/design-system/localization/contexts/LocalizationContext";

type CrudFileUploadProps = {
  label: string;
  accept?: string;
  helperText?: string;
  error?: string;
  disabled?: boolean;
  /** Pass the form's current file value to keep the preview in sync and reset correctly. */
  value?: File | null;
  onFileSelect?: (file: File | null) => void;
  className?: string;
};

export function CrudFileUpload({
  label,
  accept,
  helperText,
  error,
  disabled = false,
  value,
  onFileSelect,
  className,
}: CrudFileUploadProps) {
  const t = useTranslation();

  return (
    <FileUploadField
      label={label}
      uploadLabel={t.dragDrop}
      uploadHint={t.fileTypes}
      dropActiveLabel={t.dropFileHere}
      removeLabel={t.removeFile}
      accept={accept}
      helperText={helperText}
      error={error}
      disabled={disabled}
      value={value}
      onFileSelect={onFileSelect}
      containerClassName={className}
    />
  );
}
