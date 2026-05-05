-- 1. Get all incidents with severity high or critical
SELECT * FROM incidents
WHERE severity IN ('high', 'critical');

-- 2. Join incidents with responses
SELECT i.incident_type, i.severity, r.action_taken
FROM incidents i
JOIN responses r ON i.incident_id = r.incident_id;

-- 3. Get audit history
SELECT u.username, a.action, a.entity, a.timestamp
FROM audit_logs a
LEFT JOIN users u ON a.user_id = u.user_id;

-- 4. Count incidents by severity
SELECT severity, COUNT(*) as count
FROM incidents
GROUP BY severity;

-- 5. Find unresolved incidents
SELECT * FROM incidents
WHERE status != 'resolved';