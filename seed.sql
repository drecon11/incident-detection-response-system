INSERT INTO users (username, password_hash, role)
VALUES 
('admin_user', 'hash1', 'admin'),
('analyst_jordan', 'hash2', 'analyst'),
('analyst_morgan', 'hash3', 'analyst');

INSERT INTO incidents (incident_type, severity, description, status, source_ip)
VALUES
('Phishing Attack', 'high', 'Suspicious email detected', 'detected', '192.168.1.10'),
('Malware Detection', 'critical', 'Malware found on endpoint', 'contained', '10.0.0.5');

INSERT INTO responses (incident_id, responder_id, action_taken, notes)
VALUES
(1, 1, 'Blocked IP', 'Prevent further attempts'),
(2, 1, 'Isolated device', 'Malware contained');

INSERT INTO audit_logs (user_id, action, entity, entity_id, ip_address)
VALUES
(1, 'Created incident', 'incidents', 1, '127.0.0.1'),
(1, 'Responded to incident', 'responses', 2, '127.0.0.1');