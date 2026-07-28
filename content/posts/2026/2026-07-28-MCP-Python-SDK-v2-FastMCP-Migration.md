---
title: "MCP Python SDK v2가 나왔다. FastMCP 사용자는 import부터 확인해야 한다"
date: "2026-07-28"
teaser: "FastMCP는 하나가 아니었다. mcp 1.29.0, 2.0.0, fastmcp 3.4.5를 직접 설치해 어디서 깨지는지 확인했다."
image: "/images/posts/2026/2026-07-28-MCP-Python-SDK-v2-FastMCP-Migration/cover.svg"
tags:
  - MCP
  - FastMCP
  - Python
  - AI Agent
  - Migration
---

## 릴리스 노트보다 먼저 import를 확인했다

7월 28일 밤 [MCP Python SDK v2.0.0](https://github.com/modelcontextprotocol/python-sdk/releases/tag/v2.0.0)이 정식으로 나왔다. 이제 버전을 고정하지 않고 `pip install mcp`를 실행하면 2.x가 설치된다.

릴리스 노트를 읽다가 가장 먼저 걸린 단어는 `FastMCP`였다. Python으로 MCP 서버를 만들 때 많이 쓰는 이름인데, 사실 이 이름을 가진 코드가 둘이다.

```python
# 공식 MCP Python SDK v1에 들어 있던 FastMCP
from mcp.server.fastmcp import FastMCP

# Prefect가 따로 관리하는 FastMCP
from fastmcp import FastMCP
```

같은 프로젝트의 구버전과 신버전처럼 보이지만 그렇지 않다. 그래서 문서만 읽지 않고 깨끗한 Python 3.12.4 환경 세 개를 만들었다. `mcp==1.29.0`, `mcp==2.0.0`, `fastmcp==3.4.5`를 각각 설치한 뒤 import와 tool 호출을 돌려봤다.

결과는 단순했다.

| 확인한 것 | 결과 |
|---|---|
| `mcp==1.29.0`에서 `mcp.server.fastmcp` import | 성공 |
| `mcp==2.0.0`에서 같은 import | `ModuleNotFoundError` |
| `fastmcp==3.4.5`가 선택한 공식 SDK | `mcp==1.29.0` |
| 공식 SDK v2와 FastMCP 3의 tool 호출 | 둘 다 `{'result': 5}` |

내 결론은 이렇다. `mcp.server.fastmcp`를 썼다면 바로 영향을 받는다. 반대로 `from fastmcp import FastMCP`를 썼다면 오늘 당장 깨질 가능성은 낮다. 대신 새 MCP 프로토콜을 쓰고 있는 것도 아니다.

![이름은 같지만 업그레이드 경로가 다른 두 FastMCP](/images/posts/2026/2026-07-28-MCP-Python-SDK-v2-FastMCP-Migration/cover.svg)

## v2는 클래스 이름보다 서버의 수명주기를 바꿨다

눈에 먼저 들어오는 변화는 `FastMCP`가 `MCPServer`로 바뀐 것이다. 더 큰 변화는 프로토콜 쪽에 있다.

MCP `2026-07-28`에서는 `initialize`와 `initialized` handshake가 없어졌다. `Mcp-Session-Id`도 더 이상 쓰지 않는다. 클라이언트의 프로토콜 버전과 capability는 매 요청의 `_meta`에 실린다. 서버가 지원하는 버전을 먼저 알아보는 RPC는 `server/discover`다.

운영 관점에서 번역하면 **연결마다 서버 메모리에 상태를 쌓아두지 말라는 뜻**에 가깝다. 이전 요청에서 만든 상태가 다음 요청에도 같은 프로세스에 남아 있을 것이라 가정했다면 그 코드부터 봐야 한다. 필요한 상태는 tool 인자로 넘기거나 외부 저장소에 두는 편이 맞다.

구형 클라이언트를 바로 끊어야 하는 것은 아니다. v2의 `MCPServer`는 2026 프로토콜과 이전 프로토콜을 같은 endpoint에서 처리한다. 새 `Client`도 상대가 지원하는 버전을 알아서 고른다.

그 밖에 `subscriptions/listen`, MRTR(Multi-Round-Trip Requests), extension API, OpenTelemetry trace context가 들어왔다. Roots, Sampling, Logging은 deprecated 상태가 됐다. 여기까지는 [2026-07-28 RC 설명](https://blog.modelcontextprotocol.io/posts/2026-07-28-release-candidate/)과 [v2 릴리스 노트](https://github.com/modelcontextprotocol/python-sdk/releases/tag/v2.0.0)에 잘 정리돼 있다.

## 공식 SDK의 FastMCP를 썼다면 일단 `<2`부터 건다

현재 코드가 아래 import를 쓴다면 `mcp`를 무심코 올려서는 안 된다.

```python
from mcp.server.fastmcp import FastMCP
```

마이그레이션 브랜치를 따로 만들기 전에는 dependency에 상한을 두는 게 먼저다.

```toml
dependencies = [
  "mcp>=1.28,<2",
]
```

v1은 이제 유지보수 모드지만 보안 수정은 계속 나온다. `<2`는 버티기 위한 임시 조치다. 준비가 끝나면 `MCPServer`로 옮겨야 한다.

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

decorator는 그대로 쓸 수 있다. `@mcp.tool()`, `@mcp.resource()`, `@mcp.prompt()`의 모양은 바뀌지 않았다. 문제는 주변 코드다.

서버의 `version`을 생략하면 이제 빈 문자열이 나간다. SDK 버전과 내 서버 버전은 다른 값이니 직접 적으라는 의도다. host, port, transport security 같은 설정은 생성자가 아니라 `run()`이나 `streamable_http_app()`으로 옮겨졌다. 동기 handler는 worker thread에서 돌고 Streamable HTTP body 기본 제한은 `4 MiB`다. SDK가 대신 읽어주던 `MCP_*` 환경 변수도 없어졌다.

저장소가 크다면 우선 이 정도를 찾는다.

```bash
rg 'mcp\.server\.fastmcp|ClientSession|streamablehttp_client|McpError|inputSchema|ctx\.fastmcp'
```

검색 결과가 곧 작업 목록이다. `McpError`는 `MCPError`가 됐고 Python attribute는 camelCase에서 snake_case로 바뀌었다. `streamablehttp_client`는 없어졌다. `ctx.fastmcp`는 `ctx.mcp_server`다. `FastMCP()`의 두 번째 이후 위치 인자도 keyword로 고치는 편이 안전하다. 생성자 인자 순서가 달라져 에러 없이 엉뚱한 필드에 들어갈 수 있기 때문이다.

## `from fastmcp import FastMCP`라면 오늘은 건드리지 않는다

Prefect의 FastMCP 3.4.5는 dependency를 `mcp>=1.24.0,<2.0`으로 선언한다. 내가 격리 환경에서 설치했을 때도 `mcp==1.29.0`이 잡혔다.

그래서 FastMCP 3를 쓰는 운영 서버라면 지금은 정확한 버전을 고정하고 기다리겠다.

```toml
dependencies = [
  "fastmcp==3.4.5",
]
```

코드 변경 위험이 가장 낮은 선택이다. 단, 이 상태로는 2026 프로토콜의 sessionless 요청이나 MRTR을 쓰지 못한다.

FastMCP 4도 보이지만 아직 `4.0.0a2` alpha다. 더구나 이 버전은 최종 SDK보다 먼저 나온 `mcp==2.0.0b2`에 의존한다. 운영 서버의 기본 선택으로 삼을 단계는 아니다. FastMCP의 composition, proxy, auth 기능이 많이 필요하면 v4 stable을 기다리고, 새 프로토콜이 당장 필요하면 공식 `MCPServer` v2를 별도로 검토하는 쪽이 낫다.

공식 SDK v1에서 독립 FastMCP 3로 옮기는 방법도 있다. 간단한 서버는 import 한 줄로 시작할 수 있다. transport 설정과 prompt message type까지 같지는 않으니 [FastMCP 전환 가이드](https://gofastmcp.com/getting-started/upgrading/from-mcp-sdk)는 따로 봐야 한다.

## 실제 코드에서는 여기서 더 걸린다

### `httpx2`는 단순한 패키지 이름 변경이 아니다

SDK 내부 HTTP client가 `httpx`에서 `httpx2`로 바뀌었다. 내 코드가 `httpx`를 직접 import하면서도 dependency에는 쓰지 않았다면 v2에서 갑자기 `ModuleNotFoundError`가 난다. 이 경우 앱 dependency에 `httpx`를 직접 추가하면 된다.

SDK에 HTTP client나 OAuth provider를 주입하는 코드는 더 조심해야 한다. `httpx`와 `httpx2` 객체는 런타임 타입이 다르다. 예전 `except httpx.ConnectError`나 `httpx.MockTransport`가 SDK 쪽 오류를 더는 잡지 못할 수 있다. `sse-starlette<3` pin이 있다면 v2의 `sse-starlette>=3`과 충돌하는지도 본다.

### JSON 문자열을 구조화 출력으로 착각하기 쉽다

tool이 `json.dumps()` 결과를 반환하면 클라이언트가 받는 것은 JSON처럼 생긴 문자열이다. 필드 단위로 쓸 결과라면 Pydantic model이나 `dict`를 반환하는 편이 낫다.

v2에서는 scalar 반환도 `structured_content`에 들어온다. 아래 코드는 실제로 실행했고 `{'result': 5}`를 확인했다.

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

서버 객체를 `Client`에 직접 넘길 수 있어서 작은 통합 테스트가 꽤 짧아졌다. URL을 넘기면 같은 API로 원격 서버를 부른다.

### Starlette mount에는 lifespan이 필요하다

`streamable_http_app()`을 Starlette에 mount한다면 session manager를 lifespan에 연결해야 한다.

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

이 코드는 로컬에서 tool 하나 호출하는 테스트만으로는 걸러지지 않는다. 앱 시작과 종료를 포함한 통합 테스트가 필요한 이유다.

## 운영 서버라면 이렇게 옮기겠다

먼저 lockfile과 import를 보고 내가 어느 FastMCP를 쓰는지 확정한다. 공식 SDK v1 경로라면 `<2`를 걸어 배포부터 보호한다. 그다음 별도 브랜치에서 `MCPServer`와 새 `Client`로 가장 작은 통합 테스트를 만든다.

여기까지 통과하면 상태 저장 방식, Starlette lifespan, 인증 middleware, `httpx2`, structured output을 차례로 본다. 마지막에는 기존 클라이언트와 새 클라이언트를 같은 endpoint에 붙여본다. v2로 올릴지는 그 뒤에 결정해도 늦지 않다.

직접 돌린 최소 예제와 버전 pin은 [재현 코드](https://github.com/JunHyungKang/JunHyungKang.github.io/tree/master/examples/mcp-v2-fastmcp-migration)에 올려뒀다. 다만 tool 하나를 in-memory로 호출한 결과가 운영 호환성을 보장하지는 않는다. 인증, 외부 API, 장시간 stream이 붙은 서버는 각자 통합 테스트가 필요하다.

마지막으로 공개 상태도 구분할 필요가 있다. 이 글을 확인한 `2026-07-28 23:17 KST`에는 Python SDK v2 stable은 나왔지만 specification 저장소에는 아직 `2026-07-28-RC`만 보였다. SDK 릴리스 노트는 2026 프로토콜을 지원한다고 명시한다. spec 문서 자체를 compliance 기준으로 쓰고 있다면 [release 목록](https://github.com/modelcontextprotocol/modelcontextprotocol/releases)을 한 번 더 확인하는 게 좋다.

## 참고한 문서

- [MCP Python SDK v2.0.0 릴리스 노트](https://github.com/modelcontextprotocol/python-sdk/releases/tag/v2.0.0)
- [MCP Python SDK v2 마이그레이션 가이드](https://py.sdk.modelcontextprotocol.io/migration/)
- [MCP 2026-07-28 RC 개요](https://blog.modelcontextprotocol.io/posts/2026-07-28-release-candidate/)
- [FastMCP 3.4.5 dependency](https://github.com/PrefectHQ/fastmcp/blob/v3.4.5/fastmcp_slim/pyproject.toml)
- [FastMCP 4.0.0a2 릴리스](https://github.com/PrefectHQ/fastmcp/releases/tag/v4.0.0a2)
