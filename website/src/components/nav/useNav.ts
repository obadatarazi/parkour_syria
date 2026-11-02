import { useContext, useCallback } from 'react';
import type { PageId } from '@/types';
import { pathFor } from '@/app/paths';
import { NavContext } from './context';

export function useNav() {
  const ctx = useContext(NavContext);
  if (!ctx) throw new Error('useNav must be used within NavProvider');
  return ctx;
}

/** Props for a real <a> link that still navigates in-app (keeps middle-click / copy link working). */
export function useLink() {
  const { navigate } = useNav();
  return useCallback(
    (page: PageId, id?: string) => ({
      href: pathFor(page, id),
      onClick: (e: React.MouseEvent) => {
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
        e.preventDefault();
        navigate(page, id);
      },
    }),
    [navigate]
  );
}
