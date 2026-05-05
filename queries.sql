SELECT * FROM incidents;

SELECT * FROM incidents WHERE severity = 'high';

SELECT severity, COUNT(*) 
FROM incidents
GROUP BY severity;

SELECT i.incident_type, r.action_taken
FROM incidents i
JOIN responses r ON i.incident_id = r.incident_id;