---
title: "MCP Python SDK v2를 설치해보니 FastMCP가 둘이었다"
date: "2026-07-28"
teaser: "mcp 1.29.0과 2.0.0, fastmcp 3.4.5를 따로 설치했다. 같은 FastMCP 이름이 서로 다른 업그레이드 경로를 가리켰다."
image: "/images/posts/2026/2026-07-28-MCP-Python-SDK-v2-FastMCP-Migration/cover.svg"
tags:
  - MCP
  - FastMCP
  - Python
  - AI Agent
  - Migration
---

## import 한 줄에서 판단이 갈렸다

7월 28일 밤 [MCP Python SDK v2.0.0](https://github.com/modelcontextprotocol/python-sdk/releases/tag/v2.0.0)이 정식으로 나왔다. 버전을 고정하지 않고 `pip install mcp`를 실행하면 이제 2.x가 설치된다.

릴리스 노트에서 `FastMCP`가 `MCPServer`로 바뀌었다는 문장을 보고 먼저 내 코드를 떠올렸다. 그런데 Python에서 `FastMCP`라고 부르는 것은 하나가 아니다.

```python
# 공식 MCP Python SDK v1에 포함됐던 FastMCP
from mcp.server.fastmcp import FastMCP

# 별도 패키지로 배포되는 FastMCP
from fastmcp import FastMCP
```

이 둘을 같은 프로젝트의 구버전과 신버전 정도로 생각하면 마이그레이션 판단부터 어긋난다.

그래서 Python 3.12.4 격리 환경을 세 개 만들었다. `mcp==1.29.0`, `mcp==2.0.0`, `fastmcp==3.4.5`를 따로 설치하고 import와 tool 호출을 확인했다.

```text
mcp==1.29.0    mcp.server.fastmcp  → import 성공
mcp==2.0.0     mcp.server.fastmcp  → 모듈 없음
fastmcp==3.4.5 의존성 해석 결과   → mcp==1.29.0

공식 SDK v2 tool 호출              → {'result': 5}
FastMCP 3 tool 호출                → {'result': 5}
```

여기까지만 돌려봐도 import 한 줄로 판단이 갈린다. `mcp.server.fastmcp`를 썼다면 v2의 직접 영향권이다. `from fastmcp import FastMCP`를 썼다면 당장 깨질 가능성은 낮지만 새 프로토콜로 올라간 것도 아니다.

![FastMCP import 경로에 따라 달라지는 MCP Python SDK v2 대응 방법](/images/posts/2026/2026-07-28-MCP-Python-SDK-v2-FastMCP-Migration/fastmcp-action-path.svg)

## v2에서 더 신경 쓰인 것은 session이 사라진 점이다

클래스 이름 변경은 검색해서 고칠 수 있다. 운영 방식을 다시 보게 만든 변화는 따로 있었다.

MCP `2026-07-28` 경로에는 `initialize`와 `initialized` handshake가 없다. `Mcp-Session-Id`도 쓰지 않는다. 프로토콜 버전과 `clientCapabilities`는 요청마다 `_meta`에 들어간다. 새 `Client`는 먼저 `server/discover`를 시도하고, 상대가 구형 서버면 기존 handshake로 돌아간다.

![MCP 2025 계열의 session 기반 요청과 2026 계열의 sessionless 요청 비교](/images/posts/2026/2026-07-28-MCP-Python-SDK-v2-FastMCP-Migration/request-lifecycle.svg)

신규 클라이언트만 상대한다면 특정 워커에 session을 붙잡아 둘 이유가 줄어든다. 반대로 이전 요청에서 만든 메모리 상태가 다음 요청에도 같은 프로세스에 남아 있을 것이라고 가정한 tool은 다시 봐야 한다.

다만 v2의 `MCPServer`는 같은 엔드포인트에서 2025 계열 클라이언트도 받는다. 구형 클라이언트는 여전히 session을 만든다. SDK를 v2로 올렸다고 기존 트래픽까지 한 번에 stateless가 되는 것은 아니다.

`subscriptions/listen`, multi-round-trip request, extension API처럼 새로 들어온 기능도 많다. 그 목록은 공식 문서가 더 정확하고 더 빨리 갱신된다. 이 글에서는 기존 Python 서버를 올릴 때 실제로 걸릴 만한 부분만 다룬다.

## `mcp.server.fastmcp`를 썼다면 먼저 `<2`로 막는다

현재 코드가 아래 import를 쓴다면 의존성 상한부터 확인한다.

```python
from mcp.server.fastmcp import FastMCP
```

공식 릴리스 노트도 마이그레이션이 끝나지 않은 프로젝트에는 `<2`를 권한다.

```toml
dependencies = [
  "mcp>=1.28,<2",
]
```

이 버전 상한이 문제를 해결해 주지는 않는다. 준비 없이 2.x가 설치되는 일을 막을 뿐이다. v1은 유지보수 모드로 들어갔고 앞으로는 보안 수정만 받는다.

그다음 import와 생성자를 바꾼다.

```diff
- from mcp.server.fastmcp import FastMCP
+ from mcp.server import MCPServer

- mcp = FastMCP("demo", transport_security=transport_security)
+ mcp = MCPServer("demo", version="1.4.0")

  if __name__ == "__main__":
-     mcp.run(transport="streamable-http")
+     mcp.run(
+         transport="streamable-http",
+         transport_security=transport_security,
+     )
```

`@mcp.tool()`, `@mcp.resource()`, `@mcp.prompt()`는 그대로 쓸 수 있다. 대개 문제는 그 바깥에서 나온다. host, port, transport security 같은 전송 설정은 생성자에서 `run()` 또는 `streamable_http_app()` 쪽으로 이동했다.

저장소가 크다면 일단 이 검색부터 돌리겠다.

```bash
rg 'mcp\.server\.fastmcp|ClientSession|streamablehttp_client|McpError|inputSchema|ctx\.fastmcp'
```

검색 결과가 거의 그대로 작업 목록이 된다. `McpError`는 `MCPError`가 됐고 Python attribute는 camelCase에서 snake_case로 바뀌었다. `streamablehttp_client`는 제거됐다. `ctx.fastmcp`는 `ctx.mcp_server`로 읽어야 한다.

## `from fastmcp import FastMCP`는 다른 경로다

FastMCP 3.4.5는 공식 SDK를 `mcp>=1.24.0,<2.0`으로 제한한다. 격리 환경에서 설치했을 때도 `mcp==1.29.0`이 잡혔다. `mcp` v2가 공개됐다고 FastMCP 3 서버가 몰래 v2로 바뀌지는 않는다.

운영 중인 FastMCP 3 서버라면 나는 정확한 버전부터 고정하겠다.

```toml
dependencies = [
  "fastmcp==3.4.5",
]
```

[FastMCP 버전 정책](https://gofastmcp.com/getting-started/installation#versioning-policy)은 minor 버전에서도 깨지는 변경을 허용한다. 운영 서버라면 범위로 열어두지 말고 정확한 버전을 적는 편이 낫다.

FastMCP 4.0.0a2도 공개돼 있지만 아직 alpha다. [패키지 메타데이터](https://pypi.org/pypi/fastmcp-slim/4.0.0a2/json)를 확인하면 최종 SDK가 아닌 `mcp==2.0.0b2`에 의존한다. 운영 서버를 v4 alpha로 바로 넘기면 v2 마이그레이션과 무관한 위험까지 함께 떠안는다.

FastMCP의 composition, proxy, auth 기능이 꼭 필요하다면 v4 stable을 기다리겠다. 2026 프로토콜이 먼저 필요하다면 공식 `MCPServer` v2를 따로 검토하는 편이 낫다.

공식 SDK v1에서 독립 FastMCP 3로 옮기는 선택지도 있다. 작은 서버는 import 변경만으로 시작할 수 있지만 transport 설정과 prompt message type까지 같지는 않다. 이 경로는 [FastMCP 전환 가이드](https://gofastmcp.com/getting-started/upgrading/from-mcp-sdk)를 기준으로 별도 작업으로 잡는 편이 안전하다.

## import를 고친 뒤에야 보이는 문제도 있다

`httpx2`가 그중 하나다. SDK 내부 HTTP client가 `httpx`에서 `httpx2`로 바뀌면서 v2는 `httpx`를 더 이상 설치하지 않는다. 내 코드가 `httpx`를 직접 import하면서 dependency 선언은 빼먹었다면 이제 `ModuleNotFoundError`가 난다.

더 까다로운 경우는 HTTP client나 OAuth provider를 SDK에 주입했을 때다. `httpx`와 `httpx2` 객체는 런타임 타입이 다르다. 예전 `except httpx.ConnectError`는 SDK가 던진 `httpx2.ConnectError`를 잡지 못한다. `httpx.MockTransport`로 만든 테스트도 같은 이유로 다시 봐야 한다.

Starlette mount도 작은 in-memory 테스트만으로는 확인이 안 된다. `streamable_http_app()`을 하위 앱으로 mount하면 그 앱의 lifespan은 실행되지 않는다. 최상위 앱이 `mcp.session_manager.run()`을 직접 열어야 한다.

```python
from contextlib import asynccontextmanager

from mcp.server import MCPServer
from starlette.applications import Starlette
from starlette.routing import Mount

mcp = MCPServer("demo", version="1.4.0")


@asynccontextmanager
async def lifespan(app: Starlette):
    async with mcp.session_manager.run():
        yield


app = Starlette(
    routes=[Mount("/", app=mcp.streamable_http_app(json_response=True))],
    lifespan=lifespan,
)
```

lifespan을 빼도 애플리케이션은 시작된다. 첫 MCP 요청에서야 `Task group is not initialized`가 난다. 시작과 종료를 포함한 통합 테스트가 필요한 이유다.

## 최소 테스트 하나는 남겨두는 편이 낫다

v2의 `Client`에는 서버 객체를 직접 넘길 수 있다. 네트워크 없이 decorator, schema, 호출 결과를 한 번에 확인할 수 있어서 마이그레이션 첫 테스트로 쓰기 좋았다.

```python
import asyncio

from mcp import Client
from mcp.server import MCPServer

mcp = MCPServer("migration-check", version="1.0.0")


@mcp.tool()
def add(a: int, b: int) -> int:
    return a + b


async def main() -> None:
    async with Client(mcp) as client:
        result = await client.call_tool("add", {"a": 2, "b": 3})

    assert result.structured_content == {"result": 5}


asyncio.run(main())
```

이 테스트는 실제로 `{'result': 5}`를 반환했다. 같은 tool을 FastMCP 3에서도 돌려 결과를 맞췄다. 실행 파일과 버전 pin은 [재현 코드](https://github.com/JunHyungKang/JunHyungKang.github.io/tree/master/examples/mcp-v2-fastmcp-migration)에 넣었다.

이 결과가 운영 호환성까지 보장하지는 않는다. 인증과 외부 API, 장시간 stream이 붙으면 확인 범위가 달라진다. session에 상태를 두었거나 Starlette에 mount한 서버라면 HTTP 통합 테스트를 별도로 붙여야 한다.

내가 운영 서버를 옮긴다면 lockfile과 import를 먼저 확인한다. 공식 SDK v1 경로가 발견되면 `<2`로 현재 배포를 보호하고, 별도 브랜치에서 `MCPServer`와 새 `Client`로 가장 작은 테스트부터 만든다. 그 테스트가 통과한 뒤 `httpx2`, lifespan, 상태 저장 방식을 본다. 마지막에 구형 클라이언트와 새 클라이언트를 같은 엔드포인트에 붙인다.

버전 숫자만 보고 의존성을 올리는 것보다 손이 더 간다. 그래도 문제가 생겼을 때 어느 경로에서 깨졌는지는 설명할 수 있다.

> **공개 상태 메모 — 2026-07-28 23:32 KST**
> Python SDK `v2.0.0`은 stable로 공개됐다. 다만 글을 확인한 시점에는 specification 저장소에서 final `2026-07-28` tag를 찾지 못했다. 프로토콜 준수 여부를 판정해야 하는 작업이라면 final tag 공개 후 세부 항목을 다시 대조할 생각이다.

## 참고한 문서

- [MCP Python SDK v2.0.0 릴리스 노트](https://github.com/modelcontextprotocol/python-sdk/releases/tag/v2.0.0)
- [MCP Python SDK v2 마이그레이션 가이드](https://py.sdk.modelcontextprotocol.io/migration/)
- [MCP Python SDK v2에서 달라진 점](https://py.sdk.modelcontextprotocol.io/whats-new/)
- [MCP 2026-07-28 RC 개요](https://blog.modelcontextprotocol.io/posts/2026-07-28-release-candidate/)
- [FastMCP 3.4.5 dependency](https://github.com/PrefectHQ/fastmcp/blob/v3.4.5/fastmcp_slim/pyproject.toml)
- [FastMCP 4.0.0a2 릴리스](https://github.com/PrefectHQ/fastmcp/releases/tag/v4.0.0a2)
