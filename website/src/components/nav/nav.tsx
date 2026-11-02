import type { ReactNode } from 'react';
import { NavContext, type NavContextValue } from './context';

export function NavProvider({
  value,
  children,
}: {
  value: NavContextValue;
  children: ReactNode;
}) {
  return <NavContext.Provider value={value}>{children}</NavContext.Provider>;
}
