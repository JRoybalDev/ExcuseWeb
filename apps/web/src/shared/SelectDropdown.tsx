import { type CSSProperties, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { FiChevronDown } from "react-icons/fi";

const MENU_MAX_HEIGHT = 240;
const MENU_GAP = 6;

export function SelectDropdown<T extends string>({
  value,
  options,
  onChange,
  className
}: {
  value: T;
  options: { value: T; label: string }[];
  onChange: (value: T) => void;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [menuStyle, setMenuStyle] = useState<CSSProperties | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLUListElement>(null);
  const selected = options.find((option) => option.value === value);

  // The dashboard scopes its color tokens to `.admin-dashboard` rather than `:root`,
  // so a menu portaled straight to `document.body` would render with no theme colors.
  const portalTarget = containerRef.current?.closest(".admin-dashboard") ?? document.body;

  useEffect(() => {
    if (!open) {
      return;
    }

    function updatePosition() {
      const rect = triggerRef.current?.getBoundingClientRect();
      if (!rect) {
        return;
      }

      const spaceBelow = window.innerHeight - rect.bottom;
      const placeAbove = spaceBelow < MENU_MAX_HEIGHT && rect.top > spaceBelow;

      setMenuStyle({
        position: "fixed",
        left: rect.left,
        width: rect.width,
        ...(placeAbove ? { bottom: window.innerHeight - rect.top + MENU_GAP } : { top: rect.bottom + MENU_GAP })
      });
    }

    updatePosition();

    function onPointerDown(event: MouseEvent) {
      const target = event.target as Node;
      if (containerRef.current?.contains(target) || menuRef.current?.contains(target)) {
        return;
      }
      setOpen(false);
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    window.addEventListener("scroll", updatePosition, true);
    window.addEventListener("resize", updatePosition);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("scroll", updatePosition, true);
      window.removeEventListener("resize", updatePosition);
    };
  }, [open]);

  return (
    <div className={className ? `select-dropdown ${className}` : "select-dropdown"} ref={containerRef}>
      <button
        type="button"
        className="select-dropdown__trigger"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
        ref={triggerRef}
      >
        <span>{selected?.label ?? ""}</span>
        <FiChevronDown aria-hidden className="select-dropdown__caret" />
      </button>
      {open && menuStyle
        ? createPortal(
            <ul className="select-dropdown__menu" role="listbox" style={menuStyle} ref={menuRef}>
              {options.map((option) => (
                <li key={option.value}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={option.value === value}
                    className={
                      option.value === value ? "select-dropdown__option select-dropdown__option--active" : "select-dropdown__option"
                    }
                    onClick={() => {
                      onChange(option.value);
                      setOpen(false);
                    }}
                  >
                    {option.label}
                  </button>
                </li>
              ))}
            </ul>,
            portalTarget
          )
        : null}
    </div>
  );
}
