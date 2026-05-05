import { useState } from "react";
import { ShieldAlert } from "lucide-react";

function Login({ onLogin }) {
  const [role, setRole] = useState("Analyst");

  return (
    <div className="flex min-h-screen items-center justify-center bg-white px-4 dark:bg-slate-950">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-xl dark:border-slate-800 dark:bg-slate-900">
        <div className="mb-6 flex items-center gap-3">
          <div className="rounded-xl bg-blue-500/10 p-3 text-blue-600 dark:bg-blue-500/15 dark:text-blue-300">
            <ShieldAlert size={22} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Incident Guard</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Security operations command center
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
              Access Role
            </label>
            <select
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
              value={role}
              onChange={(event) => setRole(event.target.value)}
            >
              <option value="Admin">Admin</option>
              <option value="Analyst">Analyst</option>
            </select>
          </div>

          <div className="rounded-xl bg-slate-50 p-4 text-sm text-slate-600 dark:bg-slate-800/70 dark:text-slate-300">
            Authorized monitoring workspace for incident analysis, response review, and audit visibility.
          </div>

          <button
            type="button"
            className="w-full rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
            onClick={() => onLogin(role)}
          >
            Sign In
          </button>
        </div>
      </div>
    </div>
  );
}

export default Login;
