---
title: "MCP Python SDK v2 공개: FastMCP 사용자가 지금 해야 할 일"
date: "2026-07-28"
teaser: "공식 SDK의 FastMCP와 독립 FastMCP는 같은 이름이지만 업그레이드 경로가 다르다. 실제 버전 해석과 실행 결과를 바탕으로 정리했다."
image: "/images/posts/2026/2026-07-28-MCP-Python-SDK-v2-FastMCP-Migration/cover.svg"
tags:
  - MCP
  - FastMCP
  - Python
  - AI Agent
  - Migration
---

## 먼저 확인할 것은 버전이 아니라 import 문이다

2026년 7월 28일, [MCP Python SDK v2.0.0](https://github.com/modelcontextprotocol/python-sdk/releases/tag/v2.0.0)이 안정 버전으로 공개됐다. 이제 버전을 고정하지 않은 `pip install mcp`는 2.x를 설치한다.

그런데 Python에서 MCP 서버를 만든 개발자에게는 혼동하기 쉬운 지점이 있다. 지금까지 `FastMCP`라는 이름으로 서로 다른 두 패키지를 써왔기 때문이다.

```python
# 1. 공식 MCP Python SDK v1에 포함된 FastMCP
from mcp.server.fastmcp import FastMCP

# 2. Prefect가 관리하는 독립 패키지 FastMCP
from fastmcp import FastMCP
```

두 코드는 이름만 같다. 첫 번째는 SDK v2에서 `MCPServer`로 바뀌었고, 두 번째의 현재 안정 버전은 공식 SDK v1에 의존한다. 따라서 “FastMCP를 쓰고 있다”는 정보만으로는 업그레이드 액션을 정할 수 없다.

결론부터 정리하면 다음과 같다.

| 현재 코드 | v2 공개 직후 영향 | 지금 할 일 |
|---|---|---|
| `from mcp.server.fastmcp import FastMCP` | `mcp`를 2.x로 올리면 import부터 실패 | 즉시 `<2`로 고정하거나 `MCPServer`로 마이그레이션 |
| `from fastmcp import FastMCP` | FastMCP 3.4.5가 `mcp<2`를 요구하므로 바로 깨지지 않음 | v3를 고정하고 유지. 새 프로토콜이 필요하면 v4 안정 버전을 기다리거나 공식 SDK v2를 검토 |
| `ClientSession`과 `initialize()`를 직접 사용 | v2의 새 Client API와 생명주기 모델로 변경 | `Client(target)` 중심으로 클라이언트 코드 재작성 |

![MCP Python SDK v2와 두 FastMCP 경로](/images/posts/2026/2026-07-28-MCP-Python-SDK-v2-FastMCP-Migration/cover.svg)

---

## v2에서 가장 크게 바뀐 것

### 1. 프로토콜이 세션 중심에서 요청 중심으로 바뀌었다

SDK v2는 MCP `2026-07-28` 리비전을 지원한다. 새 리비전은 연결 초기에 수행하던 `initialize`와 `initialized` 교환, `Mcp-Session-Id` 기반 세션을 없앤다. 대신 각 요청의 `_meta`에 프로토콜 버전과 클라이언트 정보를 넣는다. 서버 정보를 먼저 알고 싶을 때는 `server/discover`를 사용한다.

이 변화는 단순한 메서드명 교체가 아니다. 서버 프로세스의 메모리에 연결별 상태가 계속 남아 있다고 가정한 코드라면 다시 설계해야 한다. 요청이 어느 인스턴스로 가더라도 같은 결과를 내도록 상태를 외부 저장소나 요청 컨텍스트로 옮겨야 한다.

다만 기존 클라이언트를 한 번에 버릴 필요는 없다. v2의 `MCPServer`는 같은 서버에서 2026 리비전과 이전 리비전을 함께 제공하고, 클라이언트가 지원하는 버전에 맞춰 협상한다. 이 하위 호환성은 이번 릴리스의 중요한 운영상 장점이다.

프로토콜 차원에서는 다음 항목도 함께 바뀌었다.

- `subscriptions/listen`이 리소스 구독과 변경 알림을 하나의 스트림으로 통합한다.
- 서버가 클라이언트를 직접 호출하는 대신, 도구 결과와 사용자 입력을 왕복시키는 MRTR(Multi-Round-Trip Requests)을 사용한다.
- 확장 기능과 OpenTelemetry trace context가 일급 개념이 됐다.
- OAuth issuer 검증과 클라이언트 자격 증명 흐름이 강화됐다.
- 기존 Roots, Sampling, Logging 기능은 deprecated 상태가 됐다.

전체 변경 목록은 [2026-07-28 RC 개요](https://blog.modelcontextprotocol.io/posts/2026-07-28-release-candidate/)와 [Python SDK v2 릴리스 노트](https://github.com/modelcontextprotocol/python-sdk/releases/tag/v2.0.0)에서 확인할 수 있다.

### 2. `FastMCP`가 `MCPServer`로 바뀌었다

공식 SDK에 포함됐던 decorator API는 유지되지만 클래스 이름과 import 경로가 바뀌었다.

```python
# SDK v1
from mcp.server.fastmcp import FastMCP

mcp = FastMCP("demo")
```

```python
# SDK v2
from mcp.server import MCPServer

mcp = MCPServer("demo", version="1.4.0")
```

`@mcp.tool()`, `@mcp.resource()`, `@mcp.prompt()`로 등록하는 방식은 그대로다. 하지만 클래스 이름만 바꾸고 끝내면 놓치기 쉬운 차이가 있다.

- 서버 버전은 명시하지 않으면 빈 문자열이 된다. 애플리케이션 버전을 직접 넣는 편이 좋다.
- transport, host, port, transport security 같은 실행 옵션은 생성자가 아니라 `run()` 또는 `streamable_http_app()`에 둔다.
- 동기 handler는 event loop가 아니라 worker thread에서 실행된다. thread-local이나 동시성 가정을 확인해야 한다.
- Streamable HTTP 요청 본문은 기본 `4 MiB`를 넘으면 `413`으로 거부된다.
- SDK가 읽던 `MCP_*` 환경 변수는 제거됐다. 애플리케이션 설정으로 직접 관리해야 한다.

### 3. 클라이언트가 한 객체로 단순해졌다

v1에서는 transport를 열고 `ClientSession`을 만든 다음 `initialize()`를 호출했다. v2는 `Client`가 URL, stdio 프로세스, custom transport, 서버 객체를 모두 target으로 받는다.

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

서버 객체를 직접 넘기는 in-memory transport 덕분에 통합 테스트도 짧아진다. 같은 자리에 URL을 넣으면 원격 서버를 호출할 수 있다.

### 4. 반환값과 Python 의존성도 점검해야 한다

v2는 structured output을 기본 흐름으로 다룬다. 예를 들어 tool이 `int`를 반환하면 `structured_content`에서 `{"result": 5}`로 받을 수 있다. `json.dumps()`로 만든 문자열을 반환하던 서버라면, 그것은 구조화된 객체가 아니라 JSON처럼 생긴 텍스트다. 클라이언트가 필드를 사용해야 한다면 Pydantic model이나 `dict`를 반환하는 편이 낫다.

SDK 내부 HTTP 구현은 `httpx`에서 `httpx2`로 이동했다. 애플리케이션 코드가 `httpx`를 직접 import하면서 SDK의 전이 의존성에만 기대고 있었다면 v2에서 import가 실패할 수 있다. 이 경우 `httpx`를 애플리케이션의 직접 의존성으로 선언해야 한다. 애플리케이션이 자체적으로 사용하는 `httpx`를 `httpx2`로 바꾸라는 뜻은 아니다.

### 코드 검색으로 먼저 찾을 수 있는 breaking change

공식 마이그레이션 가이드의 변경 사항 가운데, 기존 저장소에서 정적 검색으로 빠르게 찾을 수 있는 항목은 다음과 같다.

| 검색할 코드 | v2에서 확인할 내용 |
|---|---|
| `.inputSchema`, `.mimeType` 같은 camelCase 속성 | Python 속성은 `.input_schema`, `.mime_type` 같은 snake_case로 변경 |
| `McpError` | `MCPError`로 이름 변경 |
| `uri.host`처럼 Pydantic `AnyUrl` API를 사용한 코드 | resource URI가 `str`로 변경 |
| `streamablehttp_client` | 제거됨. 새 `Client` 또는 지원되는 transport helper로 변경 |
| `ctx.fastmcp` | `ctx.mcp_server`로 변경 |
| 두 번째 이후 위치 인자로 만든 `FastMCP(...)` | 생성자 위치 인자 순서가 바뀌었으므로 `name` 외에는 keyword 사용 |
| `except httpx.ConnectError`와 `httpx.MockTransport` | SDK 경계에서 사용하는 타입과 예외가 `httpx2`인지 확인 |
| `sse-starlette<3` pin | SDK v2의 `sse-starlette>=3`와 충돌하는지 확인 |

특히 HTTP client 객체나 OAuth provider를 SDK에 주입한다면 `httpx`와 `httpx2`는 런타임 타입이 서로 호환되지 않는다. import가 성공해도 예외 handler나 test fixture가 더 이상 실제 SDK 오류를 잡지 못할 수 있다.

---

## 공식 SDK의 FastMCP를 사용했다면

다음 import를 쓰고 있다면 이 경로에 해당한다.

```python
from mcp.server.fastmcp import FastMCP
```

### 오늘 바로 마이그레이션하지 않는 경우

먼저 의도하지 않은 major upgrade를 막는다.

```toml
dependencies = [
  "mcp>=1.28,<2",
]
```

v1은 maintenance mode로 전환됐지만 보안 수정은 계속 제공된다. 이 pin은 영구 해결책이 아니라 마이그레이션 시간을 확보하는 안전장치다.

### v2로 옮기는 경우

최소 변경은 다음과 같다.

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

그다음 아래 항목을 순서대로 확인한다.

1. `FastMCP`, `ClientSession`, `initialize()` 사용 위치를 모두 찾는다.
2. 생성자에 넣었던 transport 옵션을 실행 시점으로 옮긴다.
3. tool의 JSON 문자열 반환을 실제 structured object로 바꿀지 결정한다.
4. `MCP_*` 환경 변수와 `httpx` 전이 의존성을 찾는다.
5. Starlette에 `streamable_http_app()`을 mount했다면 `mcp.session_manager.run()`을 애플리케이션 lifespan에 연결한다.
6. HTTP 본문 크기, 인증, 동시 요청, 취소 요청을 포함한 통합 테스트를 실행한다.
7. 구형 클라이언트와 2026 리비전 클라이언트를 같은 endpoint에서 각각 확인한다.

Starlette mount의 생명주기는 특히 빠뜨리기 쉽다.

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

세부 breaking change는 공식 [v2 마이그레이션 가이드](https://py.sdk.modelcontextprotocol.io/migration/)를 기준으로 확인해야 한다.

---

## 독립 패키지 FastMCP를 사용했다면

다음 import를 쓰고 있다면 Prefect가 관리하는 독립 패키지다.

```python
from fastmcp import FastMCP
```

2026년 7월 28일 기준 안정 버전 `fastmcp==3.4.5`는 공식 SDK에 `mcp>=1.24.0,<2.0`을 요구한다. 실제로 격리 환경에서 설치했을 때 `mcp==1.29.0`이 선택됐다. 따라서 `fastmcp`만 안정 버전으로 업데이트한 사용자가 갑자기 공식 SDK v2를 받는 경로는 아니다.

지금 취할 액션은 요구사항에 따라 다르다.

### 새 프로토콜 기능이 당장 필요하지 않다

FastMCP 3의 정확한 버전을 고정하고 그대로 운영한다.

```toml
dependencies = [
  "fastmcp==3.4.5",
]
```

이 선택은 코드 변경 위험이 낮다. 반면 2026 리비전의 stateless 요청, MRTR 같은 기능을 바로 사용하는 선택도 아니다.

### FastMCP의 개발 경험과 새 프로토콜이 모두 필요하다

FastMCP 4 안정 버전을 기다리는 것이 보수적인 선택이다. 현재 확인 가능한 FastMCP 4는 `4.0.0a2` alpha이며, 공식 SDK 최종 안정판보다 앞서 나온 `mcp==2.0.0b2`에 의존한다. production의 기본 선택으로 권하기는 이르다.

alpha를 검증 환경에서 시험한다면 버전을 정확히 고정하고, 프로토콜 호환성보다 FastMCP 자체의 API 변화까지 함께 테스트해야 한다.

### 2026 리비전이 지금 필요하다

공식 `MCPServer` v2를 직접 사용하는 경로를 검토한다. FastMCP 3의 composition, proxy, auth 같은 고수준 기능을 많이 사용 중이라면 단순 import 교체로 끝나지 않으므로 기능 목록을 먼저 비교해야 한다.

공식 SDK v1에서 독립 FastMCP 3로 옮기는 별도 경로도 있다. 기본 서버는 import 한 줄로 시작할 수 있지만 transport 설정과 prompt message type 등 차이가 있으므로 [FastMCP의 전환 가이드](https://gofastmcp.com/getting-started/upgrading/from-mcp-sdk)를 함께 봐야 한다.

---

## 실제로 확인한 호환성

문서만 요약하지 않고 Python 3.12.4의 격리 환경에서 세 경로를 확인했다.

| 검증 항목 | 결과 |
|---|---|
| `mcp==1.29.0`에서 `from mcp.server.fastmcp import FastMCP` | 성공 |
| `mcp==2.0.0`에서 같은 import | `ModuleNotFoundError` |
| `fastmcp==3.4.5` 설치 시 선택된 공식 SDK | `mcp==1.29.0` |
| 공식 SDK v2의 in-memory tool 호출 | `{'result': 5}` |
| 독립 FastMCP 3의 in-memory tool 호출 | `{'result': 5}` |

실행한 최소 예제와 exact version pin은 [companion code](https://github.com/JunHyungKang/JunHyungKang.github.io/tree/master/examples/mcp-v2-fastmcp-migration)에 공개했다.

이 검증이 production migration을 보장하지는 않는다. 인증 middleware, 외부 API client, process lifespan, proxy, long-running stream이 있는 서버는 각각 별도 통합 테스트가 필요하다. 특히 v2의 핵심 변화가 stateful 연결 가정의 제거이므로, 단일 tool 호출 성공만으로 운영 호환성을 판단하면 안 된다.

---

## 내가 지금 적용할 마이그레이션 순서

운영 중인 Python MCP 서버라면 다음 순서가 현실적이다.

1. 저장소 전체에서 `from mcp.server.fastmcp`와 `from fastmcp`를 검색한다.
2. lockfile에서 실제 설치된 `mcp`, `fastmcp` 버전을 확인한다.
3. 공식 SDK v1 경로는 우선 `<2` upper bound로 예상치 못한 배포 실패를 막는다.
4. 별도 브랜치에서 `MCPServer`와 새 `Client`로 최소 통합 테스트를 만든다.
5. 세션 상태, Starlette lifespan, 인증, 환경 변수, `httpx`, structured output을 점검한다.
6. 기존 클라이언트와 새 클라이언트를 같은 endpoint에 연결한다.
7. 관측 지표를 붙인 canary 뒤에 production pin을 v2로 변경한다.

이번 릴리스에서 중요한 것은 “v2로 빨리 올리는 것”이 아니다. 내가 어떤 FastMCP를 사용하고 있고, 서버가 연결 상태에 무엇을 기대하는지 먼저 밝히는 일이다.

참고로 이 글을 마지막으로 확인한 `2026-07-28 23:10 KST`에는 Python SDK v2 안정 버전은 공개됐지만, MCP specification 저장소에는 아직 `2026-07-28-RC`만 release로 표시되고 최종 tag는 보이지 않았다. SDK 릴리스 노트는 2026 리비전을 지원한다고 명시한다. 프로토콜 문서를 compliance 기준으로 사용한다면 [spec release 목록](https://github.com/modelcontextprotocol/modelcontextprotocol/releases)도 다시 확인하는 편이 안전하다.

## 참고 자료

- [MCP Python SDK v2.0.0 릴리스 노트](https://github.com/modelcontextprotocol/python-sdk/releases/tag/v2.0.0)
- [MCP Python SDK v2 마이그레이션 가이드](https://py.sdk.modelcontextprotocol.io/migration/)
- [MCP Python SDK v2 문서](https://py.sdk.modelcontextprotocol.io/)
- [MCP 2026-07-28 RC 개요](https://blog.modelcontextprotocol.io/posts/2026-07-28-release-candidate/)
- [FastMCP 3.4.5 의존성 선언](https://github.com/PrefectHQ/fastmcp/blob/v3.4.5/fastmcp_slim/pyproject.toml)
- [FastMCP 4.0.0a2 릴리스](https://github.com/PrefectHQ/fastmcp/releases/tag/v4.0.0a2)
