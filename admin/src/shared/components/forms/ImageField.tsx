import { MediaImage } from "@/shared/components/data/MediaImage";
import { FileUploadField } from "@/shared/components/forms/FileUploadField";
import { useTranslation } from "@/shared/design-system/localization/contexts/LocalizationContext";

type ImageFieldProps = {
  label: string;
  /** The image already saved on the record, shown until a new file replaces it. */
  currentUrl?: string | null;
  value: File | null | undefined;
  onChange: (file: File | null) => void;
  disabled?: boolean;
};

/** One image upload backed by the API's `image` multipart field (jpeg/png/gif/webp/svg). */
export function ImageField({ label, currentUrl, value, onChange, disabled }: ImageFieldProps) {
  const t = useTranslation();

  return (
    <div className="space-y-3">
      {currentUrl && !value ? (
        <MediaImage
          src={currentUrl}
          alt=""
          className="h-32 w-full rounded-xl border border-border object-cover"
        />
      ) : null}
      <FileUploadField
        label={label}
        uploadLabel={t.uploadImage}
        uploadHint={t.uploadImageHint}
        accept="image/jpeg,image/png,image/gif,image/webp,image/svg+xml"
        value={value ?? null}
        onFileSelect={onChange}
        disabled={disabled}
      />
    </div>
  );
}
