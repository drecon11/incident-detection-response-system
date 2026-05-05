import { useEffect, useState } from "react";
import { REFRESH_INTERVAL_MS, fetchActivityLogs } from "../services/apiClient";

function Activity() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadActivity() {
      try {
        const data = await fetchActivityLogs();

        if (isMounted) {
          setLogs(data);
          setError("");
        }
      } catch (err) {
        console.error(err);
        if (isMounted) {
          setError("Failed to load activity log");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadActivity();
    const intervalId = window.setInterval(loadActivity, REFRESH_INTERVAL_MS);

    return () => {
      isMounted = false;
      window.clearInterval(intervalId);
    };
  }, []);

  if (loading) {
    return <div className="p-6 text-slate-600 dark:text-slate-300">Loading activity log...</div>;
  }

  if (error) {
    return <div className="p-6 text-rose-500">{error}</div>;
  }

  return (
    <div className="space-y-6 p-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Activity Log</h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Audit trail of dashboard actions and incident updates.
        </p>
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow dark:border-slate-800 dark:bg-slate-900">
        <table className="min-w-full text-left">
          <thead className="bg-slate-50 dark:bg-slate-800/70">
            <tr className="text-sm text-slate-500 dark:text-slate-400">
              <th className="px-4 py-3">User ID</th>
              <th className="px-4 py-3">Action</th>
              <th className="px-4 py-3">Entity</th>
              <th className="px-4 py-3">Timestamp</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr
                key={log.log_id}
                className="border-t border-slate-200 text-sm text-slate-700 dark:border-slate-800 dark:text-slate-200"
              >
                <td className="px-4 py-4 font-medium">{log.user_id}</td>
                <td className="px-4 py-4">{log.action}</td>
                <td className="px-4 py-4">{log.entity}</td>
                <td className="px-4 py-4">{new Date(log.timestamp).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Activity;
