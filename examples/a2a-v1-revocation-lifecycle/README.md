# A2A v1.0: revocation is not task cancellation

This example uses the official Python SDK to show that revoking an approval
grant does not automatically cancel an already-running A2A Task.

Tested with:

- A2A protocol 1.0
- Python 3.12.4
- `a2a-sdk[http-server]` 1.1.2

Run:

```bash
python -m venv .venv
.venv/bin/pip install -r requirements.txt
.venv/bin/python revocation_vs_task.py
```

Expected output:

```text
[check-once]
grant=REVOKED
task=TASK_STATE_COMPLETED
side_effect=ORDER_CREATED
[revoke-plus-cancel]
grant=REVOKED
task=TASK_STATE_CANCELED
side_effect=BLOCKED
[recheck-before-write]
grant=REVOKED
task=TASK_STATE_REJECTED
side_effect=BLOCKED
```

The first case checks the grant only at task start. The second case propagates
an explicit A2A `CancelTask` request. The third case checks the grant again
immediately before the simulated ERP write. If a write already committed,
compensation is a separate operation.
