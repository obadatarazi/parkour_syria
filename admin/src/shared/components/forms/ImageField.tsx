import { useState } from "react";

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

/** Mirrors the backend's `Upload::MAX_IMAGE_KB`. */
export const MAX_IMAGE_BYTES = 2048 * 1024;

/** One image upload backed by the API's `image` multipart field (jpeg/png/gif/webp/svg). */
export function ImageField({ label, currentUrl, value, onChange, disabled }: ImageFieldProps) {
  const t = useTranslation();
  const [tooLarge, setTooLarge] = useState(false);

  const handleSelect = (file: File | null) => {
    // Refused here so the editor sees why, instead of a failed save after filling the whole form.
    if (file && file.size > MAX_IMAGE_BYTES) {
      setTooLarge(true);
      onChange(null);
      return;
    }
    setTooLarge(false);
    onChange(file);
  };

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
        onFileSelect={handleSelect}
        error={tooLarge ? t.uploadImageTooLarge : undefined}
        disabled={disabled}
      />
    </div>
  );
}
