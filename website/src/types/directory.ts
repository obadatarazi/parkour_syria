export type DirCategory = 'place' | 'coach' | 'team';
export type AreaId = 'mazzeh' | 'abu-rummaneh' | 'kafr-sousa' | 'other';

/** Localized directory entry as pages render it. */
export interface DirectoryItem {
  id: string;
  category: DirCategory;
  areaId: AreaId;
  verified: boolean;
  whatsapp: string;
  image: string;
  name: string;
  area: string;
  description: string;
}
