import { useQuery, useQueryClient } from "@tanstack/react-query";
import { type FormEvent, Suspense, useEffect, useState } from "react";
import { FiExternalLink, FiLock, FiLogOut } from "react-icons/fi";
import { Link, Outlet } from "react-router-dom";
import { apiClient } from "../../shared/apiClient";
import { LoadingScreen } from "../../shared/Loading";
import { setDocumentTitle, siteConfig } from "../../shared/siteConfig";
import { useDraftStore } from "../../state/draftStore";
import { useThemeMode } from "../../state/themeStore";
import { DashboardNav } from "./DashboardNav";

export function DashboardLayout() {
  const { resolvedTheme } = useThemeMode();
  const queryClient = useQueryClient();
  const adminKey = useDraftStore((state) => state.adminKey);
  const setAdminKey = useDraftStore((state) => state.setAdminKey);
  const clearAdminKey = useDraftStore((state) => state.clearAdminKey);
  const hasAdminKey = adminKey.length > 0;

  useEffect(() => {
    setDocumentTitle(siteConfig.dashboardPageName);
  }, []);

  const session = useQuery({
    queryKey: ["admin-session", adminKey],
    queryFn: () => apiClient.admin.verifySession(adminKey),
    enabled: hasAdminKey,
    retry: false
  });

  async function lockDashboard() {
    clearAdminKey();
    void queryClient.invalidateQueries({ queryKey: ["admin-session"] });
  }

  if (!session.isSuccess) {
    return <DashboardAccessGate isChecking={session.isLoading} isInvalid={session.isError} onUnlock={(code) => setAdminKey(code)} />;
  }

  return (
    <div className={`admin-dashboard dashboard-theme-${resolvedTheme}`}>
      <header className="admin-header">
        <div className="admin-header__brand">
          <span className="admin-header__mark">EJ</span>
          <span className="admin-header__name">Operations Center</span>
          <span className="admin-tag">admin</span>
        </div>
        <div className="admin-header__actions">
          <Link className="admin-header__link" to="/" target="_blank" rel="noreferrer">
            View live site <FiExternalLink aria-hidden />
          </Link>
          <span className="admin-status-pill">
            <span className="admin-status-pill__dot" />
            Published — changes go live instantly
          </span>
          <button className="admin-button admin-button--secondary" type="button" onClick={() => void lockDashboard()}>
            <FiLogOut aria-hidden /> Sign out
          </button>
        </div>
      </header>

      <div className="admin-shell-body">
        <DashboardNav />

        <main className="admin-main">
          <div className="admin-main__inner">
            <Suspense fallback={<LoadingScreen />}>
              <Outlet />
            </Suspense>
          </div>
        </main>
      </div>
    </div>
  );
}

function DashboardAccessGate({
  isChecking,
  isInvalid,
  onUnlock
}: {
  isChecking: boolean;
  isInvalid: boolean;
  onUnlock: (code: string) => void;
}) {
  const [code, setCode] = useState("");

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onUnlock(code.trim());
  }

  return (
    <div className="admin-gate">
      <div className="admin-gate-bg" style={{ backgroundImage: "url(/background.jpg)" }} />
      <div className="admin-gate-scrim" />
      <form className="admin-gate__panel" onSubmit={submit}>
        <img className="admin-gate__logo" src="/logo.png" alt="ExcuseMeImJack" />
        <div className="admin-gate__copy">
          <h1>Operations Center</h1>
          <p>Keys to the park, please.</p>
        </div>
        <label className="admin-gate__field">
          <span>Password</span>
          <input type="password" placeholder="••••••••" value={code} onChange={(event) => setCode(event.target.value)} autoFocus />
        </label>
        <button className="admin-button admin-button--primary admin-gate__submit" type="submit" disabled={isChecking || code.length === 0}>
          <FiLock aria-hidden /> {isChecking ? "Checking..." : "Open the gates"}
        </button>
        {isInvalid ? <p className="admin-error">Incorrect password.</p> : null}
      </form>
    </div>
  );
}
