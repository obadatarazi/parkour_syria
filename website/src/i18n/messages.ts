import ar from '@/locales/ar.json';
import enJson from '@/locales/en.json';
import type { Lang } from './config';

export type Messages = typeof ar;

/** Compile-time check: en.json must mirror ar.json keys. */
const en: Messages = enJson;

export const messages: Record<Lang, Messages> = { ar, en };

type PathImpl<T, K extends keyof T = keyof T> = K extends string
  ? T[K] extends string
    ? K
    : T[K] extends Record<string, unknown>
      ? `${K}.${PathImpl<T[K]>}`
      : never
  : never;

/** Dot-paths that resolve to string leaves only. */
export type MessageKey = PathImpl<Messages>;

type PathValue<T, P extends string> = P extends `${infer K}.${infer Rest}`
  ? K extends keyof T
    ? PathValue<T[K], Rest>
    : never
  : P extends keyof T
    ? T[P]
    : never;

export type MessageTreeKey = {
  [K in string & keyof Messages]: Messages[K] extends string ? never : K;
}[string & keyof Messages];

export function getByPath(obj: unknown, path: string): unknown {
  const parts = path.split('.');
  let cur: unknown = obj;
  for (const p of parts) {
    if (cur == null || typeof cur !== 'object') return undefined;
    cur = (cur as Record<string, unknown>)[p];
  }
  return cur;
}

export function interpolate(
  template: string,
  vars?: Record<string, string | number>
): string {
  if (!vars) return template;
  return template.replace(/\{(\w+)\}/g, (_, name: string) =>
    vars[name] !== undefined ? String(vars[name]) : `{${name}}`
  );
}

export type { PathValue };
