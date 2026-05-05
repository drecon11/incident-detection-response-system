import { useEffect, useMemo, useState } from "react";
import { Navigate, NavLink, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import {
  AlertTriangle,
  BarChart2,
  FileClock,
  FileText,
  LayoutDashboard,
  LogOut,
  Settings as SettingsIcon,
  ShieldAlert,
} from "lucide-react";

import Analytics from "./pages/Analytics";
import Activity from "./pages/Activity";
import Dashboard from "./pages/Dashboard";
import Incidents from "./pages/Incidents";
import Login from "./pages/Login";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import { REFRESH_INTERVAL_MS, fetchIncidents } from "./services/apiClient";
import { STORAGE_KEYS, readBooleanSetting } from "./utils/appStorage";

function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const [time, setTime] = useState(new Date());
  const [theme, setTheme] = useState(() => localStorage.getItem(STORAGE_KEYS.theme) ?? "dark");
  const [auth, setAuth] = useState(() => {
    const stored = localStorage.getItem(STORAGE_KEYS.auth);
    return stored ? JSON.parse(stored) : null;
  });
  const [notificationsEnabled, setNotificationsEnabled] = useState(() =>
    readBooleanSetting(STORAGE_KEYS.notifications, true)
  );
  const [notification, setNotification] = useState(null);

  const role = auth?.role ?? "Analyst";
  const isAuthenticated = Boolean(auth);
  const canViewAdminPages = role === "Admin";

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(new Date());
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    document.documentElement.classList.remove("light", "dark");
    document.documentElement.classList.add(theme);
    document.documentElement.style.colorScheme = theme;
    document.body.classList.toggle("dark", theme === "dark");
    localStorage.setItem(STORAGE_KEYS.theme, theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.notifications, String(notificationsEnabled));
  }, [notificationsEnabled]);

  useEffect(() => {
    if (auth) {
      localStorage.setItem(STORAGE_KEYS.auth, JSON.stringify(auth));
      localStorage.setItem(STORAGE_KEYS.role, auth.role);
    } else {
      localStorage.removeItem(STORAGE_KEYS.auth);
    }
  }, [auth]);

  useEffect(() => {
    if (!isAuthenticated || !notificationsEnabled) {
      return;
    }

    let isMounted = true;
    let timeoutId;

    async function loadNotification() {
      try {
        const incidents = await fetchIncidents();
        const highSeverityIncident = [...incidents]
          .filter((incident) => incident.severity === "High")
          .sort((a, b) => new Date(b.detected_at) - new Date(a.detected_at))[0];

        if (!isMounted || !highSeverityIncident) {
          return;
        }

        const lastSeenId = localStorage.getItem("incident-dashboard-last-alert-id");

        if (String(highSeverityIncident.incident_id) !== lastSeenId) {
          setNotification(
            `High severity incident detected: ${highSeverityIncident.incident_type} from ${highSeverityIncident.source_ip}`
          );
          localStorage.setItem(
            "incident-dashboard-last-alert-id",
            String(highSeverityIncident.incident_id)
          );

          timeoutId = window.setTimeout(() => {
            setNotification(null);
          }, 5000);
        }
      } catch (err) {
        console.error(err);
      }
    }

    loadNotification();
    const intervalId = window.setInterval(loadNotification, REFRESH_INTERVAL_MS);

    return () => {
      isMounted = false;
      window.clearInterval(intervalId);
      window.clearTimeout(timeoutId);
    };
  }, [isAuthenticated, notificationsEnabled]);

  const navItems = useMemo(
    () =>
      [
        { to: "/", label: "Dashboard", icon: LayoutDashboard, allow: true },
        { to: "/incidents", label: "Incidents", icon: AlertTriangle, allow: true },
        { to: "/analytics", label: "Analytics", icon: BarChart2, allow: true },
        { to: "/reports", label: "Reports", icon: FileText, allow: canViewAdminPages },
        { to: "/activity", label: "Activity", icon: FileClock, allow: canViewAdminPages },
        { to: "/settings", label: "Settings", icon: SettingsIcon, allow: true },
      ].filter((item) => item.allow),
    [canViewAdminPages]
  );

  const linkStyle = ({ isActive }) =>
    isActive
      ? "flex items-center rounded-lg bg-blue-500/10 px-3 py-2 font-semibold text-blue-600 dark:bg-blue-500/15 dark:text-blue-400"
      : "flex items-center rounded-lg px-3 py-2 text-slate-600 transition-colors duration-200 hover:bg-slate-100 hover:text-blue-600 dark:text-slate-300 dark:hover:bg-white/5 dark:hover:text-blue-300";

  const handleLogin = (selectedRole) => {
    const session = {
      user_id: selectedRole === "Admin" ? "admin-01" : "analyst-02",
      role: selectedRole,
    };

    setAuth(session);
    navigate("/", { replace: true });
  };

  const handleLogout = () => {
    setAuth(null);
    navigate("/login", { replace: true });
  };

  if (!isAuthenticated) {
    return (
      <Routes>
        <Route path="/login" element={<Login onLogin={handleLogin} />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  const isLoginRoute = location.pathname === "/login";

  if (isLoginRoute) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="flex min-h-screen bg-white dark:bg-slate-950">
      <aside className="hidden w-72 shrink-0 border-r border-slate-200 bg-white p-6 text-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:text-white lg:block">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-blue-500/10 p-3 text-blue-600 dark:bg-blue-500/15 dark:text-blue-300">
            <ShieldAlert size={22} />
          </div>
          <div>
            <h2 className="text-xl font-bold">Incident Guard</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">Security operations center</p>
          </div>
        </div>

        <nav className="mt-10 space-y-3">
          {navItems.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink key={item.to} to={item.to} className={linkStyle}>
                <Icon size={18} className="mr-3" />
                {item.label}
              </NavLink>
            );
          })}
        </nav>
      </aside>

      <main className="flex-1">
        <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <header className="mb-6 rounded-2xl border border-slate-200 bg-white/95 p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/95">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
                  Cyber Security Dashboard
                </h1>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  Signed in as {auth.user_id} ({role}) | Last updated: {time.toLocaleTimeString()}
                </p>
              </div>

              <button
                type="button"
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:hover:bg-slate-800"
                onClick={handleLogout}
              >
                <LogOut size={16} />
                Log Out
              </button>
            </div>

            <div className="mt-5 flex gap-2 overflow-x-auto lg:hidden">
              {navItems.map((item) => {
                const Icon = item.icon;

                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className={({ isActive }) =>
                      isActive
                        ? "inline-flex items-center gap-2 rounded-lg bg-blue-500 px-4 py-2 text-sm font-semibold text-white"
                        : "inline-flex items-center gap-2 rounded-lg bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-200"
                    }
                  >
                    <Icon size={16} />
                    {item.label}
                  </NavLink>
                );
              })}
            </div>
          </header>

          {notificationsEnabled && notification && (
            <div className="mb-6 flex items-center gap-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-rose-700 shadow-sm dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-200">
              <AlertTriangle size={18} className="shrink-0" />
              <p className="text-sm font-medium">{notification}</p>
            </div>
          )}

          <Routes>
            <Route path="/" element={<Dashboard theme={theme} />} />
            <Route path="/incidents" element={<Incidents />} />
            <Route path="/analytics" element={<Analytics theme={theme} />} />
            <Route
              path="/reports"
              element={canViewAdminPages ? <Reports /> : <Navigate to="/" replace />}
            />
            <Route
              path="/activity"
              element={canViewAdminPages ? <Activity /> : <Navigate to="/" replace />}
            />
            <Route
              path="/settings"
              element={
                <Settings
                  theme={theme}
                  notificationsEnabled={notificationsEnabled}
                  onThemeChange={setTheme}
                  onNotificationsChange={setNotificationsEnabled}
                />
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </main>
    </div>
  );
}

export default App;
