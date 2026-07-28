# MCP Python SDK v2 / FastMCP migration checks

This directory contains the executable examples referenced by
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
uv run --python 3.12 official_sdk_v2.py
uv run --python 3.12 standalone_fastmcp_v3.py
uv run --python 3.12 dual_protocol_http.py
```

Expected output from the first two:

```text
{'result': 5}
```

`dual_protocol_http.py` starts one Streamable HTTP endpoint and connects two
MCP Python SDK v2 clients to it. One forces the legacy handshake while the
other uses the default automatic negotiation:

```text
legacy: 2025-11-25 -> {'result': 'same handler'}
modern: 2026-07-28 -> {'result': 'same handler'}
```

To verify the v2 client's fallback against an actual v1 server, start these in
two terminals:

```bash
# terminal 1
uv run --python 3.12 legacy_sdk_v1_server.py

# terminal 2
uv run --python 3.12 v2_client_fallback.py
```

The v2 client first tries modern discovery, then negotiates the latest
handshake-era version after the v1 server rejects that method:

```text
auto fallback: 2025-11-25 -> {'result': 'legacy server'}
```

The dependency metadata intentionally pins exact versions:

- `mcp==2.0.0` for the official MCP Python SDK v2 example
- `mcp==2.0.0` and `uvicorn==0.51.0` for the dual-protocol HTTP example
- `mcp==1.29.0` for the legacy fallback server
- `mcp==2.0.0` for the fallback client
- `fastmcp==3.4.5` for the standalone FastMCP v3 example

The standalone package currently resolves the official SDK's v1 maintenance
line because FastMCP 3.4.5 declares `mcp>=1.24.0,<2.0`.
