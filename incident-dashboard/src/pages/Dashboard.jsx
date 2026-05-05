import { useEffect, useMemo, useState } from "react";
import KPICard from "../components/KPI/KPICard";
import BarChartComponent from "../components/charts/BarChart";
import LineChartComponent from "../components/charts/LineChart";
import PieChartComponent from "../components/charts/PieChart";
import { REFRESH_INTERVAL_MS, fetchIncidents, fetchResponses } from "../services/apiClient";
import {
  getAverageResolutionTime,
  getAverageResponseTime,
  getGeoIncidentCounts,
  getKpiChange,
  getKpiTrendLabel,
  getTopIncidents,
  getTrendTone,
} from "../utils/dashboardData";
import { getSeverityStyle, getStatusColor } from "../utils/incidentStyles";

function Dashboard({ theme }) {
  const [incidents, setIncidents] = useState([]);
  const [responses, setResponses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadDashboard() {
      try {
        const [incidentData, responseData] = await Promise.all([
          fetchIncidents(),
          fetchResponses(),
        ]);

        if (isMounted) {
          setIncidents(incidentData);
          setResponses(responseData);
          setError("");
        }
      } catch (err) {
        console.error(err);
        if (isMounted) {
          setError("Failed to load dashboard");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadDashboard();
    const intervalId = window.setInterval(loadDashboard, REFRESH_INTERVAL_MS);

    return () => {
      isMounted = false;
      window.clearInterval(intervalId);
    };
  }, []);

  const topIncidents = useMemo(() => getTopIncidents(incidents), [incidents]);
  const geoCounts = useMemo(() => getGeoIncidentCounts(incidents), [incidents]);

  if (loading) {
    return <div className="p-6 text-slate-600 dark:text-slate-300">Loading dashboard...</div>;
  }

  if (error) {
    return <div className="p-6 text-rose-500">{error}</div>;
  }

  if (incidents.length === 0) {
    return <div className="p-6 text-slate-500 dark:text-slate-400">No incidents found</div>;
  }

  const resolvedCount = incidents.filter((incident) => incident.status === "Resolved").length;
  const newCount = incidents.filter((incident) => incident.status === "New").length;
  const averageResponseTime = getAverageResponseTime(responses);
  const averageResolutionTime = getAverageResolutionTime(incidents);
  const latestDate = incidents.reduce(
    (mostRecent, incident) =>
      new Date(incident.detected_at) > new Date(mostRecent) ? incident.detected_at : mostRecent,
    incidents[0]?.detected_at ?? ""
  );
  const latestDay = latestDate.slice(0, 10);
  const incidentsToday = incidents.filter(
    (incident) => incident.detected_at.slice(0, 10) === latestDay
  ).length;
  const previousCount = Math.max(incidents.length - incidentsToday, 1);

  const kpiCards = [
    {
      title: "Total Incidents",
      value: incidents.length,
      trendLabel: getKpiTrendLabel(incidentsToday),
      change: `${getKpiChange(incidents.length, previousCount)}%`,
      tone: getTrendTone(incidentsToday),
    },
    {
      title: "New Incidents",
      value: newCount,
      trendLabel: getKpiTrendLabel(newCount, "awaiting action"),
      change: `${getKpiChange(newCount, Math.max(resolvedCount, 1))}%`,
      tone: getTrendTone(-newCount),
    },
    {
      title: "Avg Response Time",
      value: `${averageResponseTime} min`,
      trendLabel: getKpiTrendLabel(-(averageResponseTime - 30), "vs SLA"),
      change: `${Math.abs(getKpiChange(averageResponseTime, 30))}%`,
      tone: averageResponseTime <= 30 ? "up" : "down",
    },
    {
      title: "Avg Resolution Time",
      value: `${averageResolutionTime} min`,
      trendLabel: getKpiTrendLabel(-(averageResolutionTime - 240), "vs target"),
      change: `${Math.abs(getKpiChange(averageResolutionTime, 240))}%`,
      tone: averageResolutionTime <= 240 ? "up" : "down",
    },
  ];

  return (
    <div className="space-y-6 p-6">
      <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        {kpiCards.map((card) => (
          <KPICard key={card.title} {...card} />
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow transition duration-200 hover:shadow-lg dark:border-slate-800 dark:bg-slate-900">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              Top Incidents
            </h2>
            <span className="text-sm text-slate-500 dark:text-slate-400">
              Ranked by severity and recency
            </span>
          </div>

          <div className="space-y-4">
            {topIncidents.map((incident) => (
              <div
                key={incident.incident_id}
                className="flex flex-col gap-3 rounded-xl border border-slate-200 p-4 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="font-semibold text-slate-900 dark:text-slate-100">
                    #{incident.incident_id} {incident.incident_type}
                  </p>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    Source: {incident.source_ip} | Detected:{" "}
                    {new Date(incident.detected_at).toLocaleString()}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <span className={getSeverityStyle(incident.severity)}>{incident.severity}</span>
                  <span className={`${getStatusColor(incident.status)} text-sm font-semibold`}>
                    {incident.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow transition duration-200 hover:shadow-lg dark:border-slate-800 dark:bg-slate-900">
          <h2 className="mb-4 text-lg font-semibold text-slate-900 dark:text-slate-100">
            Geo-IP Incident Distribution
          </h2>
          <div className="space-y-3">
            {geoCounts.map((item) => (
              <div key={item.country} className="rounded-lg bg-slate-50 p-4 dark:bg-slate-800/70">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-slate-800 dark:text-slate-100">
                    {item.country}
                  </span>
                  <span className="text-sm text-slate-500 dark:text-slate-400">
                    {item.count} incidents
                  </span>
                </div>
                <div className="mt-3 h-2 rounded-full bg-slate-200 dark:bg-slate-700">
                  <div
                    className="h-2 rounded-full bg-blue-600"
                    style={{ width: `${(item.count / incidents.length) * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr_1fr_1fr]">
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow transition duration-200 hover:shadow-lg dark:border-slate-800 dark:bg-slate-900 xl:col-span-2">
          <h2 className="mb-4 text-lg font-semibold text-slate-900 dark:text-slate-100">
            Incidents Over Time
          </h2>
          <div className="h-80">
            <LineChartComponent incidents={incidents} theme={theme} />
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow transition duration-200 hover:shadow-lg dark:border-slate-800 dark:bg-slate-900">
          <h2 className="mb-4 text-lg font-semibold text-slate-900 dark:text-slate-100">
            Incident Types
          </h2>
          <div className="h-80">
            <PieChartComponent incidents={incidents} theme={theme} />
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow transition duration-200 hover:shadow-lg dark:border-slate-800 dark:bg-slate-900">
        <h2 className="mb-4 text-lg font-semibold text-slate-900 dark:text-slate-100">
          Created vs Closed
        </h2>
        <div className="h-80">
          <BarChartComponent incidents={incidents} theme={theme} />
        </div>
      </section>
    </div>
  );
}

export default Dashboard;
