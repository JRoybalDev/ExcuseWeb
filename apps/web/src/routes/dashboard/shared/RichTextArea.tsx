import { useEffect, useRef, useState } from "react";
import { FaBold, FaItalic, FaUnderline } from "react-icons/fa";

type FormatCommand = "bold" | "italic" | "underline";

export function RichTextArea({
  value,
  onChange,
  onBlur,
  placeholder
}: {
  value: string;
  onChange: (html: string) => void;
  onBlur: (html: string) => void;
  placeholder?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const lastValue = useRef<string | null>(null);
  const [activeFormats, setActiveFormats] = useState<Record<FormatCommand, boolean>>({
    bold: false,
    italic: false,
    underline: false
  });

  useEffect(() => {
    if (ref.current && value !== lastValue.current) {
      ref.current.innerHTML = value;
      lastValue.current = value;
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
    onChange(html);
  }

  function updateActiveFormats() {
    setActiveFormats({
      bold: document.queryCommandState("bold"),
      italic: document.queryCommandState("italic"),
      underline: document.queryCommandState("underline")
    });
  }

  function format(command: FormatCommand) {
    ref.current?.focus();
    document.execCommand(command);
    emit();
    updateActiveFormats();
  }

  return (
    <div className="richtext">
      <div className="richtext__toolbar">
        <button
          type="button"
          className={activeFormats.bold ? "richtext__btn richtext__btn--active" : "richtext__btn"}
          aria-label="Bold"
          aria-pressed={activeFormats.bold}
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => format("bold")}
        >
          <FaBold aria-hidden />
        </button>
        <button
          type="button"
          className={activeFormats.italic ? "richtext__btn richtext__btn--active" : "richtext__btn"}
          aria-label="Italic"
          aria-pressed={activeFormats.italic}
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => format("italic")}
        >
          <FaItalic aria-hidden />
        </button>
        <button
          type="button"
          className={activeFormats.underline ? "richtext__btn richtext__btn--active" : "richtext__btn"}
          aria-label="Underline"
          aria-pressed={activeFormats.underline}
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => format("underline")}
        >
          <FaUnderline aria-hidden />
        </button>
      </div>
      <div
        ref={ref}
        className="richtext__area"
        contentEditable
        suppressContentEditableWarning
        data-placeholder={placeholder}
        onInput={emit}
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
          setActiveFormats({ bold: false, italic: false, underline: false });
        }}
      />
    </div>
  );
}
