# MCP Python SDK v2 / FastMCP migration checks

This directory contains the two executable examples referenced by
`2026-07-28-MCP-Python-SDK-v2-FastMCP-Migration.md`.

Run each example in an isolated environment:

```bash
uv run official_sdk_v2.py
uv run standalone_fastmcp_v3.py
```

Expected output from both:

```text
{'result': 5}
```

The dependency metadata intentionally pins exact versions:

- `mcp==2.0.0` for the official MCP Python SDK v2 example
- `fastmcp==3.4.5` for the standalone FastMCP v3 example

The standalone package currently resolves the official SDK's v1 maintenance
line because FastMCP 3.4.5 declares `mcp>=1.24.0,<2.0`.
