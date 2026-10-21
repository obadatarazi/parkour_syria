import {
  DIRECTORY_ENTRY_TYPES,
  type DirectoryEntryType,
} from "@/features/directory-entries/types/directory-entries.types";
import type { Translation } from "@/shared/design-system/localization/locales/en";

export function directoryEntryTypeLabel(t: Translation, type: DirectoryEntryType | string): string {
  switch (type) {
    case "place":
      return t.directoryTypePlace;
    case "coach":
      return t.directoryTypeCoach;
    case "team":
      return t.directoryTypeTeam;
    default:
      return type;
  }
}

export function directoryEntryTypeOptions(t: Translation) {
  return DIRECTORY_ENTRY_TYPES.map((value) => ({ value, label: directoryEntryTypeLabel(t, value) }));
}
