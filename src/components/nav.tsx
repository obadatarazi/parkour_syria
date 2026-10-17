import { createContext, useContext, useCallback, type ReactNode } from 'react';
import type { PageId } from '@/data/demo';

interface NavContextValue {
  page: PageId;
  navigate: (page: PageId) => void;
}

const NavContext = createContext<NavContextValue | null>(null);

export function NavProvider({
  value,
  children,
}: {
  value: NavContextValue;
  children: ReactNode;
}) {
  return <NavContext.Provider value={value}>{children}</NavContext.Provider>;
}

export function useNav() {
  const ctx = useContext(NavContext);
  if (!ctx) throw new Error('useNav must be used within NavProvider');
  return ctx;
}

export function useNavigator() {
  const { navigate } = useNav();
  return useCallback(
    (page: PageId) => (e: React.MouseEvent) => {
      e.preventDefault();
      navigate(page);
    },
    [navigate]
  );
}
