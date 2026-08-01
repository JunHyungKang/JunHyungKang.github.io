"""Show that revoking a grant does not cancel an already-running A2A Task.

Protocol: A2A 1.0
Python package: a2a-sdk[http-server] 1.1.2
"""

import asyncio

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

    async def cancel(
        self,
        context: RequestContext,
        event_queue: EventQueue,
    ) -> None:
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
) -> None:
    grant.reset()
    executor.recheck_before_write = recheck_before_write
    executor.side_effects.clear()

    task_id = await start_task(client)
    grant.revoke()
    task = await wait_for_terminal_task(client, task_id)

    print(f"[{name}]")
    print("grant=REVOKED")
    print(f"task={TaskState.Name(task.status.state)}")
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

    task_id = await start_task(client)
    grant.revoke()
    task = await client.cancel_task(CancelTaskRequest(id=task_id))

    print("[revoke-plus-cancel]")
    print("grant=REVOKED")
    print(f"task={TaskState.Name(task.status.state)}")
    print(
        "side_effect="
        + (executor.side_effects[0] if executor.side_effects else "BLOCKED")
    )


async def main() -> None:
    grant = ApprovalGrant()
    executor = PurchaseAgentExecutor(grant)
    app, handler = build_app(executor)

    server = uvicorn.Server(
        uvicorn.Config(app, host=HOST, port=PORT, log_level="warning")
    )
    server_task = asyncio.create_task(server.serve())
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
            )
        finally:
            await client.close()
    finally:
        await handler.aclose()
        server.should_exit = True
        await server_task


if __name__ == "__main__":
    asyncio.run(main())
