---
title: "MCP Python SDK v2가 바꾼 건 import보다 서버 운영 방식이었다"
date: "2026-07-28"
teaser: "2026 client 요청에는 session이 없지만 구형 client는 여전히 session을 쓴다. 기존 운영 환경에서 무엇을 남기고 무엇을 바꿔야 하는지 확인했다."
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

구형 client를 한 번에 끊지 않아도 된다는 건 좋다. 대신 운영 환경도 단번에 2026 방식으로 바뀌지는 않는다. 구형 client는 여전히 `Mcp-Session-Id`를 사용한다. 여러 worker에 나눠 배포했다면 기존 sticky session이나 `stateless_http=True` 설정이 계속 영향을 준다.

그래서 SDK를 올렸다는 이유만으로 load balancer의 stickiness를 바로 제거하면 안 된다. 실제 트래픽에서 협상된 protocol version 비율을 먼저 봐야 한다. 구형 client가 남아 있는 동안에는 한 서비스 안에 session 기반 경로와 sessionless 경로가 같이 존재한다.

## 요청 도중 client를 호출하던 흐름은 다시 설계해야 한다

2026 경로에서는 서버가 client로 요청을 밀어낼 수 없다. 기존의 push elicitation, sampling, `roots/list` 같은 server-initiated request는 이 경로에서 동작하지 않는다.

대신 tool이 질문을 결과로 돌려준다. client가 답을 붙여 다시 호출하는 multi-round-trip 방식이다. SDK의 `Resolve`를 쓰면 같은 tool이 구형 client에는 기존 elicitation을 쓰고 2026 client에는 새 round trip을 쓴다.

호출 방향만 바뀐 것이 아니다. 사용자 확인을 기다리는 동안 요청이 끊겼다가 재개될 수 있다. 재시도는 다른 replica로 갈 수도 있다. 여러 worker를 쓴다면 모든 instance가 같은 `request_state` key를 써야 한다. server name도 맞추거나 명시적인 audience를 공유해야 한다. 결제나 삭제, 승인처럼 부수 효과가 있는 tool은 최종 round에서 딱 한 번 실행되는지 따로 검증하겠다.

## 알림을 쓰는 서비스라면 공용 bus가 필요하다

2026 경로에서는 기존 HTTP GET stream과 `resources/subscribe` 대신 `subscriptions/listen`을 쓴다. client는 받고 싶은 알림 종류를 지정해 하나의 긴 stream을 연다.

이 stream은 어느 한 replica에 연결된다. 다른 replica에서 `notify_resource_updated()`를 호출해도 process 내부 bus만으로는 알림이 건너가지 않는다. 여러 process나 pod에서 알림을 제공하려면 Redis나 NATS 같은 기존 pub/sub 위에 공용 `SubscriptionBus` 구현을 붙여야 한다.

현재 SDK의 subscription stream은 replay나 resume을 제공하지 않는다. 연결이 끊기면 client가 다시 listen하고 최신 상태를 조회해야 한다. 이 복구 절차까지 client와 맞춰 둬야 한다.

## 배포 경계에서 드러나는 변화도 있다

`streamable_http_app()`은 별도 설정이 없으면 localhost만 허용한다. 실제 hostname 뒤에 배포하려면 `TransportSecuritySettings`에 허용할 Host와 Origin을 넣어야 한다. v1 생성자에 있던 transport 설정을 v2의 `run()`이나 app builder로 옮기다가 이 값을 빼먹으면, 애플리케이션은 뜨지만 외부 요청은 `421`로 막힌다.

SDK 내부 HTTP client가 `httpx2`로 바뀐 영향도 import 에러로만 끝나지 않는다. `httpx2`는 OS trust store로 인증서를 검증한다. system CA가 없는 작은 container나 private CA를 쓰는 환경은 TLS handshake부터 확인해야 한다. Streamable HTTP request body가 4 MiB를 넘으면 이제 `413`을 돌려준다는 제한도 생겼다.

OAuth를 붙인 서비스라면 authorization code와 함께 돌아온 issuer 검증까지 포함해 redirect부터 token exchange까지 다시 통과시켜 보는 게 낫다. 이 세 가지는 unit test보다 staging의 실제 hostname과 인증서, 운영에 가까운 payload에서 먼저 드러난다.

## 그래서 지금 해야 할 일

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

## FastMCP 사용자에게는 즉시 할 일이 다르다

Python 생태계에는 `FastMCP`라는 이름이 두 경로에 있다.

```python
# 공식 MCP Python SDK v1에 포함됐던 FastMCP
from mcp.server.fastmcp import FastMCP

# 별도 패키지로 배포되는 FastMCP
from fastmcp import FastMCP
```

![FastMCP import 경로에 따라 달라지는 MCP Python SDK v2 대응 방법](/images/posts/2026/2026-07-28-MCP-Python-SDK-v2-FastMCP-Migration/fastmcp-action-path.svg)

첫 번째 경로는 v2에서 사라졌다. 아직 이 import를 쓰는 서비스라면 먼저 아래처럼 현재 배포를 보호하고, 별도 변경으로 `MCPServer` 이관을 준비해야 한다.

```toml
dependencies = [
  "mcp>=1.28,<2",
]
```

두 번째 경로인 standalone FastMCP 3는 당장 깨지는 쪽이 아니다. FastMCP 3.4.5는 공식 SDK dependency를 `mcp>=1.24.0,<2.0`으로 제한한다. 격리 환경에서 설치했을 때도 `mcp==1.29.0`이 잡혔다. 즉, FastMCP 3 서버가 어느 날 자동으로 2026 protocol 서버가 된 것은 아니다.

운영 중이라면 `fastmcp==3.4.5`처럼 정확한 버전을 고정하겠다. [FastMCP의 versioning policy](https://gofastmcp.com/getting-started/installation#versioning-policy)도 production에서는 exact pin을 권한다. 새 프로토콜이 정말 필요해졌을 때 이관 경로를 골라도 늦지 않다. FastMCP 4.0.0a2는 아직 alpha다. 확인 시점의 [패키지 메타데이터](https://pypi.org/pypi/fastmcp-slim/4.0.0a2/json)는 최종 SDK가 아닌 `mcp==2.0.0b2`를 가리켰다. production 전환 대상으로 보기에는 이르다.

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
- [MCP Python SDK v2 배포와 확장 가이드](https://py.sdk.modelcontextprotocol.io/run/deploy/)
- [MCP Python SDK v2 마이그레이션 가이드](https://py.sdk.modelcontextprotocol.io/migration/)
- [MCP specification 릴리스 목록](https://github.com/modelcontextprotocol/modelcontextprotocol/releases)
- [FastMCP versioning policy](https://gofastmcp.com/getting-started/installation#versioning-policy)
- [FastMCP 3.4.5 dependency](https://github.com/PrefectHQ/fastmcp/blob/v3.4.5/fastmcp_slim/pyproject.toml)
