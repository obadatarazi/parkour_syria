import { FileText, Upload, X } from "lucide-react";
import { type DragEvent, type MouseEvent, useEffect, useId, useRef, useState } from "react";

import { FormField } from "@/shared/components/forms/FormField";
import { cn } from "@/shared/design-system/components/ui/utils";

export type FileUploadFieldProps = {
  label: string;
  uploadLabel: string;
  uploadHint: string;
  dropActiveLabel?: string;
  removeLabel?: string;
  accept?: string;
  helperText?: string;
  error?: string;
  disabled?: boolean;
  /** Pass the form's current file value to keep the preview in sync and reset correctly. */
  value?: File | null;
  onFileSelect?: (file: File | null) => void;
  containerClassName?: string;
};

function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function FileUploadField({
  label,
  uploadLabel,
  uploadHint,
  dropActiveLabel,
  removeLabel = "Remove file",
  accept,
  helperText,
  error,
  disabled = false,
  value,
  onFileSelect,
  containerClassName,
}: FileUploadFieldProps) {
  const id = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const isControlled = value !== undefined;
  const [internalFile, setInternalFile] = useState<File | null>(null);
  const selectedFile = isControlled ? value : internalFile;
  const [isDragging, setIsDragging] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!selectedFile || !selectedFile.type.startsWith("image/")) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(selectedFile);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [selectedFile]);

  const selectFile = (file: File | null) => {
    if (!isControlled) setInternalFile(file);
    onFileSelect?.(file);
  };

  const handleDragOver = (event: DragEvent<HTMLLabelElement>) => {
    if (disabled) return;
    event.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (event: DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (event: DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    setIsDragging(false);
    if (disabled) return;
    const file = event.dataTransfer.files?.[0] ?? null;
    if (file) selectFile(file);
  };

  const handleRemove = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    selectFile(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <FormField
      label={label}
      fieldId={id}
      helperText={helperText}
      error={error}
      containerClassName={containerClassName}
    >
      <label
        htmlFor={id}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-muted/30 px-4 py-8 text-center transition-colors duration-200",
          disabled && "cursor-not-allowed opacity-60",
          !disabled && "hover:border-brand hover:bg-brand-muted/40",
          isDragging && !disabled && "border-brand bg-brand-muted/40",
        )}
      >
        {selectedFile ? (
          <div className="flex w-full items-center gap-3 text-start">
            {previewUrl ? (
              <img
                src={previewUrl}
                alt=""
                className="size-12 shrink-0 rounded-lg border border-border object-cover"
              />
            ) : (
              <span
                className="flex size-12 shrink-0 items-center justify-center rounded-lg border border-border bg-background text-muted-foreground"
                aria-hidden="true"
              >
                <FileText className="size-5" />
              </span>
            )}
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-foreground">{selectedFile.name}</p>
              <p className="text-xs text-muted-foreground">{formatFileSize(selectedFile.size)}</p>
            </div>
            <button
              type="button"
              onClick={handleRemove}
              disabled={disabled}
              aria-label={removeLabel}
              className="shrink-0 rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive disabled:pointer-events-none"
            >
              <X className="size-4" aria-hidden="true" />
            </button>
          </div>
        ) : (
          <>
            <Upload className="size-5 text-muted-foreground" aria-hidden="true" />
            <span className="text-sm font-medium text-foreground">
              {isDragging && dropActiveLabel ? dropActiveLabel : uploadLabel}
            </span>
            <span className="text-xs text-muted-foreground">{uploadHint}</span>
          </>
        )}
        <input
          ref={inputRef}
          id={id}
          type="file"
          className="sr-only"
          accept={accept}
          disabled={disabled}
          onChange={(event) => selectFile(event.target.files?.[0] ?? null)}
        />
      </label>
    </FormField>
  );
}
