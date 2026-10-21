import type { PageId } from './navigation';

/** Localized hero slide as pages render it. */
export interface Slide {
  id: string;
  image: string;
  primaryPage: PageId;
  secondaryPage: PageId;
  cat: string;
  title: string;
  text: string;
  primary: { label: string; page: PageId };
  secondary: { label: string; page: PageId };
}
