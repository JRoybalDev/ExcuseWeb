import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createBrowserRouter, Navigate, RouterProvider } from "react-router-dom";
import { App } from "./routes/App";
import { AuditTab } from "./routes/dashboard/audit/AuditTab";
import { CalendarTab } from "./routes/dashboard/calendar/CalendarTab";
import { ProductionChecklistTab } from "./routes/dashboard/checklist/ProductionChecklistTab";
import { DashboardLayout } from "./routes/dashboard/DashboardLayout";
import { ScheduleTab } from "./routes/dashboard/ScheduleTab";
import { TemplatesTab } from "./routes/dashboard/templates/TemplatesTab";
import { TitleLabTab } from "./routes/dashboard/titleLab/TitleLabTab";
import { WeeklyRhythmTab } from "./routes/dashboard/weeklyRhythm/WeeklyRhythmTab";
import { NotFound } from "./routes/NotFound";
import { PublicSite } from "./routes/PublicSite";
import { ResetPassword } from "./routes/ResetPassword";
import "./styles/design-tokens.css";
import "./styles/branding.css";
import "./styles/index.css";
import "./styles/public.css";
import "./styles/dashboard.css";

const queryClient = new QueryClient();

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      { index: true, element: <PublicSite /> },
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
          { path: "templates", element: <TemplatesTab /> }
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
