const CHUNK_LOAD_ERROR =
  /failed to fetch dynamically imported module|error loading dynamically imported module|importing a module script failed|loading chunk [\w-]+ failed|unable to preload css/i;

/** True when a lazy route failed because its JavaScript (or CSS) chunk did not load. */
export function isChunkLoadError(error: unknown): boolean {
  if (!(error instanceof Error)) {
    return false;
  }

  return error.name === "ChunkLoadError" || CHUNK_LOAD_ERROR.test(error.message);
}
