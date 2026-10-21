import { createContext } from 'react';
import type { PageId } from '@/data/demo';

export interface NavContextValue {
  page: PageId;
  id?: string;
  navigate: (page: PageId, id?: string) => void;
}

export const NavContext = createContext<NavContextValue | null>(null);
