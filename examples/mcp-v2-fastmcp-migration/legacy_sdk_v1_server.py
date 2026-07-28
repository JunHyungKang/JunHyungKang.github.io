# /// script
# requires-python = ">=3.12"
# dependencies = [
#   "mcp==1.29.0",
# ]
# ///
"""Run a legacy MCP Python SDK v1 Streamable HTTP server."""

from mcp.server.fastmcp import FastMCP

mcp = FastMCP(
    "legacy-sdk-v1",
    host="127.0.0.1",
    port=8766,
    json_response=True,
)


@mcp.tool()
def identify() -> str:
    """Identify the handler reached after client negotiation."""
    return "legacy server"


if __name__ == "__main__":
    mcp.run(transport="streamable-http")
