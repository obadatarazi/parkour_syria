/** Enum-like values for UI props — kept out of JSX attrs for i18n lint. */
export const btnVariant = {
  dark: 'dark',
  outline: 'outline',
  accent: 'accent',
} as const;

export const btnSize = {
  sm: 'sm',
  lg: 'lg',
} as const;

export const tagVariant = {
  default: 'default',
  verified: 'verified',
} as const;
