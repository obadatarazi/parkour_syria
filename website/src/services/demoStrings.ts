/** Shape of `tm('demo')` locale tree used by mappers. */
export interface DemoStrings {
  categories: Record<string, string>;
  categoriesPlural: Record<string, string>;
  areas: Record<string, string>;
  city: string;
  directory: Record<string, { name: string; description: string }>;
  eventTypes: Record<string, string>;
  events: Record<string, { title: string; location: string }>;
  blogCategories: Record<string, string>;
  blog: Record<
    string,
    {
      title: string;
      excerpt: string;
      body?: { heading: string; text: string }[];
    }
  >;
  gallery: Record<string, string>;
  lessons: Record<
    string,
    {
      title: string;
      desc: string;
      body?: { heading: string; text: string; list?: string[] }[];
    }
  >;
  slides: Record<
    string,
    {
      cat: string;
      title: string;
      text: string;
      primary: string;
      secondary: string;
    }
  >;
}

export type FormatDate = (
  value: string,
  options?: Intl.DateTimeFormatOptions
) => string;
