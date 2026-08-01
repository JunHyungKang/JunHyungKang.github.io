# A2A v1.0: revocation is not task cancellation

This example uses the official Python SDK to show that revoking an approval
grant does not automatically cancel an already-running A2A Task.

The grant is application state outside the A2A protocol. It is not an
implementation of `TASK_STATE_AUTH_REQUIRED`. The example isolates the
lifecycle boundary between an already-authorized request, its running A2A
Task, and a simulated downstream write.

Tested with:

- A2A protocol 1.0
- JSON-RPC binding
- Python 3.12.4
- `a2a-sdk[http-server]` 1.1.2

Pinned references:

- [A2A v1.0 `CancelTask` semantics](https://github.com/a2aproject/A2A/blob/v1.0.0/docs/specification.md#L266-L285)
- [Python SDK 1.1.2 `ActiveTask.cancel()`](https://github.com/a2aproject/a2a-python/blob/v1.1.2/src/a2a/server/agent_execution/active_task.py#L707-L756)
- [Python SDK 1.1.2 `AgentExecutor` cancellation contract](https://github.com/a2aproject/a2a-python/blob/v1.1.2/src/a2a/server/agent_execution/agent_executor.py#L51-L77)

Run:

```bash
python -m venv .venv
.venv/bin/pip install -r requirements.txt
.venv/bin/python revocation_vs_task.py
```

Expected output:

```text
[environment]
a2a_sdk=1.1.2
protocol=1.0
binding=JSONRPC
handler=DefaultRequestHandlerV2
[check-once]
grant=REVOKED
task=TASK_STATE_COMPLETED
execute_cancelled=FALSE
cancel_hook_called=FALSE
side_effect=ORDER_CREATED
[revoke-plus-cancel]
grant=REVOKED
task=TASK_STATE_CANCELED
execute_cancelled=TRUE
cancel_hook_called=TRUE
side_effect=BLOCKED
[recheck-before-write]
grant=REVOKED
task=TASK_STATE_REJECTED
execute_cancelled=FALSE
cancel_hook_called=FALSE
side_effect=BLOCKED
```

The first case checks the grant only at task start. The second case propagates
an explicit A2A `CancelTask` request. The third case checks the grant again
immediately before the simulated ERP write. If a write already committed,
compensation is a separate operation.

The script exits with an `AssertionError` if the final Task state, cancellation
signal, cancel hook, or simulated side effect differs from the expected result.
