# MCP Python SDK v2 / FastMCP migration checks

This directory contains the two executable examples referenced by
`2026-07-28-MCP-Python-SDK-v2-FastMCP-Migration.md`.

Check the import split in isolated environments:

```bash
uv run --python 3.12 --with "mcp==1.29.0" \
  python -c 'import importlib.util; print(importlib.util.find_spec("mcp.server.fastmcp").origin)'

uv run --python 3.12 --with "mcp==2.0.0" \
  python -c 'import importlib.util; print(importlib.util.find_spec("mcp.server.fastmcp"))'

uv run --python 3.12 --with "fastmcp==3.4.5" \
  python -c 'import importlib.metadata; print(importlib.metadata.version("mcp"))'
```

Expected results are an import path for `mcp==1.29.0`, `None` for
`mcp==2.0.0`, and `1.29.0` for FastMCP 3.4.5's resolved MCP dependency.

Run each tool-call example in an isolated environment:

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
