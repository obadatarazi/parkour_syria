import type { Lesson } from "@/features/lessons/types/lessons.types";
import { MediaImage, StatusBadge } from "@/shared/components";
import { CrudDetailField, CrudLocaleFieldsView, CrudViewDialog } from "@/shared/crud";
import { useTranslation } from "@/shared/design-system/localization/contexts/LocalizationContext";
import { pickLocaleText } from "@/shared/lib/api/locale-fields.utils";

type LessonViewDialogProps = {
  open: boolean;
  lesson: Lesson | null;
  canUpdate?: boolean;
  canDelete?: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit?: (lesson: Lesson) => void;
  onDelete?: (lesson: Lesson) => void;
};

export function LessonViewDialog({ lesson, ...props }: LessonViewDialogProps) {
  const t = useTranslation();
  if (!lesson) return null;

  return (
    <CrudViewDialog
      {...props}
      entity={lesson}
      size="xl"
      title={t.viewLesson}
      cancelLabel={t.cancel}
      editLabel={t.editAction}
      deleteLabel={t.deleteAction}
      hero={
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
          {lesson.imageFileUrl ? (
            <MediaImage
              src={lesson.imageFileUrl}
              alt=""
              className="h-24 w-36 shrink-0 rounded-xl border border-border object-cover"
            />
          ) : null}
          <div className="min-w-0 flex-1 space-y-3">
            <p className="text-lg font-semibold text-foreground">
              {pickLocaleText(lesson.translations, "title", lesson.title)}
            </p>
            <StatusBadge
              label={lesson.publish ? t.publishedLabel : t.draftLabel}
              variant={lesson.publish ? "success" : "neutral"}
            />
          </div>
        </div>
      }
      sections={[
        {
          id: "content",
          title: t.sectionContent,
          content: (
            <CrudLocaleFieldsView
              translations={lesson.translations}
              fields={[
                { key: "title", label: t.fieldTitle },
                { key: "summary", label: t.fieldSummary, multiline: true },
                { key: "body", label: t.fieldBody, multiline: true },
                { key: "safety_note", label: t.fieldSafetyNote, multiline: true },
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
                <span dir="ltr" className="font-mono text-sm">{lesson.slug}</span>
              </CrudDetailField>
              <CrudDetailField label={t.sortOrder}>{lesson.sortOrder}</CrudDetailField>
              <CrudDetailField label={t.fieldYoutubeUrl}>
                {lesson.youtubeUrl ? (
                  <a
                    href={lesson.youtubeUrl}
                    target="_blank"
                    rel="noreferrer"
                    dir="ltr"
                    className="break-all text-sm text-brand underline-offset-2 hover:underline"
                  >
                    {lesson.youtubeUrl}
                  </a>
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
