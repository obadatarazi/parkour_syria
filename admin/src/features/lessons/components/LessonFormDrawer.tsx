import { LessonForm } from "@/features/lessons/components/LessonForm";
import { useLessonMutations } from "@/features/lessons/hooks/use-lesson-mutations";
import type { Lesson } from "@/features/lessons/types/lessons.types";
import { CrudDirtyFormDrawer } from "@/shared/crud";
import { useTranslation } from "@/shared/design-system/localization/contexts/LocalizationContext";

type LessonFormDrawerProps = {
  open: boolean;
  mode: "create" | "edit";
  lesson?: Lesson | null;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void | Promise<void>;
};

export function LessonFormDrawer({
  open,
  mode,
  lesson,
  onOpenChange,
  onSuccess,
}: LessonFormDrawerProps) {
  const t = useTranslation();
  const { save, isSaving } = useLessonMutations({ onSuccess });

  return (
    <CrudDirtyFormDrawer
      open={open}
      mode={mode}
      title={mode === "create" ? t.addLesson : t.editLesson}
      size="xl"
      isLoading={isSaving}
      onOpenChange={onOpenChange}
    >
      {({ onDirtyChange, requestClose, closeClean }) => (
        <LessonForm
          mode={mode}
          lesson={lesson}
          isLoading={isSaving}
          onCancel={requestClose}
          onDirtyChange={onDirtyChange}
          onSubmit={async (data) => {
            const result = await save(mode, data, lesson ?? undefined);
            if (result) closeClean();
          }}
        />
      )}
    </CrudDirtyFormDrawer>
  );
}
