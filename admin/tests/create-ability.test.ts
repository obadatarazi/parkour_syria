import assert from "node:assert/strict";
import { test } from "node:test";

import { createAbility } from "@/features/auth/ability/createAbility";

test("ignores unknown permission strings and still expands known MANAGE_* permissions", () => {
  const ability = createAbility([
    "MANAGE_ORDER",
    "PERMISSION_NOT_A_REAL_ONE",
    "__proto__",
    "constructor",
  ]);

  assert.equal(ability.can("PERMISSION_NOT_A_REAL_ONE", "all"), false);
  assert.equal(ability.can("__proto__", "all"), false);
  assert.equal(ability.can("constructor", "all"), false);

  assert.equal(ability.can("MANAGE_ORDER", "all"), true);
  for (const action of ["CREATE", "UPDATE", "DELETE", "SHOW"]) {
    assert.equal(ability.can(`PERMISSION_${action}_ORDER`, "all"), true, action);
  }
  assert.equal(ability.can("PERMISSION_DOWNLOAD_ORDER", "all"), true);
  assert.equal(ability.can("MANAGE_PRODUCT", "all"), false);
});
