import { useState } from "react";
import type { IconType } from "react-icons";
import { FiActivity, FiCalendar, FiCheckSquare, FiChevronLeft, FiChevronRight, FiClock, FiInbox, FiLayers, FiType } from "react-icons/fi";
import { NavLink } from "react-router-dom";

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

export function DashboardNav() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside className={collapsed ? "admin-sidebar admin-sidebar--collapsed" : "admin-sidebar"} aria-label="Dashboard sections">
      <button
        type="button"
        className="admin-sidebar__toggle"
        onClick={() => setCollapsed((current) => !current)}
        aria-label={collapsed ? "Expand navigation" : "Collapse navigation"}
      >
        {collapsed ? <FiChevronRight aria-hidden /> : <FiChevronLeft aria-hidden />}
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
