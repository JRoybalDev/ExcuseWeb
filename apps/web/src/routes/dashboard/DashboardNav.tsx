import { NavLink } from "react-router-dom";

export type DashboardNavItem = { path: string; label: string };

export const DASHBOARD_NAV_ITEMS: DashboardNavItem[] = [
  { path: "schedule", label: "Schedule" },
  { path: "calendar", label: "Calendar" },
  { path: "checklists", label: "Checklists" },
  { path: "title-lab", label: "Title Lab" },
  { path: "audit", label: "Audit" },
  { path: "templates", label: "Templates" }
];

export function DashboardNav() {
  return (
    <nav className="dashboard-nav" aria-label="Dashboard sections">
      {DASHBOARD_NAV_ITEMS.map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          className={({ isActive }) => (isActive ? "dashboard-nav__link dashboard-nav__link--active" : "dashboard-nav__link")}
        >
          {item.label}
        </NavLink>
      ))}
    </nav>
  );
}
