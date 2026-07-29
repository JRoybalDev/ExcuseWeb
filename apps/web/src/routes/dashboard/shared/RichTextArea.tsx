import { useEffect, useRef, useState } from "react";
import { FaBold, FaItalic, FaListOl, FaListUl, FaUnderline } from "react-icons/fa";

type ToggleFormat = "bold" | "italic" | "underline";
type HeadingLevel = "h1" | "h2" | "h3";
type ActiveFormats = Record<ToggleFormat | HeadingLevel | "ul" | "ol", boolean>;

const NO_ACTIVE_FORMATS: ActiveFormats = {
  bold: false,
  italic: false,
  underline: false,
  h1: false,
  h2: false,
  h3: false,
  ul: false,
  ol: false
};

const INSERTING_INPUT_TYPES = new Set(["insertText", "insertFromPaste", "insertCompositionText", "insertReplacementText", "insertFromDrop"]);

export function RichTextArea({
  value,
  onChange,
  onBlur,
  placeholder,
  maxLength = 2000
}: {
  value: string;
  onChange: (html: string) => void;
  onBlur: (html: string) => void;
  placeholder?: string;
  maxLength?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const lastValue = useRef<string | null>(null);
  const [activeFormats, setActiveFormats] = useState<ActiveFormats>(NO_ACTIVE_FORMATS);
  const [length, setLength] = useState(0);

  useEffect(() => {
    if (ref.current && value !== lastValue.current) {
      ref.current.innerHTML = value;
      lastValue.current = value;
      setLength(ref.current.textContent?.length ?? 0);
    }
  }, [value]);

  function currentHtml() {
    const el = ref.current;
    if (!el) {
      return "";
    }
    return el.textContent?.trim() ? el.innerHTML : "";
  }

  function emit() {
    const html = currentHtml();
    lastValue.current = html;
    setLength(ref.current?.textContent?.length ?? 0);
    onChange(html);
  }

  function currentBlockTag() {
    return (document.queryCommandValue("formatBlock") || "").toLowerCase();
  }

  function updateActiveFormats() {
    const block = currentBlockTag();
    setActiveFormats({
      bold: document.queryCommandState("bold"),
      italic: document.queryCommandState("italic"),
      underline: document.queryCommandState("underline"),
      ul: document.queryCommandState("insertUnorderedList"),
      ol: document.queryCommandState("insertOrderedList"),
      h1: block === "h1",
      h2: block === "h2",
      h3: block === "h3"
    });
  }

  function toggleFormat(command: ToggleFormat) {
    ref.current?.focus();
    document.execCommand(command);
    emit();
    updateActiveFormats();
  }

  function toggleList(command: "insertUnorderedList" | "insertOrderedList") {
    ref.current?.focus();
    document.execCommand(command);
    emit();
    updateActiveFormats();
  }

  function toggleHeading(level: HeadingLevel) {
    ref.current?.focus();
    const isActive = currentBlockTag() === level;
    document.execCommand("formatBlock", false, isActive ? "p" : level);
    emit();
    updateActiveFormats();
  }

  function handleBeforeInput(event: React.FormEvent<HTMLDivElement>) {
    const inputType = (event.nativeEvent as InputEvent).inputType;
    if (!INSERTING_INPUT_TYPES.has(inputType)) {
      return;
    }
    const currentLength = ref.current?.textContent?.length ?? 0;
    if (currentLength >= maxLength) {
      event.preventDefault();
    }
  }

  const overLimit = length > maxLength;

  return (
    <div className="richtext">
      <div className="richtext__toolbar">
        <button
          type="button"
          className={activeFormats.bold ? "richtext__btn richtext__btn--active" : "richtext__btn"}
          aria-label="Bold"
          aria-pressed={activeFormats.bold}
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => toggleFormat("bold")}
        >
          <FaBold aria-hidden />
        </button>
        <button
          type="button"
          className={activeFormats.italic ? "richtext__btn richtext__btn--active" : "richtext__btn"}
          aria-label="Italic"
          aria-pressed={activeFormats.italic}
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => toggleFormat("italic")}
        >
          <FaItalic aria-hidden />
        </button>
        <button
          type="button"
          className={activeFormats.underline ? "richtext__btn richtext__btn--active" : "richtext__btn"}
          aria-label="Underline"
          aria-pressed={activeFormats.underline}
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => toggleFormat("underline")}
        >
          <FaUnderline aria-hidden />
        </button>

        <span className="richtext__divider" />

        <button
          type="button"
          className={activeFormats.h1 ? "richtext__btn richtext__btn--text richtext__btn--active" : "richtext__btn richtext__btn--text"}
          aria-label="Heading 1"
          aria-pressed={activeFormats.h1}
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => toggleHeading("h1")}
        >
          H1
        </button>
        <button
          type="button"
          className={activeFormats.h2 ? "richtext__btn richtext__btn--text richtext__btn--active" : "richtext__btn richtext__btn--text"}
          aria-label="Heading 2"
          aria-pressed={activeFormats.h2}
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => toggleHeading("h2")}
        >
          H2
        </button>
        <button
          type="button"
          className={activeFormats.h3 ? "richtext__btn richtext__btn--text richtext__btn--active" : "richtext__btn richtext__btn--text"}
          aria-label="Heading 3"
          aria-pressed={activeFormats.h3}
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => toggleHeading("h3")}
        >
          H3
        </button>

        <span className="richtext__divider" />

        <button
          type="button"
          className={activeFormats.ul ? "richtext__btn richtext__btn--active" : "richtext__btn"}
          aria-label="Bulleted list"
          aria-pressed={activeFormats.ul}
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => toggleList("insertUnorderedList")}
        >
          <FaListUl aria-hidden />
        </button>
        <button
          type="button"
          className={activeFormats.ol ? "richtext__btn richtext__btn--active" : "richtext__btn"}
          aria-label="Numbered list"
          aria-pressed={activeFormats.ol}
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => toggleList("insertOrderedList")}
        >
          <FaListOl aria-hidden />
        </button>

        <span className={overLimit ? "richtext__count richtext__count--over" : "richtext__count"}>
          {length} / {maxLength}
        </span>
      </div>
      <div
        ref={ref}
        className="richtext__area"
        contentEditable
        suppressContentEditableWarning
        data-placeholder={placeholder}
        onInput={emit}
        onBeforeInput={handleBeforeInput}
        onKeyUp={updateActiveFormats}
        onMouseUp={updateActiveFormats}
        onFocus={updateActiveFormats}
        onBlur={() => {
          const html = currentHtml();
          if (!html && ref.current) {
            ref.current.innerHTML = "";
            lastValue.current = "";
          }
          onBlur(html);
          setActiveFormats(NO_ACTIVE_FORMATS);
        }}
      />
    </div>
  );
}
