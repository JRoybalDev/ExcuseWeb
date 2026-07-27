import { lazy, StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createBrowserRouter, Navigate, RouterProvider } from "react-router-dom";
import { App } from "./routes/App";
import "./styles/design-tokens.css";
import "./styles/branding.css";
import "./styles/index.css";
import "./styles/public.css";
import "./styles/dashboard.css";

const PublicSite = lazy(() => import("./routes/PublicSite").then((m) => ({ default: m.PublicSite })));
const BuildRequests = lazy(() => import("./routes/BuildRequests").then((m) => ({ default: m.BuildRequests })));
const ResetPassword = lazy(() => import("./routes/ResetPassword").then((m) => ({ default: m.ResetPassword })));
const NotFound = lazy(() => import("./routes/NotFound").then((m) => ({ default: m.NotFound })));

const DashboardLayout = lazy(() => import("./routes/dashboard/DashboardLayout").then((m) => ({ default: m.DashboardLayout })));
const ScheduleTab = lazy(() => import("./routes/dashboard/ScheduleTab").then((m) => ({ default: m.ScheduleTab })));
const CalendarTab = lazy(() => import("./routes/dashboard/calendar/CalendarTab").then((m) => ({ default: m.CalendarTab })));
const ProductionChecklistTab = lazy(() =>
  import("./routes/dashboard/checklist/ProductionChecklistTab").then((m) => ({ default: m.ProductionChecklistTab }))
);
const WeeklyRhythmTab = lazy(() => import("./routes/dashboard/weeklyRhythm/WeeklyRhythmTab").then((m) => ({ default: m.WeeklyRhythmTab })));
const TitleLabTab = lazy(() => import("./routes/dashboard/titleLab/TitleLabTab").then((m) => ({ default: m.TitleLabTab })));
const AuditTab = lazy(() => import("./routes/dashboard/audit/AuditTab").then((m) => ({ default: m.AuditTab })));
const TemplatesTab = lazy(() => import("./routes/dashboard/templates/TemplatesTab").then((m) => ({ default: m.TemplatesTab })));
const BuildRequestsTab = lazy(() => import("./routes/dashboard/buildRequests/BuildRequestsTab").then((m) => ({ default: m.BuildRequestsTab })));

const queryClient = new QueryClient();

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      { index: true, element: <PublicSite /> },
      { path: "build-requests", element: <BuildRequests /> },
      {
        path: "dashboard",
        element: <DashboardLayout />,
        children: [
          { index: true, element: <Navigate to="schedule" replace /> },
          { path: "schedule", element: <ScheduleTab /> },
          { path: "calendar", element: <CalendarTab /> },
          { path: "calendar/:entryId/checklist", element: <ProductionChecklistTab /> },
          { path: "checklists", element: <WeeklyRhythmTab /> },
          { path: "title-lab", element: <TitleLabTab /> },
          { path: "audit", element: <AuditTab /> },
          { path: "templates", element: <TemplatesTab /> },
          { path: "build-requests", element: <BuildRequestsTab /> }
        ]
      },
      { path: "reset-password", element: <ResetPassword /> },
      { path: "*", element: <NotFound /> }
    ]
  }
]);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  </StrictMode>
);
