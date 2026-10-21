import type { BlogPost } from "@/features/blog-posts/types/blog-posts.types";
import { formatEventDateTime } from "@/features/events/utils/event-labels";
import { MediaImage, StatusBadge } from "@/shared/components";
import { CrudDetailField, CrudLocaleFieldsView, CrudViewDialog } from "@/shared/crud";
import {
  useLocalization,
  useTranslation,
} from "@/shared/design-system/localization/contexts/LocalizationContext";
import { pickLocaleText } from "@/shared/lib/api/locale-fields.utils";

type BlogPostViewDialogProps = {
  open: boolean;
  post: BlogPost | null;
  canUpdate?: boolean;
  canDelete?: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit?: (post: BlogPost) => void;
  onDelete?: (post: BlogPost) => void;
};

export function BlogPostViewDialog({ post, ...props }: BlogPostViewDialogProps) {
  const t = useTranslation();
  const { language } = useLocalization();
  if (!post) return null;

  return (
    <CrudViewDialog
      {...props}
      entity={post}
      size="2xl"
      title={t.viewBlogPost}
      cancelLabel={t.cancel}
      editLabel={t.editAction}
      deleteLabel={t.deleteAction}
      hero={
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
          {post.imageFileUrl ? (
            <MediaImage
              src={post.imageFileUrl}
              alt=""
              className="h-24 w-36 shrink-0 rounded-xl border border-border object-cover"
            />
          ) : null}
          <div className="min-w-0 flex-1 space-y-3">
            <p className="text-lg font-semibold text-foreground">
              {pickLocaleText(post.translations, "title", post.title)}
            </p>
            <div className="flex flex-wrap gap-2">
              {post.category?.title ? <StatusBadge label={post.category.title} variant="info" /> : null}
              <StatusBadge
                label={post.publish ? t.publishedLabel : t.draftLabel}
                variant={post.publish ? "success" : "neutral"}
              />
            </div>
          </div>
        </div>
      }
      sections={[
        {
          id: "content",
          title: t.sectionContent,
          content: (
            <CrudLocaleFieldsView
              translations={post.translations}
              fields={[
                { key: "title", label: t.fieldTitle },
                { key: "excerpt", label: t.fieldExcerpt, multiline: true },
                { key: "body", label: t.fieldBody, multiline: true },
              ]}
            />
          ),
        },
        {
          id: "seo",
          title: t.sectionSeo,
          content: (
            <CrudLocaleFieldsView
              translations={post.translations}
              fields={[
                { key: "seo_title", label: t.fieldSeoTitle },
                { key: "seo_description", label: t.fieldSeoDescription, multiline: true },
              ]}
            />
          ),
        },
        {
          id: "details",
          title: t.sectionDetails,
          content: (
            <div className="grid gap-4 sm:grid-cols-2">
              <CrudDetailField label={t.slug}>
                <span dir="ltr" className="font-mono text-sm">{post.slug}</span>
              </CrudDetailField>
              <CrudDetailField label={t.fieldPublishedAt}>
                {post.publishedAt ? (
                  formatEventDateTime(post.publishedAt, language)
                ) : (
                  <span className="text-muted-foreground">{t.notSet}</span>
                )}
              </CrudDetailField>
            </div>
          ),
        },
      ]}
    />
  );
}
