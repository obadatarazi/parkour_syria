// Test-only resolver: maps the "@/..." alias to src/ and adds .ts/.tsx
// extensions, mirroring Vite/tsconfig resolution for `node --test`.
import { existsSync } from "node:fs";
import { register } from "node:module";
import { fileURLToPath, pathToFileURL, URL } from "node:url";

const SRC = fileURLToPath(new URL("../../src/", import.meta.url));
const EXTENSIONS = ["", ".ts", ".tsx", "/index.ts", "/index.tsx"];

export async function resolve(specifier, context, nextResolve) {
  if (specifier.startsWith("@/")) {
    const base = SRC + specifier.slice(2);
    const match = EXTENSIONS.map((ext) => base + ext).find(
      (file) => existsSync(file) && !file.endsWith("/"),
    );
    if (match) return nextResolve(pathToFileURL(match).href, context);
  }
  return nextResolve(specifier, context);
}

if (!globalThis.__aliasLoaderRegistered) {
  globalThis.__aliasLoaderRegistered = true;
  register(import.meta.url);
}
