import type { KeyboardEvent } from "react";

/** Enter inside a nested form submits that form, not the page form around it. */
/** Nested forms inside the promotion workspace are invalid HTML and reload the page. */
export function handleNestedFormEnter(
  event: KeyboardEvent<HTMLElement>,
  submit: () => void,
  disabled = false,
) {
  if (disabled || event.key !== "Enter") return;
  const target = event.target;
  if (target instanceof HTMLTextAreaElement || target instanceof HTMLButtonElement) return;
  event.preventDefault();
  event.stopPropagation();
  submit();
}
