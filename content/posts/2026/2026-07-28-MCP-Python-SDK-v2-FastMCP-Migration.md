---
title: "MCP Python SDK v2가 바꾼 건 import보다 서버 운영 방식이었다"
date: "2026-07-28"
teaser: "mcp.server.fastmcp 사용자는 먼저 mcp<2로 배포를 보호해야 한다. 별도 패키지인 FastMCP 3 사용자는 서두를 이유가 없다. 그다음 SDK v2가 바꾼 운영 경계를 살펴봤다."
image: "/images/posts/2026/2026-07-28-MCP-Python-SDK-v2-FastMCP-Migration/cover.svg"
tags:
  - MCP
  - FastMCP
  - Python
  - AI Agent
  - Migration
---

## 처음에는 FastMCP 마이그레이션 글을 쓰려 했다

7월 28일 밤 [MCP Python SDK v2.0.0](https://github.com/modelcontextprotocol/python-sdk/releases/tag/v2.0.0)이 정식으로 나왔다. 처음에는 `FastMCP`가 `MCPServer`로 바뀐 부분과 import 수정 방법을 정리하려고 했다.

그런데 SDK 문서와 배포 가이드를 같이 읽고 나니 우선순위가 달라졌다. 이름 변경보다 먼저 볼 것은 서비스가 요청을 다루는 방식이었다.

`v2`라는 이름도 헷갈렸다. 프로토콜까지 최종판이 나온 줄 알았는데 아니었다. 정식으로 나온 건 Python SDK v2다. 이 SDK가 `2026-07-28` 프로토콜을 구현하지만, 내가 확인했을 때 spec 저장소의 최신 릴리스는 여전히 RC였다.

그래서 spec 전체를 설명하려 들지 않았다. 지금 이 SDK를 운영 서버에 올리면 어디서 문제가 날지만 봤다.

## FastMCP 사용자라면 import 경로부터 확인하면 된다

`FastMCP`를 쓴다고 모두 같은 대응을 하면 안 된다. Python 생태계에는 이름이 같은 `FastMCP`가 두 경로에 있다. 먼저 지금 서비스의 import를 확인해야 한다.

```python
# 공식 MCP Python SDK v1에 포함됐던 FastMCP
from mcp.server.fastmcp import FastMCP

# 별도 패키지로 배포되는 FastMCP
from fastmcp import FastMCP
```

![FastMCP import 경로에 따라 달라지는 MCP Python SDK v2 대응 방법](/images/posts/2026/2026-07-28-MCP-Python-SDK-v2-FastMCP-Migration/fastmcp-action-path.svg)

**`from mcp.server.fastmcp import FastMCP`를 쓴다면** 우선 `mcp<2`로 현재 배포를 보호해야 한다. 이 import는 SDK v2에서 사라졌다. 준비 없이 의존성 버전만 올리면 서버가 시작되지 않는다.

```toml
dependencies = [
  "mcp>=1.28,<2",
]
```

그다음 별도 작업으로 `MCPServer` 이관을 준비한다. import를 바꾸는 것보다 session에 상태를 저장했는지, 여러 worker를 쓰는지, tool 실행 중 client에 다시 요청하는 코드가 있는지 먼저 확인해야 한다.

**`from fastmcp import FastMCP`를 쓴다면** 당장 v2 코드로 바꿀 필요는 없다. 내가 확인한 FastMCP 3.4.5는 공식 SDK 의존성 범위를 `mcp>=1.24.0,<2.0`으로 제한했고, 격리 환경에서도 `mcp==1.29.0`이 설치됐다. 즉, FastMCP 3 서버가 저절로 2026 프로토콜 서버가 된 것은 아니다.

운영 중인 버전을 `fastmcp==3.4.5`처럼 정확히 고정하는 것으로 충분하다. [FastMCP의 versioning policy](https://gofastmcp.com/getting-started/installation#versioning-policy)도 운영 환경에서는 정확한 버전 고정을 권한다. FastMCP 4.0.0a2는 아직 alpha이고, 확인 시점의 [패키지 메타데이터](https://pypi.org/pypi/fastmcp-slim/4.0.0a2/json)는 최종 SDK가 아닌 `mcp==2.0.0b2`를 가리켰다. 새 프로토콜이 꼭 필요한 상황이 아니라면 기다리는 쪽이 낫다.

여기까지가 기존 FastMCP 사용자가 지금 할 일이다. 아래부터는 공식 SDK v1에서 v2로 옮기거나, 2026 프로토콜을 실제 서비스에 적용하려는 경우에 확인할 내용이다.

## 왜 import 변경보다 운영 방식을 먼저 봐야 했나

기존 session 기반 HTTP MCP에서는 client가 서버를 처음 만날 때 자신이 쓰는 프로토콜 버전과 지원 기능을 알려줬다. 서버가 돌려준 session ID는 이후 요청마다 다시 보냈다. 서버는 이 ID를 보고 “아까 연결한 client의 다음 요청”이라고 알아봤다.

2026 방식은 이 과정을 없앴다. 요청 하나에 필요한 정보를 모두 넣어 보내기 때문에 서버가 앞선 연결을 기억하지 않아도 된다. 프로토콜 문서에서는 이를 `initialize` handshake와 `Mcp-Session-Id`가 사라지고, 프로토콜 버전과 client capability가 요청의 `_meta`로 옮겨갔다고 설명한다.

![MCP 2025 계열의 session 기반 요청과 2026 계열의 sessionless 요청 비교](/images/posts/2026/2026-07-28-MCP-Python-SDK-v2-FastMCP-Migration/request-lifecycle.svg)

여기까지만 보면 “이제 MCP 서버는 stateless다”라고 요약하기 쉽다. 운영에서는 그렇게 단순하지 않았다.

## sessionless는 무상태 서비스가 됐다는 뜻이 아니다

2026 client가 보내는 Streamable HTTP 요청은 특정 worker에 묶이지 않는다. 첫 요청을 worker A가 받고 다음 요청을 worker B가 받아도 프로토콜 session 때문에 실패하지 않는다. `stateless_http=True`를 켜서 얻는 효과가 아니다. 2026 경로 자체가 그렇게 동작한다.

tool의 업무 상태까지 저절로 사라지는 것은 아니다. 이전 요청의 결과를 process memory에 넣어두고 다음 요청에서 꺼내는 코드라면 여전히 외부 저장소나 명시적인 상태 키가 필요하다. `sessionless`가 없애는 것은 MCP session affinity다. 장바구니나 승인 대기, 작업 진행 상태까지 없애 주지는 않는다.

lifespan의 의미도 달라졌다. v2의 Streamable HTTP lifespan은 서버 시작 때 한 번 실행되고 모든 session과 요청이 같은 값을 공유한다. DB pool이나 공용 HTTP client에는 자연스러운 구조다. 반대로 v1에서 lifespan에 넣어둔 per-session resource가 있다면 사용자 간 상태가 섞이지 않는지 확인해야 한다.

## 같은 endpoint에 두 시대의 client가 들어온다

v2 `MCPServer`는 한 endpoint에서 2026 client와 2025 계열 client를 모두 받는다. 새 `Client`는 `server/discover`를 먼저 시도하고 구형 서버라면 기존 handshake로 돌아간다.

문장만 읽어서는 얼마나 자동으로 처리되는지 감이 오지 않았다. 그래서 Python 3.12.4와 `mcp==2.0.0`으로 실제 Streamable HTTP endpoint를 하나 띄우고, 두 client를 동시에 연결했다. Uvicorn을 시작하고 종료하는 부분까지 포함한 코드는 [실행 파일](https://github.com/JunHyungKang/JunHyungKang.github.io/blob/master/examples/mcp-v2-fastmcp-migration/dual_protocol_http.py)에 뒀다.

```python
from mcp import Client
from mcp.server import MCPServer

URL = "http://127.0.0.1:8765/mcp"
mcp = MCPServer("dual-era-check", version="1.0.0")


@mcp.tool()
def identify() -> str:
    return "same handler"


# mcp.streamable_http_app()을 URL에 띄운 뒤 실행
async with (
    Client(URL, mode="legacy") as legacy,
    Client(URL) as modern,
):
    for label, client in (("legacy", legacy), ("modern", modern)):
        result = await client.call_tool("identify", {})
        print(
            f"{label}: {client.protocol_version}"
            f" -> {result.structured_content}"
        )
```

`mode="legacy"`는 이전 방식의 handshake를 강제로 사용한다. 아무 옵션도 주지 않은 `Client(URL)`은 새 방식으로 접속한다. 같은 endpoint와 같은 `identify` handler를 호출한 결과는 이랬다.

```text
legacy: 2025-11-25 -> {'result': 'same handler'}
modern: 2026-07-28 -> {'result': 'same handler'}
```

구형 서버로 돌아가는 경로도 따로 확인했다. `mcp==1.29.0` [서버](https://github.com/JunHyungKang/JunHyungKang.github.io/blob/master/examples/mcp-v2-fastmcp-migration/legacy_sdk_v1_server.py)를 띄우고 기본 설정의 v2 [client](https://github.com/JunHyungKang/JunHyungKang.github.io/blob/master/examples/mcp-v2-fastmcp-migration/v2_client_fallback.py)를 연결했다. 서버는 첫 `server/discover` 요청을 거절했고, client는 곧바로 기존 handshake를 다시 시도했다.

```text
auto fallback: 2025-11-25 -> {'result': 'legacy server'}
```

여기까지 돌리고 나니 “한 서버가 두 시대를 받는다”는 말의 범위가 분명해졌다. tool 코드는 나뉘지 않는다. 어느 경로를 탔는지는 연결할 때 협상된 `client.protocol_version`에서 확인할 수 있다.

구형 client를 한 번에 끊지 않아도 된다는 건 좋다. 대신 운영 환경도 단번에 2026 방식으로 바뀌지는 않는다. 구형 client는 여전히 `Mcp-Session-Id`를 사용한다. 여러 worker에 나눠 배포했다면 기존 sticky session이나 `stateless_http=True` 설정이 계속 영향을 준다.

그래서 SDK를 올렸다는 이유만으로 load balancer의 stickiness를 바로 제거하면 안 된다. 실제 트래픽에서 협상된 protocol version 비율을 먼저 봐야 한다. 구형 client가 남아 있는 동안에는 한 서비스 안에 session 기반 경로와 sessionless 경로가 같이 존재한다.

## tool 실행 중 사용자에게 다시 묻는 방식이 달라졌다

MCP의 평소 요청은 단순하다. ChatGPT나 IDE 같은 client가 MCP server의 tool을 호출하고, 서버가 결과를 돌려준다. 그런데 tool이 한 번에 끝나지 않는 경우가 있다. 파일을 지우기 전에 사용자 확인을 받아야 하거나, 작업할 폴더를 client에게 물어봐야 할 때다.

MCP는 이런 역방향 질문에도 이름을 붙여뒀다. 사용자에게 확인창이나 입력 폼을 보여달라는 요청은 `elicitation`, client가 쓰는 LLM에 생성을 부탁하는 것은 `sampling`, client가 열어둔 작업 폴더를 묻는 것은 `roots/list`다. 여기서 client는 단순한 HTTP 호출자가 아니라 사용자 화면과 LLM, 로컬 작업 공간을 가진 ChatGPT·Claude Desktop·IDE 같은 host를 뜻한다.

2025 계열에서는 server가 tool 호출을 처리하던 연결을 그대로 붙잡고 client에 다시 요청을 보냈다. 예를 들어 `delete_files`를 호출받은 server가 작업을 잠시 멈춘 뒤 “정말 삭제할까요?”라는 `elicitation/create` 요청을 거꾸로 보낸다. client가 사용자 답을 돌려주면 server가 삭제를 마치고 처음 tool 호출의 최종 결과를 반환한다. 문서에서 말하는 server-initiated request나 back-channel이 이 흐름이다.

2026 방식에는 이 역방향 요청 통로가 없다. server는 질문이 필요하다는 `input_required` 결과를 일단 반환한다. client가 사용자 답을 받은 뒤, 그 답을 붙여 같은 tool을 다시 호출한다. SDK를 쓰는 쪽에서는 한 번의 `call_tool()`처럼 보일 수 있지만 실제 통신은 여러 차례 오간다. 그래서 이름도 multi-round-trip이다.

![MCP 2025 계열의 역방향 요청과 2026 계열의 multi-round-trip 비교](/images/posts/2026/2026-07-28-MCP-Python-SDK-v2-FastMCP-Migration/multi-round-trip.svg)

정확히 말하면 2026에서 `elicitation`, `sampling`, `roots` 기능이 사라진 것은 아니다. server가 독립적인 JSON-RPC 요청을 client에 바로 보내는 push 방식이 사라졌다. Python SDK의 `Resolve`를 사용하면 같은 tool 코드가 구형 client에는 기존 back-channel을, 2026 client에는 multi-round-trip을 사용한다. 다만 `sampling`과 `roots`는 2026 specification에서 deprecated 상태다. 새 서비스라면 이 기능을 전제로 설계하지 않는 편이 낫다.

운영에서 중요한 차이는 처음 받은 tool 요청이 같은 process 안에서 답을 기다리며 계속 살아 있지 않는다는 점이다. 첫 호출과 답을 담은 재호출이 서로 다른 replica로 갈 수 있고, 그 사이 server가 재시작될 수도 있다. `MCPServer`가 왕복 상태를 담은 `request_state`를 보호해 주지만 기본 key는 process마다 다르다. 여러 worker나 instance를 쓴다면 모든 server가 같은 `RequestStateSecurity` key와 audience 설정을 사용해야 한다. 결제나 삭제처럼 부수 효과가 있는 동작은 답이 모두 모인 마지막 round에서 한 번만 실행되는지도 확인해야 한다.

## 알림을 쓰는 서비스라면 공용 bus가 필요하다

2026 경로에서는 기존 HTTP GET stream과 `resources/subscribe` 대신 `subscriptions/listen`을 쓴다. client는 받고 싶은 알림 종류를 지정해 하나의 긴 stream을 연다.

이 stream은 어느 한 replica에 연결된다. 다른 replica에서 `notify_resource_updated()`를 호출해도 process 내부 bus만으로는 알림이 건너가지 않는다. 여러 process나 pod에서 알림을 제공하려면 Redis나 NATS 같은 기존 pub/sub 위에 공용 `SubscriptionBus` 구현을 붙여야 한다.

현재 SDK의 subscription stream은 replay나 resume을 제공하지 않는다. 연결이 끊기면 client가 다시 listen하고 최신 상태를 조회해야 한다. 이 복구 절차까지 client와 맞춰 둬야 한다.

## 배포 경계에서 드러나는 변화도 있다

`streamable_http_app()`은 별도 설정이 없으면 localhost만 허용한다. 실제 hostname 뒤에 배포하려면 `TransportSecuritySettings`에 허용할 Host와 Origin을 넣어야 한다. v1 생성자에 있던 transport 설정을 v2의 `run()`이나 app builder로 옮기다가 이 값을 빼먹으면, 애플리케이션은 뜨지만 외부 요청은 `421`로 막힌다.

SDK 내부 HTTP client가 `httpx2`로 바뀐 영향도 import 에러로만 끝나지 않는다. `httpx2`는 OS trust store로 인증서를 검증한다. system CA가 없는 작은 container나 private CA를 쓰는 환경은 TLS handshake부터 확인해야 한다. Streamable HTTP request body가 4 MiB를 넘으면 이제 `413`을 돌려준다는 제한도 생겼다.

OAuth를 붙인 서비스라면 authorization code와 함께 돌아온 issuer 검증까지 포함해 redirect부터 token exchange까지 다시 통과시켜 보는 게 낫다. 이 세 가지는 unit test보다 staging의 실제 hostname과 인증서, 운영에 가까운 payload에서 먼저 드러난다.

## 2026 프로토콜까지 옮긴다면 해야 할 일

![MCP Python SDK v2 전환 전에 확인할 서비스 수준 작업 네 가지](/images/posts/2026/2026-07-28-MCP-Python-SDK-v2-FastMCP-Migration/service-action-plan.svg)

**운영 트래픽부터 확인한다.** 어떤 client가 어떤 protocol version으로 접속하는지, legacy session이 얼마나 남아 있는지 기록한다. 이 수치가 sticky session을 유지할 기간과 rollback 범위를 결정한다.

**상태와 역방향 호출을 찾는다.** process memory, session별 lifespan resource, `ctx.elicit()`, sampling, roots, resource subscription을 검색한다. 코드 줄 수보다 이 항목들이 서비스 전환 비용을 더 잘 보여준다.

**현재 배포를 먼저 보호한다.** 공식 SDK v1의 `mcp.server.fastmcp`를 쓰고 있다면 `mcp<2` 상한을 둔다. standalone FastMCP 3라면 정확한 버전을 고정한다. lockfile만 믿지 말고 직접 dependency 범위도 적어 둔다. staging에서는 실제 Host와 Origin, CA, 최대 payload, OAuth callback을 한 번씩 통과시킨다.

**두 시대를 같은 endpoint에서 검증한다.** 적어도 아래 네 경로는 통합 테스트로 남기겠다.

- 2025 client가 initialize 후 두 번째 요청까지 정상 처리되는가
- 2026 client의 연속 요청을 서로 다른 replica가 처리해도 되는가
- multi-round-trip의 재시도가 다른 replica나 재시작 뒤에도 이어지는가
- replica A가 연 subscription에 replica B의 변경 알림이 도착하는가

이 테스트를 통과한 뒤 canary에서 protocol version별 오류율과 latency를 나눠 본다. 구형 client 비율이 충분히 낮아진 뒤에야 legacy session 운영 비용을 걷어낼 수 있다.

## 코드 수정은 서비스 판단 다음이다

공식 SDK v1에서 v2로 옮기기로 했다면 `FastMCP`를 `MCPServer`로 바꾸는 작업 자체는 크지 않을 수 있다. decorator API도 대부분 유지된다. 깨지는 곳은 그 주변이었다. transport 설정은 생성자에서 `run()`이나 `streamable_http_app()`으로 옮겨갔다. `httpx`는 `httpx2`로 바뀌었다. Starlette에 mount했다면 lifespan도 직접 열어야 한다.

나는 Python 3.12.4 격리 환경을 세 개 만들어 import와 가장 작은 tool 호출부터 확인했다.

```text
mcp==1.29.0    mcp.server.fastmcp  → import 성공
mcp==2.0.0     mcp.server.fastmcp  → 모듈 없음
fastmcp==3.4.5 의존성 해석 결과   → mcp==1.29.0

공식 SDK v2 tool 호출              → {'result': 5}
FastMCP 3 tool 호출                → {'result': 5}
```

이 테스트는 코드 경로가 맞다는 증거일 뿐 운영 호환성을 보장하지 않는다. 인증, 여러 worker, 재시작, long-lived stream이 붙은 서비스라면 앞의 네 가지 통합 테스트가 더 중요하다. 실행 파일과 version pin은 [재현 코드](https://github.com/JunHyungKang/JunHyungKang.github.io/tree/master/examples/mcp-v2-fastmcp-migration)에 넣었다.

정리하고 보니 내 결론은 단순했다. 이번 업데이트는 dependency bump가 아니다. 공식 SDK v1 사용자는 우선 `<2`로 배포를 보호한 뒤 서비스의 session과 상태 사용을 확인해야 한다. FastMCP 3 사용자는 급히 코드를 바꿀 이유는 없다. 다만 지금 상태가 2026 protocol을 도입한 것은 아니다.

내가 운영 서버를 맡고 있다면 새 기능보다 먼저 두 시대의 client가 같은 endpoint를 통과하는지 확인하겠다. import 변경은 그다음이다.

> **2026-07-29 00:15 KST에 다시 확인했다.**
> Python SDK `v2.0.0`은 stable이고 spec 저장소의 최신 릴리스는 여전히 `2026-07-28-RC`였다. final tag가 올라오면 이 글도 다시 대조할 예정이다.

## 참고한 문서

- [MCP Python SDK v2.0.0 릴리스 노트](https://github.com/modelcontextprotocol/python-sdk/releases/tag/v2.0.0)
- [MCP Python SDK v2에서 달라진 점](https://py.sdk.modelcontextprotocol.io/whats-new/)
- [MCP Python SDK v2에서 구형 client 함께 제공하기](https://py.sdk.modelcontextprotocol.io/run/legacy-clients/)
- [MCP Python SDK v2 multi-round-trip 요청](https://py.sdk.modelcontextprotocol.io/handlers/multi-round-trip/)
- [MCP Python SDK v2 sampling과 roots](https://py.sdk.modelcontextprotocol.io/handlers/sampling-and-roots/)
- [MCP Python SDK v2 배포와 확장 가이드](https://py.sdk.modelcontextprotocol.io/run/deploy/)
- [MCP Python SDK v2 마이그레이션 가이드](https://py.sdk.modelcontextprotocol.io/migration/)
- [MCP specification 릴리스 목록](https://github.com/modelcontextprotocol/modelcontextprotocol/releases)
- [FastMCP versioning policy](https://gofastmcp.com/getting-started/installation#versioning-policy)
- [FastMCP 3.4.5 dependency](https://github.com/PrefectHQ/fastmcp/blob/v3.4.5/fastmcp_slim/pyproject.toml)
