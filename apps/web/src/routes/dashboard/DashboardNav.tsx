import { useEffect, useRef, useState } from "react";
import type { IconType } from "react-icons";
import { FiActivity, FiCalendar, FiCheckSquare, FiChevronLeft, FiChevronRight, FiClock, FiInbox, FiLayers, FiType, FiX } from "react-icons/fi";
import { NavLink, useLocation } from "react-router-dom";

type NavItem = { path: string; label: string; icon: IconType };

const TOP_ITEMS: NavItem[] = [{ path: "schedule", label: "Schedule", icon: FiClock }];

const PLANNING_ITEMS: NavItem[] = [
  { path: "calendar", label: "Calendar", icon: FiCalendar },
  { path: "checklists", label: "Checklists", icon: FiCheckSquare },
  { path: "title-lab", label: "Title Lab", icon: FiType },
  { path: "audit", label: "Audit", icon: FiActivity }
];

const BOTTOM_ITEMS: NavItem[] = [
  { path: "templates", label: "Templates", icon: FiLayers },
  { path: "build-requests", label: "Build Requests", icon: FiInbox }
];

export function DashboardNav({ mobileOpen, onCloseMobile }: { mobileOpen: boolean; onCloseMobile: () => void }) {
  const [collapsed, setCollapsed] = useState(false);
  const asideRef = useRef<HTMLElement>(null);
  const location = useLocation();

  useEffect(() => {
    onCloseMobile();
    const active = asideRef.current?.querySelector<HTMLElement>(".admin-sidebar__link--active");
    active?.scrollIntoView({ block: "nearest" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  useEffect(() => {
    if (!mobileOpen) {
      return;
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onCloseMobile();
      }
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mobileOpen]);

  return (
    <>
      {mobileOpen ? <div className="admin-nav-backdrop" onClick={onCloseMobile} /> : null}
      <aside
        className={[
          "admin-sidebar",
          collapsed ? "admin-sidebar--collapsed" : "",
          mobileOpen ? "admin-sidebar--mobile-open" : ""
        ]
          .filter(Boolean)
          .join(" ")}
        aria-label="Dashboard sections"
        ref={asideRef}
      >
        <div className="admin-sidebar__grabber" aria-hidden />
        <div className="admin-sidebar__mobile-header">
          <span className="admin-sidebar__mobile-title">Dashboard sections</span>
          <button type="button" className="admin-sidebar__mobile-close" onClick={onCloseMobile} aria-label="Close navigation">
            <FiX aria-hidden />
          </button>
        </div>

        <button
          type="button"
          className="admin-sidebar__toggle"
          onClick={() => setCollapsed((current) => !current)}
          aria-label={collapsed ? "Expand navigation" : "Collapse navigation"}
        >
          {collapsed ? <FiChevronRight aria-hidden /> : <FiChevronLeft aria-hidden />}
          {!collapsed ? <span>Collapse</span> : null}
        </button>

        {TOP_ITEMS.map((item) => (
          <SidebarLink key={item.path} item={item} collapsed={collapsed} />
        ))}

        <div className="admin-sidebar__divider" />
        {!collapsed ? <span className="admin-sidebar__group-label">Planning</span> : null}
        {PLANNING_ITEMS.map((item) => (
          <SidebarLink key={item.path} item={item} collapsed={collapsed} />
        ))}

        <div className="admin-sidebar__divider" />
        {BOTTOM_ITEMS.map((item) => (
          <SidebarLink key={item.path} item={item} collapsed={collapsed} />
        ))}
      </aside>
    </>
  );
}

function SidebarLink({ item, collapsed }: { item: NavItem; collapsed: boolean }) {
  const Icon = item.icon;

  return (
    <NavLink to={item.path} title={item.label} className={({ isActive }) => (isActive ? "admin-sidebar__link admin-sidebar__link--active" : "admin-sidebar__link")}>
      <Icon aria-hidden />
      {!collapsed ? <span>{item.label}</span> : null}
    </NavLink>
  );
}
