export function getStatusColor(status) {
  if (status === "Resolved") return "text-green-500";
  if (status === "In Progress") return "text-yellow-500";
  if (status === "New") return "text-blue-500";
  return "text-gray-500";
}

export function getSeverityStyle(severity) {
  if (severity === "Critical") {
    return "bg-rose-100 text-rose-700 px-2 py-1 rounded-full text-xs font-semibold";
  }
  if (severity === "High") return "bg-red-100 text-red-600 px-2 py-1 rounded-full text-xs font-semibold";
  if (severity === "Medium") {
    return "bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full text-xs font-semibold";
  }
  return "bg-green-100 text-green-600 px-2 py-1 rounded-full text-xs font-semibold";
}

export function getPriorityStyle(priority) {
  if (priority === "Critical") {
    return "bg-rose-100 text-rose-700 px-2 py-1 rounded-full text-xs font-semibold";
  }

  if (priority === "Moderate") {
    return "bg-amber-100 text-amber-700 px-2 py-1 rounded-full text-xs font-semibold";
  }

  return "bg-sky-100 text-sky-700 px-2 py-1 rounded-full text-xs font-semibold";
}

export function getTagStyle() {
  return "bg-slate-100 text-slate-700 px-2 py-1 rounded-full text-xs font-medium dark:bg-slate-800 dark:text-slate-200";
}
