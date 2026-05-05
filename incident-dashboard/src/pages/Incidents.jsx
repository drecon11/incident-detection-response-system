import { useEffect, useMemo, useState } from "react";
import { REFRESH_INTERVAL_MS, fetchIncidents } from "../services/apiClient";
import { getIncidentTypeOptions, getPriorityLabel } from "../utils/dashboardData";
import {
  getPriorityStyle,
  getSeverityStyle,
  getStatusColor,
  getTagStyle,
} from "../utils/incidentStyles";

function Incidents() {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [severityFilter, setSeverityFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState("All");

  useEffect(() => {
    let isMounted = true;

    async function loadIncidents() {
      try {
        const incidentData = await fetchIncidents();

        if (isMounted) {
          setIncidents(incidentData);
          setError("");
        }
      } catch (err) {
        console.error(err);
        if (isMounted) {
          setError("Failed to load incidents");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadIncidents();
    const intervalId = window.setInterval(loadIncidents, REFRESH_INTERVAL_MS);

    return () => {
      isMounted = false;
      window.clearInterval(intervalId);
    };
  }, []);

  const incidentTypes = useMemo(() => getIncidentTypeOptions(incidents), [incidents]);

  if (loading) {
    return <div className="p-6 text-slate-600 dark:text-slate-300">Loading incidents...</div>;
  }

  if (error) {
    return <div className="p-6 text-rose-500">{error}</div>;
  }

  if (incidents.length === 0) {
    return <div className="p-6 text-slate-500 dark:text-slate-400">No incidents found</div>;
  }

  const filtered = incidents.filter((incident) => {
    const searchTarget = `${incident.incident_type} ${incident.description ?? ""} ${incident.source_ip}`
      .toLowerCase();

    return (
      searchTarget.includes(search.toLowerCase()) &&
      (statusFilter === "All" || incident.status === statusFilter) &&
      (severityFilter === "All" || incident.severity === severityFilter) &&
      (typeFilter === "All" || incident.incident_type === typeFilter)
    );
  });

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Incidents</h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Search and combine filters across severity, status, and incident type.
          </p>
        </div>

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <input
            type="text"
            placeholder="Search incidents..."
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
          <select
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
            value={severityFilter}
            onChange={(event) => setSeverityFilter(event.target.value)}
          >
            <option value="All">All Severities</option>
            <option value="Critical">Critical</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
          <select
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
          >
            <option value="All">All Statuses</option>
            <option value="New">New</option>
            <option value="In Progress">In Progress</option>
            <option value="Resolved">Resolved</option>
          </select>
          <select
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
            value={typeFilter}
            onChange={(event) => setTypeFilter(event.target.value)}
          >
            <option value="All">All Incident Types</option>
            {incidentTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-6 text-slate-500 shadow dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
          No incidents found
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow transition duration-200 hover:shadow-lg dark:border-slate-800 dark:bg-slate-900">
          <table className="min-w-full text-left">
            <thead className="bg-slate-50 dark:bg-slate-800/70">
              <tr className="text-sm text-slate-500 dark:text-slate-400">
                <th className="px-4 py-3">ID</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Priority</th>
                <th className="px-4 py-3">Severity</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Tags</th>
                <th className="px-4 py-3">Source IP</th>
                <th className="px-4 py-3">Detected</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((incident) => {
                const priority = getPriorityLabel(incident);

                return (
                  <tr
                    key={incident.incident_id}
                    className="border-t border-slate-200 text-sm text-slate-700 dark:border-slate-800 dark:text-slate-200"
                  >
                    <td className="px-4 py-4 font-medium">#{incident.incident_id}</td>
                    <td className="px-4 py-4">
                      <div className="font-medium">{incident.incident_type}</div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">
                        {incident.description}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className={getPriorityStyle(priority)}>{priority}</span>
                    </td>
                    <td className="px-4 py-4">
                      <span className={getSeverityStyle(incident.severity)}>{incident.severity}</span>
                    </td>
                    <td className={`px-4 py-4 font-semibold ${getStatusColor(incident.status)}`}>
                      {incident.status}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex flex-wrap gap-2">
                        {incident.tags.map((tag) => (
                          <span key={tag} className={getTagStyle()}>
                            {tag}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-4">{incident.source_ip}</td>
                    <td className="px-4 py-4">
                      {new Date(incident.detected_at).toLocaleString()}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default Incidents;
