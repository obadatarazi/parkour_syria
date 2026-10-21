export type BlogCategoryId = 'safety' | 'training' | 'damascus';

/** Localized blog post as pages render it. */
export interface BlogPost {
  id: string;
  categoryId: BlogCategoryId;
  publishedAt: string;
  image: string;
  hasBody: boolean;
  category: string;
  date: string;
  title: string;
  excerpt: string;
  body?: { heading: string; text: string }[];
}
