# /// script
# requires-python = ">=3.12"
# dependencies = [
#   "mcp==2.0.0",
#   "uvicorn==0.51.0",
# ]
# ///
"""Verify that one MCPServer HTTP endpoint serves both protocol eras."""

import asyncio

import uvicorn
from mcp import Client
from mcp.server import MCPServer

HOST = "127.0.0.1"
PORT = 8765
URL = f"http://{HOST}:{PORT}/mcp"

mcp = MCPServer("dual-era-check", version="1.0.0")


@mcp.tool()
def identify() -> str:
    """Return a value shared by both protocol eras."""
    return "same handler"


async def main() -> None:
    app = mcp.streamable_http_app(json_response=True)
    server = uvicorn.Server(
        uvicorn.Config(app, host=HOST, port=PORT, log_level="warning")
    )
    server_task = asyncio.create_task(server.serve())

    while not server.started:
        if server_task.done():
            await server_task
        await asyncio.sleep(0.01)

    try:
        async with (
            Client(URL, mode="legacy") as legacy,
            Client(URL) as modern,
        ):
            for label, client in (("legacy", legacy), ("modern", modern)):
                result = await client.call_tool("identify", {})
                print(
                    f"{label}: {client.protocol_version}"
                    f" -> {result.structured_content}"
                )
    finally:
        server.should_exit = True
        await server_task


if __name__ == "__main__":
    asyncio.run(main())
