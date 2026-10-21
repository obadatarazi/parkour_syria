/** The id of the message a field's input is described by: its error first, else its helper text. */
export function getFormFieldDescribedBy(
  fieldId: string,
  options: { error?: string; helperText?: string },
) {
  if (options.error) return `${fieldId}-error`;
  if (options.helperText) return `${fieldId}-helper`;
  return undefined;
}
