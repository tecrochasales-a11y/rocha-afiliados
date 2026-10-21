# Architecture rules
- Capture business email events in a transactional database outbox, not UI callbacks, so every entry path is covered.
- Keep Gmail sending and fixed-recipient resolution in one server function; connector credentials must never enter browser code.
- Arm email retries only while work remains and stop scheduling after drain to avoid idle polling.
- Protect email history and actions with the existing server-validated admin role; preserve existing in-app and n8n notifications.