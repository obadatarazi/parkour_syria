import { Highlight } from "@tiptap/extension-highlight";
import { TextAlign } from "@tiptap/extension-text-align";
import { Color, TextStyle } from "@tiptap/extension-text-style";
import { Placeholder } from "@tiptap/extensions";
import { type Editor, EditorContent, useEditor, useEditorState } from "@tiptap/react";
import { StarterKit } from "@tiptap/starter-kit";
import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  Baseline,
  Bold,
  Highlighter,
  Italic,
  Link2,
  List,
  ListOrdered,
  type LucideIcon,
  Minus,
  Quote,
  Redo2,
  RemoveFormatting,
  Strikethrough,
  Underline,
  Undo2,
} from "lucide-react";
import { type ReactNode, useEffect, useId, useRef, useState } from "react";

import { FormField } from "@/shared/components/forms/FormField";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/shared/design-system/components/ui/popover";
import { cn } from "@/shared/design-system/components/ui/utils";
import { useTranslation } from "@/shared/design-system/localization/contexts/LocalizationContext";
import { fromEditorHtml, toEditorHtml } from "@/shared/lib/rich-text.utils";

/** Brand-friendly swatches; the custom picker covers anything else. */
const TEXT_COLORS = [
  "#111827",
  "#6b7280",
  "#dc2626",
  "#ea580c",
  "#ca8a04",
  "#16a34a",
  "#0891b2",
  "#2563eb",
  "#7c3aed",
  "#db2777",
];
const HIGHLIGHT_COLORS = [
  "#fef08a",
  "#fed7aa",
  "#fecaca",
  "#bbf7d0",
  "#a5f3fc",
  "#bfdbfe",
  "#ddd6fe",
  "#fbcfe8",
];

export type RichTextFieldProps = {
  label: string;
  value: string;
  onChange: (html: string) => void;
  helperText?: string;
  error?: string;
  required?: boolean;
  placeholder?: string;
  dir?: "rtl" | "ltr";
  /** Height of the empty writing area, in text rows. */
  rows?: number;
  containerClassName?: string;
};

/**
 * Word-processor style field for long text: headings, emphasis, colors, lists, alignment and
 * links. Stores HTML; plain text saved before the editor existed opens as paragraphs.
 * Loaded through `RichTextField`, which keeps the editor out of the main bundle.
 */
export default function RichTextEditor({
  label,
  value,
  onChange,
  helperText,
  error,
  required,
  placeholder,
  dir = "rtl",
  rows = 10,
  containerClassName,
}: RichTextFieldProps) {
  const t = useTranslation();
  const id = useId();
  // The editor keeps its first callbacks; read the latest onChange so edits merge into fresh state.
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3, 4] },
        codeBlock: false,
        link: { openOnClick: false, autolink: true, defaultProtocol: "https" },
      }),
      TextStyle,
      Color,
      Highlight.configure({ multicolor: true }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Placeholder.configure({ placeholder: placeholder ?? t.editorPlaceholder }),
    ],
    content: toEditorHtml(value),
    editorProps: {
      attributes: {
        id,
        dir,
        class: "rich-text px-4 py-3 text-sm",
        style: `min-height: ${rows * 1.75}rem`,
        "aria-label": label,
        "aria-invalid": error ? "true" : "false",
      },
    },
    onUpdate: ({ editor: current }) => onChangeRef.current(fromEditorHtml(current.getHTML())),
  });

  // A reset or another record loaded into the same form replaces the content.
  useEffect(() => {
    if (!editor || editor.isDestroyed) return;
    if (fromEditorHtml(editor.getHTML()) !== value) {
      editor.commands.setContent(toEditorHtml(value), { emitUpdate: false });
    }
  }, [editor, value]);

  return (
    <FormField
      label={label}
      fieldId={id}
      required={required}
      helperText={helperText}
      error={error}
      containerClassName={containerClassName}
    >
      <div
        className={cn(
          "overflow-hidden rounded-md border border-input bg-input-background transition-[color,box-shadow] dark:bg-input/30",
          "focus-within:border-ring focus-within:ring-[3px] focus-within:ring-ring/50",
          error && "border-destructive ring-destructive/20",
        )}
      >
        {editor ? <RichTextToolbar editor={editor} /> : null}
        <div className="max-h-[min(65dvh,44rem)] overflow-y-auto overscroll-contain">
          <EditorContent editor={editor} />
        </div>
      </div>
    </FormField>
  );
}

function RichTextToolbar({ editor }: { editor: Editor }) {
  const t = useTranslation();
  const state = useEditorState({
    editor,
    selector: ({ editor: current }) => ({
      block: current.isActive("heading", { level: 2 })
        ? "h2"
        : current.isActive("heading", { level: 3 })
          ? "h3"
          : current.isActive("heading", { level: 4 })
            ? "h4"
            : "p",
      bold: current.isActive("bold"),
      italic: current.isActive("italic"),
      underline: current.isActive("underline"),
      strike: current.isActive("strike"),
      bulletList: current.isActive("bulletList"),
      orderedList: current.isActive("orderedList"),
      blockquote: current.isActive("blockquote"),
      link: current.isActive("link"),
      linkHref: (current.getAttributes("link").href as string | undefined) ?? "",
      color: (current.getAttributes("textStyle").color as string | undefined) ?? "",
      highlight: (current.getAttributes("highlight").color as string | undefined) ?? "",
      align: (["right", "center", "left", "justify"] as const).find((align) =>
        current.isActive({ textAlign: align }),
      ),
      canUndo: current.can().undo(),
      canRedo: current.can().redo(),
    }),
  });

  const chain = () => editor.chain().focus();

  return (
    <div
      role="toolbar"
      aria-label={t.editorToolbar}
      className="flex flex-wrap items-center gap-0.5 border-b border-border/60 bg-muted/40 px-1.5 py-1"
    >
      <select
        aria-label={t.editorTextStyle}
        value={state.block}
        onChange={(event) => {
          const next = event.target.value;
          if (next === "p") chain().setParagraph().run();
          else
            chain()
              .setHeading({ level: Number(next.slice(1)) as 2 | 3 | 4 })
              .run();
        }}
        className="h-8 rounded-md border border-transparent bg-transparent px-2 text-sm font-medium hover:bg-background focus-visible:border-ring focus-visible:outline-hidden"
      >
        <option value="p">{t.editorParagraph}</option>
        <option value="h2">{t.editorHeading1}</option>
        <option value="h3">{t.editorHeading2}</option>
        <option value="h4">{t.editorHeading3}</option>
      </select>

      <ToolbarDivider />
      <ToolbarButton
        icon={Bold}
        label={t.editorBold}
        active={state.bold}
        onClick={() => chain().toggleBold().run()}
      />
      <ToolbarButton
        icon={Italic}
        label={t.editorItalic}
        active={state.italic}
        onClick={() => chain().toggleItalic().run()}
      />
      <ToolbarButton
        icon={Underline}
        label={t.editorUnderline}
        active={state.underline}
        onClick={() => chain().toggleUnderline().run()}
      />
      <ToolbarButton
        icon={Strikethrough}
        label={t.editorStrike}
        active={state.strike}
        onClick={() => chain().toggleStrike().run()}
      />

      <ToolbarDivider />
      <ColorPicker
        icon={Baseline}
        label={t.editorTextColor}
        colors={TEXT_COLORS}
        value={state.color}
        onPick={(color) => chain().setColor(color).run()}
        onClear={() => chain().unsetColor().run()}
      />
      <ColorPicker
        icon={Highlighter}
        label={t.editorHighlight}
        colors={HIGHLIGHT_COLORS}
        value={state.highlight}
        onPick={(color) => chain().setHighlight({ color }).run()}
        onClear={() => chain().unsetHighlight().run()}
      />

      <ToolbarDivider />
      <ToolbarButton
        icon={List}
        label={t.editorBulletList}
        active={state.bulletList}
        onClick={() => chain().toggleBulletList().run()}
      />
      <ToolbarButton
        icon={ListOrdered}
        label={t.editorOrderedList}
        active={state.orderedList}
        onClick={() => chain().toggleOrderedList().run()}
      />
      <ToolbarButton
        icon={Quote}
        label={t.editorQuote}
        active={state.blockquote}
        onClick={() => chain().toggleBlockquote().run()}
      />
      <ToolbarButton
        icon={Minus}
        label={t.editorDivider}
        onClick={() => chain().setHorizontalRule().run()}
      />

      <ToolbarDivider />
      <ToolbarButton
        icon={AlignRight}
        label={t.editorAlignRight}
        active={state.align === "right"}
        onClick={() => toggleAlign("right")}
      />
      <ToolbarButton
        icon={AlignCenter}
        label={t.editorAlignCenter}
        active={state.align === "center"}
        onClick={() => toggleAlign("center")}
      />
      <ToolbarButton
        icon={AlignLeft}
        label={t.editorAlignLeft}
        active={state.align === "left"}
        onClick={() => toggleAlign("left")}
      />
      <ToolbarButton
        icon={AlignJustify}
        label={t.editorAlignJustify}
        active={state.align === "justify"}
        onClick={() => toggleAlign("justify")}
      />

      <ToolbarDivider />
      <LinkPicker
        active={state.link}
        href={state.linkHref}
        onApply={(href) => chain().extendMarkRange("link").setLink({ href }).run()}
        onRemove={() => chain().extendMarkRange("link").unsetLink().run()}
      />
      <ToolbarButton
        icon={RemoveFormatting}
        label={t.editorClearFormatting}
        onClick={() => chain().unsetAllMarks().clearNodes().unsetTextAlign().run()}
      />

      <div className="ms-auto flex items-center gap-0.5">
        <ToolbarButton
          icon={Undo2}
          label={t.editorUndo}
          disabled={!state.canUndo}
          onClick={() => chain().undo().run()}
        />
        <ToolbarButton
          icon={Redo2}
          label={t.editorRedo}
          disabled={!state.canRedo}
          onClick={() => chain().redo().run()}
        />
      </div>
    </div>
  );

  function toggleAlign(align: "right" | "center" | "left" | "justify") {
    if (state.align === align) chain().unsetTextAlign().run();
    else chain().setTextAlign(align).run();
  }
}

function ToolbarDivider() {
  return <span className="mx-1 h-5 w-px bg-border" aria-hidden="true" />;
}

const toolbarButtonClass = (active?: boolean) =>
  cn(
    "inline-flex size-8 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors",
    "hover:bg-background hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-hidden",
    "disabled:pointer-events-none disabled:opacity-40",
    active && "bg-background text-primary shadow-xs",
  );

type ToolbarButtonProps = {
  icon: LucideIcon;
  label: string;
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
};

function ToolbarButton({ icon: Icon, label, onClick, active, disabled }: ToolbarButtonProps) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      aria-pressed={active}
      disabled={disabled}
      onClick={onClick}
      className={toolbarButtonClass(active)}
    >
      <Icon className="size-4" aria-hidden="true" />
    </button>
  );
}

type ColorPickerProps = {
  icon: LucideIcon;
  label: string;
  colors: string[];
  value: string;
  onPick: (color: string) => void;
  onClear: () => void;
};

function ColorPicker({ icon: Icon, label, colors, value, onPick, onClear }: ColorPickerProps) {
  const t = useTranslation();
  const [open, setOpen] = useState(false);

  const pick = (color: string) => {
    onPick(color);
    setOpen(false);
  };

  return (
    <ToolbarPopover
      open={open}
      onOpenChange={setOpen}
      trigger={
        <button
          type="button"
          title={label}
          aria-label={label}
          className={toolbarButtonClass(Boolean(value))}
        >
          <span className="flex flex-col items-center">
            <Icon className="size-4" aria-hidden="true" />
            <span
              className="mt-0.5 h-1 w-4 rounded-full"
              style={{ background: value || "currentColor", opacity: value ? 1 : 0.35 }}
            />
          </span>
        </button>
      }
    >
      <p className="mb-2 text-xs font-medium text-muted-foreground">{label}</p>
      <div className="grid grid-cols-5 gap-1.5">
        {colors.map((color) => (
          <button
            key={color}
            type="button"
            title={color}
            aria-label={color}
            onClick={() => pick(color)}
            className={cn(
              "size-7 rounded-md border border-black/10 transition-transform hover:scale-110 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-hidden",
              value.toLowerCase() === color && "ring-2 ring-primary ring-offset-1",
            )}
            style={{ background: color }}
          />
        ))}
      </div>
      <div className="mt-3 flex items-center justify-between gap-2 border-t border-border pt-3">
        <label className="flex cursor-pointer items-center gap-2 text-xs text-muted-foreground">
          <input
            type="color"
            value={value || colors[0]}
            onChange={(event) => onPick(event.target.value)}
            className="size-7 cursor-pointer rounded border border-border bg-transparent p-0"
          />
          {t.editorCustomColor}
        </label>
        <button
          type="button"
          onClick={() => {
            onClear();
            setOpen(false);
          }}
          className="rounded-md px-2 py-1 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          {t.editorRemoveColor}
        </button>
      </div>
    </ToolbarPopover>
  );
}

type LinkPickerProps = {
  active: boolean;
  href: string;
  onApply: (href: string) => void;
  onRemove: () => void;
};

function LinkPicker({ active, href, onApply, onRemove }: LinkPickerProps) {
  const t = useTranslation();
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState("");

  return (
    <ToolbarPopover
      open={open}
      onOpenChange={(next) => {
        if (next) setDraft(href);
        setOpen(next);
      }}
      trigger={
        <button
          type="button"
          title={t.editorLink}
          aria-label={t.editorLink}
          className={toolbarButtonClass(active)}
        >
          <Link2 className="size-4" aria-hidden="true" />
        </button>
      }
    >
      <div
        className="flex w-72 flex-col gap-2"
        onKeyDown={(event) => {
          if (event.key !== "Enter") return;
          event.preventDefault();
          if (draft.trim()) onApply(draft.trim());
          setOpen(false);
        }}
      >
        <p className="text-xs font-medium text-muted-foreground">{t.editorLink}</p>
        <input
          type="url"
          dir="ltr"
          autoFocus
          value={draft}
          placeholder="https://"
          onChange={(event) => setDraft(event.target.value)}
          className="h-9 w-full rounded-md border border-input bg-input-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
        />
        <div className="flex justify-end gap-2">
          {active ? (
            <button
              type="button"
              onClick={() => {
                onRemove();
                setOpen(false);
              }}
              className="rounded-md px-3 py-1.5 text-xs font-medium text-destructive hover:bg-destructive/10"
            >
              {t.editorRemoveLink}
            </button>
          ) : null}
          <button
            type="button"
            disabled={!draft.trim()}
            onClick={() => {
              onApply(draft.trim());
              setOpen(false);
            }}
            className="rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50"
          >
            {t.editorApply}
          </button>
        </div>
      </div>
    </ToolbarPopover>
  );
}

function ToolbarPopover({
  open,
  onOpenChange,
  trigger,
  children,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trigger: ReactNode;
  children: ReactNode;
}) {
  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>{trigger}</PopoverTrigger>
      <PopoverContent className="p-3" onOpenAutoFocus={(event) => event.preventDefault()}>
        {children}
      </PopoverContent>
    </Popover>
  );
}
