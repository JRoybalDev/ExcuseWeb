import { Fragment, type CSSProperties, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { FiChevronDown, FiSearch } from "react-icons/fi";

const MENU_MAX_HEIGHT = 240;
const MENU_GAP = 6;

export type SelectOption<T extends string> = { value: T; label: string };
export type SelectGroup<T extends string> = { label: string; options: SelectOption<T>[] };

export function SelectDropdown<T extends string>({
  value,
  options,
  groups,
  onChange,
  className,
  searchable,
  searchPlaceholder = "Search…"
}: {
  value: T;
  options?: SelectOption<T>[];
  groups?: SelectGroup<T>[];
  onChange: (value: T) => void;
  className?: string;
  searchable?: boolean;
  searchPlaceholder?: string;
}) {
  const [open, setOpen] = useState(false);
  const [menuStyle, setMenuStyle] = useState<CSSProperties | null>(null);
  const [query, setQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const resolvedGroups = useMemo<SelectGroup<T>[]>(() => groups ?? [{ label: "", options: options ?? [] }], [groups, options]);
  const selected = useMemo(
    () => resolvedGroups.flatMap((group) => group.options).find((option) => option.value === value),
    [resolvedGroups, value]
  );

  const normalizedQuery = query.trim().toLowerCase();
  const visibleGroups = normalizedQuery
    ? resolvedGroups
        .map((group) => ({ ...group, options: group.options.filter((option) => option.label.toLowerCase().includes(normalizedQuery)) }))
        .filter((group) => group.options.length > 0)
    : resolvedGroups;

  // Both the dashboard and the public/coming-soon pages scope their color tokens to a
  // wrapper class (`.admin-dashboard`, `.coming-soon-page`) rather than `:root`, so a menu
  // portaled straight to `document.body` would render with no theme colors (transparent).
  const portalTarget =
    containerRef.current?.closest(".admin-dashboard") ?? containerRef.current?.closest(".coming-soon-page") ?? document.body;

  useEffect(() => {
    if (!open) {
      setQuery("");
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
  }, [open, searchable]);

  // Runs after the render where menuStyle actually becomes non-null (i.e. once the portal —
  // and the search input inside it — has committed to the DOM), so the ref is guaranteed to
  // be attached. A single combined effect can't guarantee that: on the render that flips
  // `open` to true, `menuStyle` is still the old value, so the portal doesn't mount until a
  // second render triggered by updatePosition() above.
  useEffect(() => {
    if (open && searchable && menuStyle) {
      searchInputRef.current?.focus();
    }
  }, [open, searchable, menuStyle]);

  return (
    <div className={className ? `select-dropdown ${className}` : "select-dropdown"} ref={containerRef}>
      <button
        type="button"
        className="select-dropdown__trigger"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
        onMouseDown={searchable ? (event) => event.preventDefault() : undefined}
        ref={triggerRef}
      >
        <span>{selected?.label ?? ""}</span>
        <FiChevronDown aria-hidden className="select-dropdown__caret" />
      </button>
      {open && menuStyle
        ? createPortal(
            <div className="select-dropdown__panel" style={menuStyle} ref={menuRef}>
              {searchable ? (
                <div className="select-dropdown__search">
                  <FiSearch aria-hidden />
                  <input ref={searchInputRef} type="text" placeholder={searchPlaceholder} value={query} onChange={(event) => setQuery(event.target.value)} />
                </div>
              ) : null}
              <ul className="select-dropdown__menu" role="listbox">
                {visibleGroups.length === 0 ? (
                  <li className="select-dropdown__empty">No matches</li>
                ) : (
                  visibleGroups.map((group, groupIndex) => (
                    <Fragment key={group.label || groupIndex}>
                      {group.label ? (
                        <li className="select-dropdown__group-label" role="presentation">
                          {group.label}
                        </li>
                      ) : null}
                      {group.options.map((option) => (
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
                    </Fragment>
                  ))
                )}
              </ul>
            </div>,
            portalTarget
          )
        : null}
    </div>
  );
}
