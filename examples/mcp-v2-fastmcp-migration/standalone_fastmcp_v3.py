# /// script
# requires-python = ">=3.12"
# dependencies = [
#   "fastmcp==3.4.5",
# ]
# ///
"""Minimal standalone FastMCP v3 server and in-memory client check."""

import asyncio

from fastmcp import Client, FastMCP

mcp = FastMCP("migration-check")


@mcp.tool
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
