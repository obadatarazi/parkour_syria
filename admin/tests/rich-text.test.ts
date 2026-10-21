import assert from "node:assert/strict";
import { test } from "node:test";

import { fromEditorHtml, plainTextToHtml, toEditorHtml } from "@/shared/lib/rich-text.utils";

test("opens text saved before the editor as escaped paragraphs", () => {
  assert.equal(
    plainTextToHtml("First line\nsame paragraph\n\n<b>Second</b>"),
    "<p>First line<br>same paragraph</p><p>&lt;b&gt;Second&lt;/b&gt;</p>",
  );
  assert.equal(
    toEditorHtml("<p>Already <strong>html</strong></p>"),
    "<p>Already <strong>html</strong></p>",
  );
  assert.equal(toEditorHtml("   "), "");
});

test("stores an empty editor as an empty string", () => {
  assert.equal(fromEditorHtml("<p></p>"), "");
  assert.equal(fromEditorHtml("<p><br></p><h2>&nbsp;</h2>"), "");
  assert.equal(fromEditorHtml("<hr>"), "<hr>");
  assert.equal(
    fromEditorHtml('<p><span style="color: red">نص</span></p>'),
    '<p><span style="color: red">نص</span></p>',
  );
});
