from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
import json
from pathlib import Path
import sqlite3
from urllib.parse import urlparse


ROOT_DIR = Path(__file__).resolve().parents[1]
DB_PATH = ROOT_DIR / "database" / "idrms.db"
HOST = "127.0.0.1"
PORT = 5000


def title_case(value):
    return " ".join(part.capitalize() for part in str(value or "").split("_"))


def normalize_status(value):
    status_map = {
        "detected": "New",
        "analyzing": "In Progress",
        "contained": "In Progress",
        "resolved": "Resolved",
    }
    return status_map.get(str(value or "").lower(), title_case(value))


def normalize_severity(value):
    return title_case(value)


def normalize_datetime(value):
    if not value:
        return None
    return str(value).replace(" ", "T")


def minutes_between(start, end):
    if not start or not end:
        return 0

    query = "SELECT CAST((julianday(?) - julianday(?)) * 24 * 60 AS INTEGER)"
    with sqlite3.connect(DB_PATH) as conn:
        result = conn.execute(query, (end, start)).fetchone()[0]
    return max(int(result or 0), 0)


def rows_for(query, params=()):
    with sqlite3.connect(DB_PATH) as conn:
        conn.row_factory = sqlite3.Row
        return [dict(row) for row in conn.execute(query, params).fetchall()]


def get_incidents():
    rows = rows_for(
        """
        SELECT incident_id, incident_type, severity, description, status, source_ip, detected_at
        FROM incidents
        ORDER BY datetime(detected_at) DESC, incident_id DESC
        """
    )

    return [
        {
            **row,
            "severity": normalize_severity(row["severity"]),
            "status": normalize_status(row["status"]),
            "detected_at": normalize_datetime(row["detected_at"]),
            "resolved_at": normalize_datetime(row["detected_at"])
            if str(row["status"]).lower() == "resolved"
            else None,
            "tags": [
                normalize_severity(row["severity"]),
                normalize_status(row["status"]),
                row["incident_type"],
            ],
        }
        for row in rows
    ]


def get_responses():
    rows = rows_for(
        """
        SELECT r.response_id,
               r.incident_id,
               r.responder_id,
               r.action_taken,
               r.notes,
               r.response_time,
               i.detected_at
        FROM responses r
        LEFT JOIN incidents i ON i.incident_id = r.incident_id
        ORDER BY datetime(r.response_time) DESC, r.response_id DESC
        """
    )

    return [
        {
            "response_id": row["response_id"],
            "incident_id": row["incident_id"],
            "responder_id": row["responder_id"],
            "action_taken": row["action_taken"],
            "notes": row["notes"],
            "responded_at": normalize_datetime(row["response_time"]),
            "response_time": minutes_between(row["detected_at"], row["response_time"]),
        }
        for row in rows
    ]


def get_activity_logs():
    return [
        {
            **row,
            "timestamp": normalize_datetime(row["timestamp"]),
        }
        for row in rows_for(
            """
            SELECT log_id, user_id, action, entity, entity_id, ip_address, timestamp
            FROM audit_logs
            ORDER BY datetime(timestamp) DESC, log_id DESC
            """
        )
    ]


class ApiHandler(BaseHTTPRequestHandler):
    def do_OPTIONS(self):
        self.send_response(204)
        self.send_common_headers()
        self.end_headers()

    def do_GET(self):
        routes = {
            "/api/health": lambda: {"ok": True, "database": str(DB_PATH)},
            "/api/incidents": get_incidents,
            "/api/responses": get_responses,
            "/api/activity": get_activity_logs,
        }

        path = urlparse(self.path).path
        handler = routes.get(path)

        if handler is None:
            self.write_json({"error": "Not found"}, status=404)
            return

        if not DB_PATH.exists():
            self.write_json({"error": f"Database not found at {DB_PATH}"}, status=500)
            return

        try:
            self.write_json(handler())
        except sqlite3.Error as error:
            self.write_json({"error": str(error)}, status=500)

    def send_common_headers(self):
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.send_header("Cache-Control", "no-store")

    def write_json(self, payload, status=200):
        body = json.dumps(payload).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(body)))
        self.send_common_headers()
        self.end_headers()
        self.wfile.write(body)

    def log_message(self, format, *args):
        return


if __name__ == "__main__":
    server = ThreadingHTTPServer((HOST, PORT), ApiHandler)
    print(f"API server running at http://{HOST}:{PORT}")
    print(f"Reading SQLite database from {DB_PATH}")
    server.serve_forever()
