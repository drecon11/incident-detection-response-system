import { useEffect, useState } from "react";
import { Download } from "lucide-react";
import { REFRESH_INTERVAL_MS, fetchIncidents, fetchResponses } from "../services/apiClient";
import { exportIncidentsReportCsv } from "../utils/exportCsv";
import { getPriorityLabel } from "../utils/dashboardData";
import { getSeverityStyle, getStatusColor } from "../utils/incidentStyles";

function Reports() {
  const [incidents, setIncidents] = useState([]);
  const [responses, setResponses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [openId, setOpenId] = useState(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadReports() {
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
          setError("Failed to load reports");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadReports();
    const intervalId = window.setInterval(loadReports, REFRESH_INTERVAL_MS);

    return () => {
      isMounted = false;
      window.clearInterval(intervalId);
    };
  }, []);

  if (loading) {
    return <div className="p-6 text-slate-600 dark:text-slate-300">Loading reports...</div>;
  }

  if (error) {
    return <div className="p-6 text-rose-500">{error}</div>;
  }

  if (incidents.length === 0) {
    return <div className="p-6 text-slate-500 dark:text-slate-400">No incidents found</div>;
  }

  const filteredIncidents = incidents.filter((incident) =>
    incident.incident_type.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Reports</h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Export incident records and inspect response actions.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <input
            type="text"
            placeholder="Search reports..."
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
          <button
            type="button"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
            onClick={() => exportIncidentsReportCsv(incidents, responses)}
          >
            <Download size={16} />
            Export CSV
          </button>
        </div>
      </div>

      {filteredIncidents.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-6 text-slate-500 shadow dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
          No incidents found
        </div>
      ) : (
        filteredIncidents.map((incident) => {
          const relatedResponses = responses.filter(
            (response) => response.incident_id === incident.incident_id
          );

          return (
            <div
              key={incident.incident_id}
              className="rounded-xl border border-slate-200 bg-white p-5 shadow transition duration-200 hover:shadow-lg dark:border-slate-800 dark:bg-slate-900"
            >
              <button
                type="button"
                className="flex w-full flex-col gap-3 text-left md:flex-row md:items-center md:justify-between"
                onClick={() =>
                  setOpenId((currentId) =>
                    currentId === incident.incident_id ? null : incident.incident_id
                  )
                }
              >
                <div>
                  <p className="font-semibold text-slate-900 dark:text-slate-100">
                    #{incident.incident_id} {incident.incident_type}
                  </p>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    {incident.source_ip} | Detected {incident.detected_at}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                    {getPriorityLabel(incident)}
                  </span>
                  <span className={getSeverityStyle(incident.severity)}>{incident.severity}</span>
                  <span className={`${getStatusColor(incident.status)} text-sm font-semibold`}>
                    {incident.status}
                  </span>
                </div>
              </button>

              {openId === incident.incident_id && (
                <div className="mt-4 space-y-4 border-t border-slate-200 pt-4 text-sm text-slate-600 dark:border-slate-800 dark:text-slate-300">
                  <div className="grid gap-4 md:grid-cols-2">
                    <p>
                      <strong className="text-slate-800 dark:text-slate-100">Description:</strong>{" "}
                      {incident.description ?? "No description provided"}
                    </p>
                    <p>
                      <strong className="text-slate-800 dark:text-slate-100">Source IP:</strong>{" "}
                      {incident.source_ip}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {incident.tags?.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-200"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  {relatedResponses.length > 0 ? (
                    relatedResponses.map((response) => (
                      <div
                        key={response.response_id}
                        className="rounded-lg bg-slate-50 p-4 dark:bg-slate-800/70"
                      >
                        <p>
                          <strong className="text-slate-800 dark:text-slate-100">Action:</strong>{" "}
                          {response.action_taken}
                        </p>
                        <p className="mt-2">
                          <strong className="text-slate-800 dark:text-slate-100">Notes:</strong>{" "}
                          {response.notes}
                        </p>
                        <p className="mt-2">
                          <strong className="text-slate-800 dark:text-slate-100">
                            Response Time:
                          </strong>{" "}
                          {response.response_time} min
                        </p>
                      </div>
                    ))
                  ) : (
                    <p>No response recorded</p>
                  )}
                </div>
              )}
            </div>
          );
        })
      )}
    </div>
  );
}

export default Reports;
