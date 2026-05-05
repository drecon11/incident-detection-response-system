INSERT INTO users (username, password_hash, role)
VALUES ('admin_user', 'hashed_password', 'admin');

INSERT INTO incidents (incident_type, severity, description, source_ip)
VALUES 
('Phishing Attack', 'high', 'Suspicious email detected', '192.168.1.10'),
('Malware Detection', 'critical', 'Malware found on endpoint', '10.0.0.5');

INSERT INTO responses (incident_id, responder_id, action_taken, notes)
VALUES 
(1, 1, 'Blocked IP', 'Firewall rule applied'),
(2, 1, 'Isolated system', 'Endpoint quarantined');

INSERT INTO audit_logs (user_id, action, entity, entity_id, ip_address)
VALUES 
(1, 'Created Incident', 'incidents', 1, '192.168.1.10'),
(1, 'Responded to Incident', 'responses', 2, '10.0.0.5');