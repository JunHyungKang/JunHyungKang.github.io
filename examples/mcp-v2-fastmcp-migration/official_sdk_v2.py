# /// script
# requires-python = ">=3.12"
# dependencies = [
#   "mcp==2.0.0",
# ]
# ///
"""Minimal MCP Python SDK v2 server and in-memory client check."""

import asyncio

from mcp import Client
from mcp.server import MCPServer

mcp = MCPServer("migration-check", version="1.0.0")


@mcp.tool()
def add(a: int, b: int) -> int:
    """Add two integers."""
    return a + b


async def main() -> None:
    async with Client(mcp) as client:
        result = await client.call_tool("add", {"a": 2, "b": 3})

    assert result.structured_content == {"result": 5}
    print(result.structured_content)


if __name__ == "__main__":
    asyncio.run(main())
