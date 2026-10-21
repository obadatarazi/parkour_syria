import assert from "node:assert/strict";
import { test } from "node:test";

import { resolveReturnPath } from "../src/shared/lib/routing/return-path.utils.ts";

const FALLBACK = "/admin";

const from = (pathname: unknown, search = "", hash = "") =>
  ({ from: { pathname, search, hash } }) as Parameters<typeof resolveReturnPath>[0];

test("keeps an in-app deep link, including query and hash", () => {
  assert.equal(
    resolveReturnPath(from("/admin/orders", "?status=pending", "#top"), FALLBACK),
    "/admin/orders?status=pending#top",
  );
});

test("falls back when there is no stored location", () => {
  assert.equal(resolveReturnPath(null, FALLBACK), FALLBACK);
  assert.equal(resolveReturnPath({}, FALLBACK), FALLBACK);
  assert.equal(resolveReturnPath(from(undefined), FALLBACK), FALLBACK);
  assert.equal(resolveReturnPath(from(42), FALLBACK), FALLBACK);
});

test("ignores ?redirect= on the login page (the app has no redirect query param)", () => {
  assert.equal(
    resolveReturnPath(from("/login", "?redirect=https://google.com"), FALLBACK),
    FALLBACK,
  );
});

const externalTargets = [
  "https://google.com",
  "http://evil.com/admin",
  "javascript:alert(1)",
  "//evil.com",
  "//evil.com/admin",
  "/\\evil.com",
  "/\\/evil.com",
  "/\t/evil.com",
  "/\n/evil.com",
  "/\r\n/evil.com",
  "evil.com",
  "",
];

for (const target of externalTargets) {
  test(`rejects external target ${JSON.stringify(target)}`, () => {
    const result = resolveReturnPath(from(target), FALLBACK);
    assert.equal(result, FALLBACK);
    // Whatever comes back must resolve to the dashboard's own origin.
    assert.equal(
      new URL(result, "https://admin.example.test").origin,
      "https://admin.example.test",
    );
  });
}

test("never returns a path that a browser would resolve off-origin", () => {
  const base = "https://admin.example.test";
  const candidates = [...externalTargets, "/admin", "/admin/products/12", "/%2F%2Fevil.com"];
  for (const pathname of candidates) {
    const result = resolveReturnPath(from(pathname, "?x=//evil.com", "#//evil.com"), FALLBACK);
    assert.equal(new URL(result, base).origin, base, `leaked for ${JSON.stringify(pathname)}`);
  }
});
