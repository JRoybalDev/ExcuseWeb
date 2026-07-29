import { useEffect, useRef } from "react";
import { FaBold, FaItalic, FaUnderline } from "react-icons/fa";

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

  useEffect(() => {
    if (ref.current && value !== lastValue.current) {
      ref.current.innerHTML = value;
      lastValue.current = value;
    }
  }, [value]);

  function emit() {
    const html = ref.current?.innerHTML ?? "";
    lastValue.current = html;
    onChange(html);
  }

  function format(command: "bold" | "italic" | "underline") {
    ref.current?.focus();
    document.execCommand(command);
    emit();
  }

  return (
    <div className="richtext">
      <div className="richtext__toolbar">
        <button
          type="button"
          className="richtext__btn"
          aria-label="Bold"
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => format("bold")}
        >
          <FaBold aria-hidden />
        </button>
        <button
          type="button"
          className="richtext__btn"
          aria-label="Italic"
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => format("italic")}
        >
          <FaItalic aria-hidden />
        </button>
        <button
          type="button"
          className="richtext__btn"
          aria-label="Underline"
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
        onBlur={() => onBlur(ref.current?.innerHTML ?? "")}
      />
    </div>
  );
}
