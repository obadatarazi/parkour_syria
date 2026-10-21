import { ROOT } from './paths';

/** DEV-only UI kit path. Never registered in production route tables. */
export function isUiKitPath(pathname: string): boolean {
  if (!import.meta.env.DEV) return false;
  const local = pathname.startsWith(ROOT) ? pathname.slice(ROOT.length) : pathname;
  return local.replace(/\/+$/, '') === '/ui-kit';
}
