PRAGMA foreign_keys = ON;

CREATE TABLE users (
    user_id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT CHECK(role IN ('admin', 'analyst')) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE incidents (
    incident_id INTEGER PRIMARY KEY AUTOINCREMENT,
    incident_type TEXT NOT NULL,
    severity TEXT CHECK(severity IN ('low', 'medium', 'high', 'critical')) NOT NULL,
    description TEXT,
    status TEXT CHECK(status IN ('detected', 'analyzing', 'contained', 'resolved')) NOT NULL DEFAULT 'detected',
    source_ip TEXT,
    detected_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE responses (
    response_id INTEGER PRIMARY KEY AUTOINCREMENT,
    incident_id INTEGER NOT NULL,
    responder_id INTEGER,
    action_taken TEXT NOT NULL,
    notes TEXT,
    response_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (incident_id) REFERENCES incidents(incident_id),
    FOREIGN KEY (responder_id) REFERENCES users(user_id)
);

CREATE TABLE audit_logs (
    log_id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    action TEXT NOT NULL,
    entity TEXT,
    entity_id INTEGER,
    ip_address TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);