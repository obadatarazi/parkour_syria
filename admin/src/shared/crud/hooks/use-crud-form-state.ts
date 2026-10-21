import { useCallback, useEffect, useState } from "react";

/**
 * Form state for a drawer form: resets whenever `entity` (or `resetKey`) changes and reports
 * whether the user has touched it since, which drives the discard-changes prompt.
 */
export function useCrudFormState<TForm, TEntity>(
  entity: TEntity | null | undefined,
  build: (entity: TEntity | null | undefined) => TForm,
  resetKey: unknown,
  onDirtyChange?: (isDirty: boolean) => void,
) {
  const [form, setForm] = useState<TForm>(() => build(entity));
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    setForm(build(entity));
    setIsDirty(false);
    // `build` is a module-level mapper, only the record and the mode decide a reset.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entity, resetKey]);

  useEffect(() => {
    onDirtyChange?.(isDirty);
  }, [isDirty, onDirtyChange]);

  const update = useCallback((patch: Partial<TForm>) => {
    setForm((current) => ({ ...current, ...patch }));
    setIsDirty(true);
  }, []);

  return { form, update };
}
