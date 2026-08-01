"""Show that revoking a grant does not cancel an already-running A2A Task.

Protocol: A2A 1.0
Python package: a2a-sdk[http-server] 1.1.2
"""

import asyncio
from importlib.metadata import version

import httpx
import uvicorn

from a2a.client import A2ACardResolver, ClientConfig, create_client
from a2a.helpers import (
    new_task_from_user_message,
    new_text_message,
    new_text_part,
)
from a2a.server.agent_execution import AgentExecutor, RequestContext
from a2a.server.events import EventQueue
from a2a.server.request_handlers import DefaultRequestHandler
from a2a.server.routes import create_agent_card_routes, create_jsonrpc_routes
from a2a.server.tasks import InMemoryTaskStore, TaskUpdater
from a2a.types import (
    AgentCapabilities,
    AgentCard,
    AgentInterface,
    AgentSkill,
    CancelTaskRequest,
    GetTaskRequest,
    Role,
    SendMessageConfiguration,
    SendMessageRequest,
    TaskState,
)
from starlette.applications import Starlette


HOST = "127.0.0.1"
PORT = 9999
BASE_URL = f"http://{HOST}:{PORT}"
TERMINAL_STATES = {
    TaskState.TASK_STATE_COMPLETED,
    TaskState.TASK_STATE_FAILED,
    TaskState.TASK_STATE_CANCELED,
    TaskState.TASK_STATE_REJECTED,
}


class ApprovalGrant:
    def __init__(self) -> None:
        self.active = True

    def reset(self) -> None:
        self.active = True

    def revoke(self) -> None:
        self.active = False


class PurchaseAgentExecutor(AgentExecutor):
    def __init__(self, grant: ApprovalGrant) -> None:
        self.grant = grant
        self.recheck_before_write = False
        self.side_effects: list[str] = []
        self.execute_cancelled = False
        self.cancel_hook_called = False

    async def execute(
        self,
        context: RequestContext,
        event_queue: EventQueue,
    ) -> None:
        task = new_task_from_user_message(context.message)
        task.status.state = TaskState.TASK_STATE_WORKING
        await event_queue.enqueue_event(task)

        updater = TaskUpdater(
            event_queue=event_queue,
            task_id=task.id,
            context_id=task.context_id,
        )

        if not self.grant.active:
            await updater.reject(new_text_message("approval already revoked"))
            return

        try:
            # The A2A request has returned, but this Task keeps running.
            await asyncio.sleep(0.4)

            if self.recheck_before_write and not self.grant.active:
                await updater.reject(
                    new_text_message("approval revoked before ERP write")
                )
                return

            self.side_effects.append("ORDER_CREATED")
            await updater.add_artifact(
                parts=[
                    new_text_part(
                        text="ERP order created",
                        media_type="text/plain",
                    )
                ]
            )
            await updater.complete(new_text_message("purchase completed"))
        except asyncio.CancelledError:
            self.execute_cancelled = True
            raise

    async def cancel(
        self,
        context: RequestContext,
        event_queue: EventQueue,
    ) -> None:
        self.cancel_hook_called = True
        if context.task_id is None or context.context_id is None:
            return
        updater = TaskUpdater(
            event_queue=event_queue,
            task_id=context.task_id,
            context_id=context.context_id,
        )
        await updater.cancel(new_text_message("A2A CancelTask received"))


def build_app(
    executor: PurchaseAgentExecutor,
) -> tuple[Starlette, DefaultRequestHandler]:
    card = AgentCard(
        name="Purchase Agent",
        description="A2A task and authorization lifecycle example",
        version="0.1.0",
        default_input_modes=["text/plain"],
        default_output_modes=["text/plain"],
        capabilities=AgentCapabilities(streaming=False),
        supported_interfaces=[
            AgentInterface(
                protocol_binding="JSONRPC",
                url=BASE_URL,
                protocol_version="1.0",
            )
        ],
        skills=[
            AgentSkill(
                id="create_order",
                name="Create order",
                description="Create an order in ERP",
                input_modes=["text/plain"],
                output_modes=["text/plain"],
                tags=["purchase"],
            )
        ],
    )
    handler = DefaultRequestHandler(
        agent_executor=executor,
        task_store=InMemoryTaskStore(),
        agent_card=card,
    )
    routes = [
        *create_agent_card_routes(card),
        *create_jsonrpc_routes(handler, "/"),
    ]
    return Starlette(routes=routes), handler


async def wait_for_terminal_task(client, task_id: str):
    async with asyncio.timeout(5):
        while True:
            task = await client.get_task(GetTaskRequest(id=task_id))
            if task.status.state in TERMINAL_STATES:
                return task
            await asyncio.sleep(0.05)


async def start_task(client) -> str:
    request = SendMessageRequest(
        message=new_text_message(
            "30만 원 이하 SaaS 갱신 주문",
            role=Role.ROLE_USER,
        ),
        configuration=SendMessageConfiguration(return_immediately=True),
    )
    events = client.send_message(request)
    first_event = await events.__anext__()
    if not first_event.HasField("task"):
        raise RuntimeError("expected the first A2A event to contain a Task")
    return first_event.task.id


async def run_case(
    *,
    client,
    grant: ApprovalGrant,
    executor: PurchaseAgentExecutor,
    name: str,
    recheck_before_write: bool,
    expected_state: int,
    expect_side_effect: bool,
) -> None:
    grant.reset()
    executor.recheck_before_write = recheck_before_write
    executor.side_effects.clear()
    executor.execute_cancelled = False
    executor.cancel_hook_called = False

    task_id = await start_task(client)
    grant.revoke()
    task = await wait_for_terminal_task(client, task_id)

    if task.status.state != expected_state:
        raise AssertionError(
            f"{name}: expected {TaskState.Name(expected_state)}, "
            f"got {TaskState.Name(task.status.state)}"
        )
    if bool(executor.side_effects) is not expect_side_effect:
        raise AssertionError(
            f"{name}: side effect expectation did not match"
        )
    if executor.execute_cancelled or executor.cancel_hook_called:
        raise AssertionError(f"{name}: unexpected cancellation signal")

    print(f"[{name}]")
    print("grant=REVOKED")
    print(f"task={TaskState.Name(task.status.state)}")
    print(f"execute_cancelled={str(executor.execute_cancelled).upper()}")
    print(f"cancel_hook_called={str(executor.cancel_hook_called).upper()}")
    print(
        "side_effect="
        + (executor.side_effects[0] if executor.side_effects else "BLOCKED")
    )


async def run_cancel_case(
    *,
    client,
    grant: ApprovalGrant,
    executor: PurchaseAgentExecutor,
) -> None:
    grant.reset()
    executor.recheck_before_write = False
    executor.side_effects.clear()
    executor.execute_cancelled = False
    executor.cancel_hook_called = False

    task_id = await start_task(client)
    grant.revoke()
    task = await client.cancel_task(CancelTaskRequest(id=task_id))

    if task.status.state != TaskState.TASK_STATE_CANCELED:
        raise AssertionError(
            "revoke-plus-cancel: Task did not reach CANCELED"
        )
    if not executor.execute_cancelled or not executor.cancel_hook_called:
        raise AssertionError(
            "revoke-plus-cancel: SDK cancellation path was not observed"
        )
    if executor.side_effects:
        raise AssertionError(
            "revoke-plus-cancel: downstream side effect was not blocked"
        )

    print("[revoke-plus-cancel]")
    print("grant=REVOKED")
    print(f"task={TaskState.Name(task.status.state)}")
    print(f"execute_cancelled={str(executor.execute_cancelled).upper()}")
    print(f"cancel_hook_called={str(executor.cancel_hook_called).upper()}")
    print(
        "side_effect="
        + (executor.side_effects[0] if executor.side_effects else "BLOCKED")
    )


async def main() -> None:
    grant = ApprovalGrant()
    executor = PurchaseAgentExecutor(grant)
    app, handler = build_app(executor)

    print("[environment]")
    print(f"a2a_sdk={version('a2a-sdk')}")
    print("protocol=1.0")
    print("binding=JSONRPC")
    print(f"handler={handler.__class__.__name__}")

    server = uvicorn.Server(
        uvicorn.Config(app, host=HOST, port=PORT, log_level="warning")
    )
    server_task = asyncio.create_task(server.serve())
    async with asyncio.timeout(5):
        while not server.started:
            await asyncio.sleep(0.01)

    try:
        async with httpx.AsyncClient() as httpx_client:
            resolver = A2ACardResolver(
                httpx_client=httpx_client,
                base_url=BASE_URL,
            )
            agent_card = await resolver.get_agent_card()

        client = await create_client(
            agent=agent_card,
            client_config=ClientConfig(streaming=False),
        )
        try:
            await run_case(
                client=client,
                grant=grant,
                executor=executor,
                name="check-once",
                recheck_before_write=False,
                expected_state=TaskState.TASK_STATE_COMPLETED,
                expect_side_effect=True,
            )
            await run_cancel_case(
                client=client,
                grant=grant,
                executor=executor,
            )
            await run_case(
                client=client,
                grant=grant,
                executor=executor,
                name="recheck-before-write",
                recheck_before_write=True,
                expected_state=TaskState.TASK_STATE_REJECTED,
                expect_side_effect=False,
            )
        finally:
            await client.close()
    finally:
        await handler.aclose()
        server.should_exit = True
        await server_task


if __name__ == "__main__":
    asyncio.run(main())
