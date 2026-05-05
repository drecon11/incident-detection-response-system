const severityWeight = {
  Critical: 4,
  High: 3,
  Medium: 2,
  Low: 1,
};

const ipCountryMap = {
  "203.0.113.10": "United States",
  "198.51.100.25": "Canada",
  "145.14.144.12": "Germany",
  "91.198.174.192": "Netherlands",
  "52.95.110.1": "United States",
  "172.16.10.24": "Internal Network",
  "34.117.59.81": "United States",
  "185.199.108.153": "United Kingdom",
};

export function getPriorityLabel(incident) {
  if (incident.severity === "Critical" || (incident.severity === "High" && incident.status === "New")) {
    return "Critical";
  }

  if (incident.severity === "Medium") {
    return "Moderate";
  }

  return "Low";
}

export function getIncidentTypeOptions(incidents) {
  return [...new Set(incidents.map((incident) => incident.incident_type))].sort();
}

export function getTopIncidents(incidents, limit = 5) {
  return [...incidents]
    .sort((a, b) => {
      const severityDelta = (severityWeight[b.severity] ?? 0) - (severityWeight[a.severity] ?? 0);

      if (severityDelta !== 0) {
        return severityDelta;
      }

      return new Date(b.detected_at) - new Date(a.detected_at);
    })
    .slice(0, limit);
}

export function getAverageResponseTime(responses) {
  if (!responses.length) {
    return 0;
  }

  return Math.round(
    responses.reduce((total, response) => total + response.response_time, 0) / responses.length
  );
}

export function getAverageResolutionTime(incidents) {
  const resolved = incidents.filter((incident) => incident.resolved_at);

  if (!resolved.length) {
    return 0;
  }

  const averageMinutes =
    resolved.reduce((total, incident) => {
      const detected = new Date(incident.detected_at).getTime();
      const resolvedAt = new Date(incident.resolved_at).getTime();
      return total + Math.round((resolvedAt - detected) / 60000);
    }, 0) / resolved.length;

  return Math.round(averageMinutes);
}

export function getGeoIncidentCounts(incidents) {
  const counts = {};

  incidents.forEach((incident) => {
    const country = ipCountryMap[incident.source_ip] ?? "Unknown";
    counts[country] = (counts[country] ?? 0) + 1;
  });

  return Object.entries(counts)
    .map(([country, count]) => ({ country, count }))
    .sort((a, b) => b.count - a.count);
}

export function getHeatmapCells(incidents) {
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const hours = ["00", "04", "08", "12", "16", "20"];
  const counts = {};

  incidents.forEach((incident) => {
    const date = new Date(incident.detected_at);
    const day = days[date.getUTCDay()];
    const hourBucket = hours.reduce((current, hour) => {
      return date.getUTCHours() >= Number(hour) ? hour : current;
    }, "00");
    const key = `${day}-${hourBucket}`;
    counts[key] = (counts[key] ?? 0) + 1;
  });

  return days.flatMap((day) =>
    hours.map((hour) => ({
      day,
      hour,
      value: counts[`${day}-${hour}`] ?? 0,
    }))
  );
}

export function getKpiTrendLabel(value, suffix = "today") {
  return value >= 0 ? `+${value} ${suffix}` : `${value} ${suffix}`;
}

export function getKpiChange(current, previous) {
  if (previous <= 0) {
    return current > 0 ? 100 : 0;
  }

  return Math.round(((current - previous) / previous) * 100);
}

export function getTrendTone(value) {
  if (value > 0) {
    return "up";
  }

  if (value < 0) {
    return "down";
  }

  return "flat";
}
