import type { DirectoryEntriesService } from "@/features/directory-entries/services/directory-entries.service.types";
import { createApiDirectoryEntriesService } from "@/features/directory-entries/services/directory-entries-api.service";

export const directoryEntriesService: DirectoryEntriesService = createApiDirectoryEntriesService();
