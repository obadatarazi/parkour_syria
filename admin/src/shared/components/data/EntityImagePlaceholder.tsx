import { type ReactNode, useEffect, useState } from "react";
import { Folder, Tag } from "lucide-react";

import { MediaImage } from "@/shared/components/data/MediaImage";
import { cn } from "@/shared/design-system/components/ui/utils";

type EntityImagePlaceholderSize = "sm" | "md" | "lg";

type EntityImagePlaceholderProps = {
  size?: EntityImagePlaceholderSize;
  className?: string;
};

const SIZE_CLASSES: Record<EntityImagePlaceholderSize, string> = {
  sm: "size-8",
  md: "size-10",
  lg: "size-20",
};

const ICON_SIZE_CLASSES: Record<EntityImagePlaceholderSize, string> = {
  sm: "size-4",
  md: "size-5",
  lg: "size-8",
};

function EntityImagePlaceholderShell({
  size = "md",
  className,
  children,
}: EntityImagePlaceholderProps & { children: ReactNode }) {
  return (
    <span
      className={cn(
        SIZE_CLASSES[size],
        "inline-flex shrink-0 items-center justify-center rounded-lg border border-border/60 bg-muted/70 text-muted-foreground",
        size === "lg" && "rounded-xl border-dashed border-border bg-background shadow-sm",
        className,
      )}
      aria-hidden="true"
    >
      {children}
    </span>
  );
}

/** Default thumbnail when a category has no (or a broken) feature image. */
export function CategoryImagePlaceholder({ size = "md", className }: EntityImagePlaceholderProps) {
  return (
    <EntityImagePlaceholderShell size={size} className={className}>
      <Folder className={ICON_SIZE_CLASSES[size]} strokeWidth={1.75} />
    </EntityImagePlaceholderShell>
  );
}

/** Default thumbnail when a brand has no (or a broken) logo. */
export function BrandImagePlaceholder({ size = "md", className }: EntityImagePlaceholderProps) {
  return (
    <EntityImagePlaceholderShell size={size} className={className}>
      <Tag className={ICON_SIZE_CLASSES[size]} strokeWidth={1.75} />
    </EntityImagePlaceholderShell>
  );
}

type EntityMediaThumbnailProps = {
  imageUrl?: string | null;
  imageAlt?: string;
  size?: EntityImagePlaceholderSize;
  placeholder?: ReactNode;
  imageClassName?: string;
};

/**
 * Renders an entity image, falling back to `placeholder` when the URL is
 * missing or the image fails to load (broken media URLs).
 */
export function EntityMediaThumbnail({
  imageUrl,
  imageAlt = "",
  size = "md",
  placeholder = null,
  imageClassName,
}: EntityMediaThumbnailProps) {
  const [imageFailed, setImageFailed] = useState(false);

  useEffect(() => {
    setImageFailed(false);
  }, [imageUrl]);

  if (imageUrl && !imageFailed) {
    return (
      <MediaImage
        src={imageUrl}
        alt={imageAlt}
        className={cn(
          SIZE_CLASSES[size],
          "shrink-0 rounded-lg object-cover",
          size === "lg" && "rounded-xl border border-border shadow-sm",
          imageClassName,
        )}
        onError={() => setImageFailed(true)}
      />
    );
  }

  return <>{placeholder}</>;
}
