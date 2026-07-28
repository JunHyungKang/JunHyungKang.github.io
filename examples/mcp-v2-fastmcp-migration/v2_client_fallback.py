# /// script
# requires-python = ">=3.12"
# dependencies = [
#   "mcp==2.0.0",
# ]
# ///
"""Verify that the MCP Python SDK v2 Client falls back to a v1 server."""

import asyncio

from mcp import Client

URL = "http://127.0.0.1:8766/mcp"


async def main() -> None:
    async with Client(URL) as client:
        result = await client.call_tool("identify", {})
        print(
            f"auto fallback: {client.protocol_version}"
            f" -> {result.structured_content}"
        )


if __name__ == "__main__":
    asyncio.run(main())
