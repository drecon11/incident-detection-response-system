-- ===== CREATE TABLES =====
IF OBJECT_ID('audit_logs','U') IS NOT NULL DROP TABLE audit_logs;
IF OBJECT_ID('responses','U') IS NOT NULL DROP TABLE responses;
IF OBJECT_ID('incidents','U') IS NOT NULL DROP TABLE incidents;
IF OBJECT_ID('users','U') IS NOT NULL DROP TABLE users;

CREATE TABLE users (
    user_id INT IDENTITY(1,1) PRIMARY KEY,
    username NVARCHAR(50) UNIQUE NOT NULL,
    password_hash NVARCHAR(255) NOT NULL,
    role NVARCHAR(10) CHECK (role IN ('admin','analyst')) NOT NULL,
    created_at DATETIME DEFAULT GETDATE()
);

CREATE TABLE incidents (
    incident_id INT IDENTITY(1,1) PRIMARY KEY,
    incident_type NVARCHAR(100) NOT NULL,
    severity NVARCHAR(10) CHECK (severity IN ('low','medium','high','critical')) NOT NULL,
    description NVARCHAR(255),
    status NVARCHAR(20) CHECK (status IN ('detected','analyzing','contained','resolved')) NOT NULL DEFAULT 'detected',
    source_ip NVARCHAR(50),
    detected_at DATETIME DEFAULT GETDATE()
);

CREATE TABLE responses (
    response_id INT IDENTITY(1,1) PRIMARY KEY,
    incident_id INT NOT NULL,
    responder_id INT,
    action_taken NVARCHAR(255) NOT NULL,
    notes NVARCHAR(255),
    response_time DATETIME DEFAULT GETDATE(),
    CONSTRAINT FK_responses_incidents FOREIGN KEY (incident_id) REFERENCES incidents(incident_id),
    CONSTRAINT FK_responses_users FOREIGN KEY (responder_id) REFERENCES users(user_id)
);

CREATE TABLE audit_logs (
    log_id INT IDENTITY(1,1) PRIMARY KEY,
    user_id INT,
    action NVARCHAR(255) NOT NULL,
    entity NVARCHAR(50),
    entity_id INT,
    ip_address NVARCHAR(50),
    timestamp DATETIME DEFAULT GETDATE(),
    CONSTRAINT FK_audit_users FOREIGN KEY (user_id) REFERENCES users(user_id)
);

-- ===== INSERT DATA =====
INSERT INTO users (username, password_hash, role, created_at) VALUES
('admin_user','hash_admin','admin','2026-04-29 09:00:00'),
('analyst_jordan','hash_a1','analyst','2026-04-29 09:05:00'),
('analyst_morgan','hash_a2','analyst','2026-04-29 09:10:00'),
('soc_lead','hash_admin2','admin','2026-04-29 09:15:00');

INSERT INTO incidents (incident_type, severity, description, status, source_ip, detected_at) VALUES
('Failed Login Spike','high','Multiple failed login attempts','detected','192.168.1.50','2026-04-29 10:01:00'),
('Phishing Email Report','medium','User reported phishing email','analyzing','10.0.0.21','2026-04-29 10:18:00'),
('Malware Detection','critical','Malware on endpoint','contained','10.0.0.45','2026-04-29 10:42:00'),
('Suspicious DNS Query','high','Repeated query to bad domain','analyzing','172.16.4.12','2026-04-29 11:03:00'),
('Unauthorized Port Scan','medium','Host scanning ports','detected','192.168.1.77','2026-04-29 11:30:00'),
('Unusual Login Location','high','Login from new country','contained','203.0.113.19','2026-04-29 12:10:00'),
('Ransomware Alert','critical','Encryption behavior detected','resolved','10.0.0.88','2026-04-29 12:45:00'),
('Privilege Escalation Attempt','critical','Attempted admin access','analyzing','192.168.1.95','2026-04-29 13:15:00'),
('Firewall Rule Violation','low','Blocked by policy','resolved','198.51.100.23','2026-04-29 13:55:00'),
('Unknown Executable Download','medium','Unsigned exe downloaded','detected','10.0.0.66','2026-04-29 14:20:00');

INSERT INTO responses (incident_id, responder_id, action_taken, notes, response_time) VALUES
(1,2,'Locked account & blocked IP','Threshold exceeded','2026-04-29 10:08:00'),
(2,3,'Quarantined email','User notified','2026-04-29 10:25:00'),
(3,2,'Isolated workstation','Cleanup in progress','2026-04-29 10:50:00'),
(4,3,'Blocked domain','Added to blocklist','2026-04-29 11:15:00'),
(5,2,'Monitored host','Flagged for review','2026-04-29 11:45:00'),
(6,4,'Forced password reset','Secured account','2026-04-29 12:20:00'),
(7,4,'Restored from backup','Drive recovered','2026-04-29 13:05:00'),
(8,2,'Revoked privileges','Attempt blocked','2026-04-29 13:30:00'),
(9,3,'Logged event','No action needed','2026-04-29 14:00:00'),
(10,2,'Blocked hash','Added to deny list','2026-04-29 14:35:00');

INSERT INTO audit_logs (user_id, action, entity, entity_id, ip_address, timestamp) VALUES
(1,'Created database','system',NULL,'127.0.0.1','2026-04-29 09:30:00'),
(2,'Created incident','incidents',1,'192.168.1.10','2026-04-29 10:01:00'),
(3,'Updated incident','incidents',2,'192.168.1.11','2026-04-29 10:22:00'),
(2,'Added response','responses',1,'192.168.1.10','2026-04-29 10:08:00'),
(3,'Added response','responses',2,'192.168.1.11','2026-04-29 10:25:00'),
(4,'Reviewed critical','incidents',7,'192.168.1.20','2026-04-29 13:00:00'),
(2,'Blocked hash','responses',10,'192.168.1.10','2026-04-29 14:35:00'),
(1,'Generated report','audit_logs',NULL,'127.0.0.1','2026-04-29 15:00:00');