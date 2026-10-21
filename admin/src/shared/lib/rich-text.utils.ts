/** Tags the editor writes, and the only ones a preview renders. Mirrors the backend allowlist. */
const ALLOWED_TAGS = new Set([
  "H2",
  "H3",
  "H4",
  "P",
  "BR",
  "STRONG",
  "B",
  "EM",
  "I",
  "U",
  "S",
  "UL",
  "OL",
  "LI",
  "A",
  "BLOCKQUOTE",
  "HR",
  "SPAN",
  "MARK",
  "CODE",
]);

const ALLOWED_STYLES = new Set(["color", "background-color", "text-align"]);

const escapeHtml = (text: string) =>
  text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

export function isHtml(value: string): boolean {
  return /<\/?[a-z][\s\S]*>/i.test(value);
}

/** Text saved before the editor existed: blank lines become paragraphs, single breaks stay. */
export function plainTextToHtml(text: string): string {
  return text
    .trim()
    .split(/\n{2,}/)
    .map((paragraph) => `<p>${escapeHtml(paragraph.trim()).replace(/\n/g, "<br>")}</p>`)
    .join("");
}

export function toEditorHtml(value: string): string {
  if (!value.trim()) return "";
  return isHtml(value) ? value : plainTextToHtml(value);
}

/** An editor with nothing typed still emits `<p></p>`; store that as an empty string. */
export function fromEditorHtml(html: string): string {
  const text = html
    .replace(/<br\s*\/?>/gi, "")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .trim();
  return text || /<hr\b/i.test(html) ? html : "";
}

function cleanStyle(style: string): string {
  return style
    .split(";")
    .map((rule) => rule.trim())
    .filter((rule) => {
      const [property, ...rest] = rule.split(":");
      const value = rest.join(":").toLowerCase();
      return (
        ALLOWED_STYLES.has(property?.trim().toLowerCase() ?? "") && !/url\(|expression/.test(value)
      );
    })
    .join("; ");
}

function cleanNode(node: Node, doc: Document): Node | null {
  if (node.nodeType === Node.TEXT_NODE) return doc.createTextNode(node.textContent ?? "");
  if (!(node instanceof Element)) return null;

  const children = Array.from(node.childNodes)
    .map((child) => cleanNode(child, doc))
    .filter((child): child is Node => child !== null);

  if (!ALLOWED_TAGS.has(node.tagName)) {
    const fragment = doc.createDocumentFragment();
    if (!["SCRIPT", "STYLE", "IFRAME", "OBJECT", "EMBED"].includes(node.tagName)) {
      children.forEach((child) => fragment.appendChild(child));
    }
    return fragment;
  }

  const clean = doc.createElement(node.tagName.toLowerCase());
  const style = cleanStyle(node.getAttribute("style") ?? "");
  if (style) clean.setAttribute("style", style);

  if (node.tagName === "A") {
    const href = node.getAttribute("href") ?? "";
    if (/^(https?:|mailto:|tel:|\/|#)/i.test(href.trim())) clean.setAttribute("href", href);
    clean.setAttribute("target", "_blank");
    clean.setAttribute("rel", "noopener noreferrer");
  }

  children.forEach((child) => clean.appendChild(child));
  return clean;
}

/** Rich text safe to put in the page: allowlisted tags, presentational styles, plain links. */
export function sanitizeRichText(value: string): string {
  const html = toEditorHtml(value);
  if (!html) return "";

  const doc = new DOMParser().parseFromString(html, "text/html");
  const container = doc.createElement("div");
  Array.from(doc.body.childNodes).forEach((child) => {
    const clean = cleanNode(child, doc);
    if (clean) container.appendChild(clean);
  });
  return container.innerHTML;
}
