/** Localized lesson as pages render it. */
export interface Lesson {
  num: number;
  hasBody: boolean;
  title: string;
  desc: string;
  body?: { heading: string; text: string; list?: string[] }[];
}
