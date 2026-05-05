import { LineChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

function getIncidentDay(value) {
  if (!value) {
    return "Unknown";
  }

  return value.slice(0, 10);
}

function formatDayLabel(value) {
  if (!value || value === "Unknown") {
    return value;
  }

  return new Date(`${value}T00:00:00`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

function LineChartComponent({ incidents = [], theme = "light" }) {
  const axisColor = theme === "dark" ? "#94a3b8" : "#64748b";
  const tooltipStyle =
    theme === "dark"
      ? { backgroundColor: "#0f172a", border: "1px solid #334155", color: "#f8fafc" }
      : { backgroundColor: "#ffffff", border: "1px solid #e2e8f0", color: "#0f172a" };

  const grouped = {};

  incidents.forEach((incident) => {
    const date = getIncidentDay(incident.detected_at);

    if (!grouped[date]) {
      grouped[date] = 0;
    }

    grouped[date]++;
  });

  const data = Object.keys(grouped)
    .sort((left, right) => new Date(left) - new Date(right))
    .map((date) => ({
      date,
      label: formatDayLabel(date),
      count: grouped[date],
    }));

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data}>
        <XAxis dataKey="label" tick={{ fill: axisColor, fontSize: 12 }} />
        <YAxis tick={{ fill: axisColor, fontSize: 12 }} />
        <Tooltip
          contentStyle={tooltipStyle}
          labelFormatter={(value, payload) => payload?.[0]?.payload?.date ?? value}
        />
        <Line type="monotone" dataKey="count" stroke="#3b82f6" />
      </LineChart>
    </ResponsiveContainer>
  );
}

export default LineChartComponent;
