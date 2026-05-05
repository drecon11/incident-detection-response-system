import { useEffect, useMemo, useState } from "react";
import BarChartComponent from "../components/charts/BarChart";
import LineChartComponent from "../components/charts/LineChart";
import PieChartComponent from "../components/charts/PieChart";
import { REFRESH_INTERVAL_MS, fetchIncidents } from "../services/apiClient";
import { getGeoIncidentCounts, getHeatmapCells } from "../utils/dashboardData";

function Analytics({ theme }) {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadAnalytics() {
      try {
        const incidentData = await fetchIncidents();

        if (isMounted) {
          setIncidents(incidentData);
          setError("");
        }
      } catch (err) {
        console.error(err);
        if (isMounted) {
          setError("Failed to load analytics");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadAnalytics();
    const intervalId = window.setInterval(loadAnalytics, REFRESH_INTERVAL_MS);

    return () => {
      isMounted = false;
      window.clearInterval(intervalId);
    };
  }, []);

  const geoCounts = useMemo(() => getGeoIncidentCounts(incidents), [incidents]);
  const heatmapCells = useMemo(() => getHeatmapCells(incidents), [incidents]);
  const maxHeat = Math.max(...heatmapCells.map((cell) => cell.value), 1);

  if (loading) {
    return <div className="p-6 text-slate-600 dark:text-slate-300">Loading analytics...</div>;
  }

  if (error) {
    return <div className="p-6 text-rose-500">{error}</div>;
  }

  if (incidents.length === 0) {
    return <div className="p-6 text-slate-500 dark:text-slate-400">No incidents found</div>;
  }

  return (
    <div className="space-y-6 p-6">
      <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Analytics</h2>

      <div className="grid gap-6 xl:grid-cols-2">
        <div className="h-80 rounded-xl border border-slate-200 bg-white p-6 shadow transition duration-200 hover:shadow-lg dark:border-slate-800 dark:bg-slate-900">
          <LineChartComponent incidents={incidents} theme={theme} />
        </div>

        <div className="h-80 rounded-xl border border-slate-200 bg-white p-6 shadow transition duration-200 hover:shadow-lg dark:border-slate-800 dark:bg-slate-900">
          <PieChartComponent incidents={incidents} theme={theme} />
        </div>

        <div className="h-80 rounded-xl border border-slate-200 bg-white p-6 shadow transition duration-200 hover:shadow-lg dark:border-slate-800 dark:bg-slate-900">
          <BarChartComponent incidents={incidents} theme={theme} />
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow transition duration-200 hover:shadow-lg dark:border-slate-800 dark:bg-slate-900">
          <h3 className="mb-4 text-lg font-semibold text-slate-900 dark:text-slate-100">
            Geo-IP Locations
          </h3>
          <div className="space-y-3">
            {geoCounts.map((item) => (
              <div key={item.country} className="flex items-center justify-between rounded-lg bg-slate-50 px-4 py-3 dark:bg-slate-800/70">
                <span className="font-medium text-slate-800 dark:text-slate-100">{item.country}</span>
                <span className="text-sm text-slate-500 dark:text-slate-400">{item.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow transition duration-200 hover:shadow-lg dark:border-slate-800 dark:bg-slate-900">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            Incident Heatmap
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Incident density grouped by day and hour bucket.
          </p>
        </div>

        <div className="grid grid-cols-6 gap-3 sm:grid-cols-6">
          {heatmapCells.map((cell) => {
            const intensity = cell.value / maxHeat;
            const background =
              cell.value === 0
                ? "bg-slate-100 dark:bg-slate-800"
                : intensity > 0.75
                  ? "bg-rose-500 text-white"
                  : intensity > 0.45
                    ? "bg-orange-400 text-white"
                    : "bg-amber-200 text-amber-900";

            return (
              <div key={`${cell.day}-${cell.hour}`} className={`rounded-lg p-3 text-center ${background}`}>
                <div className="text-xs font-semibold">{cell.day}</div>
                <div className="mt-1 text-sm">{cell.hour}:00</div>
                <div className="mt-2 text-lg font-bold">{cell.value}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default Analytics;
