---
title: "사용자 승인을 회수했지만 A2A Task는 계속 실행됐다"
date: "2026-07-31"
teaser: "공식 A2A Python SDK 1.1.2로 승인 회수 뒤 실행 중인 Task를 확인했다. 별도 CancelTask나 쓰기 직전 재확인이 없으면 Task는 완료됐고 모의 ERP에 주문 기록도 남았다."
image: "/images/posts/2026/2026-07-31-A2A-Agent-Delegation-Authorization/cover.svg"
contentType: "구현 검토"
evidence: "A2A Protocol v1.0의 JSON-RPC binding과 공식 Python SDK 1.1.2로 비동기 Task를 실행하고 승인 회수와 CancelTask가 서로 다른 경로임을 검증했습니다."
tags:
  - AI Agent
  - A2A
  - Authorization
  - Task Lifecycle
  - Multi-Agent
---

## 승인을 회수했는데 주문 기록이 남았다

A2A를 실제 서비스에 적용할 때 Agent Card를 읽고 요청을 주고받는 것만으로는 부족하다. Task 실행 중 사용자가 승인을 회수했을 때 작업을 어떻게 멈출지, 이미 외부 시스템에 반영됐다면 어떻게 되돌릴지도 정해야 한다.

승인 회수 뒤 Task가 자동으로 취소되는지 공식 SDK로 직접 확인했다. 7월 22일 PyPI에 배포된 [`a2a-sdk 1.1.2`](https://pypi.org/project/a2a-sdk/1.1.2/)로 개인 Agent 역할의 A2A 클라이언트와 구매 Agent를 연결했다. 구매 Agent는 요청을 받아 모의 ERP에 주문을 기록한다. 주문 Task가 `WORKING`에 들어간 직후 사용자의 승인을 회수하고 세 가지 처리를 비교했다.

| 승인 회수 뒤 처리 | `execute()` 취소 | `cancel()` 호출 | Task 최종 상태 | 모의 ERP 주문 |
| --- | --- | --- | --- | --- |
| 추가 처리 없음 | 아니요 | 아니요 | `TASK_STATE_COMPLETED` | `ORDER_CREATED` |
| `CancelTask` 전송 | `CancelledError` 확인 | 예 | `TASK_STATE_CANCELED` | 생성되지 않음 |
| 모의 ERP 쓰기 직전에 승인 재확인 | 아니요 | 아니요 | `TASK_STATE_REJECTED` | 생성되지 않음 |

승인 상태만 `REVOKED`로 바꾼 첫 실행에서는 Task가 `COMPLETED`로 끝났고 모의 ERP에 주문 기록도 남았다. 승인 회수와 실행 중인 Task 취소가 자동으로 이어지지 않았기 때문이다.

[A2A Protocol v1.0](https://github.com/a2aproject/A2A/releases/tag/v1.0.0)은 2026년 3월 12일 정식 릴리스됐다. 이 글과 직접 관련된 변화는 `SendMessageConfiguration.return_immediately`가 추가되고 `CancelTask`의 상태 전이가 명확해진 점이다.

프로토콜 v1.0과 Python SDK v1.0은 같은 버전 번호지만 릴리스가 다르다. 공식 Python SDK의 v1.0.0은 [4월 20일 공개](https://github.com/a2aproject/a2a-python/releases/tag/v1.0.0)됐고 이 글은 이후 버그 수정이 반영된 패키지 1.1.2를 사용했다.

`CancelTask`는 프로토콜 v1.0에서 처음 생긴 기능이 아니다. v0.3의 JSON-RPC method `tasks/cancel`이 v1.0 operation `CancelTask`로 이름을 바꿨다. v1.0은 같은 operation을 JSON-RPC와 gRPC의 `CancelTask`, HTTP/REST의 `POST /tasks/{id}:cancel`로 [각각 매핑](https://github.com/a2aproject/A2A/blob/v1.0.0/docs/specification.md#L1159-L1172)한다. [v1.0 변경 문서](https://github.com/a2aproject/A2A/blob/v1.0.0/docs/whats-new-v1.md#L102-L113)는 취소할 수 있는 상태와 상태 전이가 더 명확해졌다고 설명한다. 명세가 보장하는 것은 “서버가 취소를 시도하고 갱신된 Task를 반환한다”는 데까지다. 성공은 보장되지 않는다.

최근 공개된 구현 자료는 주로 호출 시점의 권한을 다룬다. AWS가 7월 1일 공개한 [A2A Gateway 예제](https://aws.amazon.com/blogs/machine-learning/building-a-serverless-a2a-gateway-for-agent-discovery-routing-and-access-control/)는 JWT scope로 접근할 수 있는 Agent를 제한한다. 7월 9일 업데이트된 Microsoft Foundry의 [A2A 인증 문서](https://learn.microsoft.com/en-us/azure/foundry/agents/concepts/agent-to-agent-authentication)는 하나의 Agent identity를 공유하는 방식과 사용자별 OAuth 권한을 넘기는 방식을 구분한다.

이번 실험에서는 두 Agent 사이의 호출 권한을 정상으로 두고 호출이 시작된 뒤 승인 상태가 바뀌는 경우를 봤다. 사용자가 구매 승인을 회수하면 이미 실행 중인 A2A Task도 멈출까. A2A는 서비스의 승인 저장소를 모르기 때문에 승인 회수를 `CancelTask`로 바꿔 보내지 않는다.

[A2A v1.0의 in-task authorization](https://github.com/a2aproject/A2A/blob/v1.0.0/docs/specification.md#L1884-L1938)은 사람의 승인이나 credential이 더 필요한 Agent가 Task를 `TASK_STATE_AUTH_REQUIRED`로 전환하는 흐름을 정의한다. 이 값은 승인 객체 자체가 아니라 Task가 authorization을 기다리고 있다는 실행 상태다.

이번 실험에서 `ApprovalGrant`는 서비스가 별도로 저장한 승인 정보다. Task는 이미 승인을 받아 실행을 시작한 상태였고, 그 뒤 `ApprovalGrant`를 회수했다. A2A 명세는 이 승인 정보의 식별자와 유효 기간, 회수 이벤트나 외부 변경과의 연결을 데이터 모델로 정하지 않는다. 확인하려던 것은 승인 정보가 `REVOKED`로 바뀌었을 때 실행 중인 Task와 모의 ERP 쓰기가 자동으로 중단되는지였다.

![승인과 A2A Task의 수명이 어긋나는 구간](/images/posts/2026/2026-07-31-A2A-Agent-Delegation-Authorization/task-lifecycle.svg)

테스트는 Python 3.12.4에서 실행했다. Agent Card에는 `protocol_binding="JSONRPC"`, `protocol_version="1.0"`을 넣었다. 서버는 `DefaultRequestHandler`와 `InMemoryTaskStore`로 구성했다. SDK 1.1.2에서 `DefaultRequestHandler`는 [`DefaultRequestHandlerV2`의 alias](https://github.com/a2aproject/a2a-python/blob/v1.1.2/src/a2a/server/request_handlers/__init__.py#L46)다. 승인 저장소와 ERP 쓰기는 메모리로 단순화했고 실제 ERP API 대신 `ORDER_CREATED`를 기록했다.

전체 코드는 [`examples/a2a-v1-revocation-lifecycle`](https://github.com/JunHyungKang/JunHyungKang.github.io/tree/master/examples/a2a-v1-revocation-lifecycle)에 두었다.

스크립트는 표의 Task 상태와 외부 변경, `CancelledError`, `cancel()` 호출 여부를 각각 검증한다. 하나라도 기대값과 다르면 `AssertionError`로 종료한다.

## `return_immediately`는 응답만 먼저 돌려준다

A2A v1.0의 `SendMessage`는 바로 답할 수 있는 요청에는 `Message`를 반환한다. 시간이 걸리는 작업에는 상태를 추적할 `Task`를 반환할 수 있다. `Task`가 반환됐다고 작업이 끝난 것은 아니다.

[v1.0 명세의 non-blocking mode](https://github.com/a2aproject/A2A/blob/v1.0.0/docs/specification.md#L440-L456)는 `return_immediately=true`일 때 Task를 만든 직후 현재 상태를 반환하도록 한다. 이후 상태는 `GetTask`, subscription, push notification 중 하나로 추적해야 한다. 공식 Python SDK에서는 다음처럼 요청한다.

```py
request = SendMessageRequest(
    message=new_text_message(
        "30만 원 이하 SaaS 갱신 주문",
        role=Role.ROLE_USER,
    ),
    configuration=SendMessageConfiguration(return_immediately=True),
)

events = client.send_message(request)
first_event = await events.__anext__()
task_id = first_event.task.id

# 권한 서버에서 승인을 회수했다고 가정한다.
grant.revoke()

task = await wait_for_terminal_task(client, task_id)
```

SDK 1.1.2의 `DefaultRequestHandlerV2.on_message_send()`는 첫 `Task`를 받으면 subscriber loop를 빠져나온다. 소스에도 [`AgentExecutor will continue to run in the background`](https://github.com/a2aproject/a2a-python/blob/v1.1.2/src/a2a/server/request_handlers/default_request_handler_v2.py#L250-L273)라고 적혀 있다. 클라이언트가 `task_id`를 받은 시점에는 서버의 `execute()`가 끝나지 않았다.

비교를 위해 모의 ERP 쓰기 직전의 재확인을 옵션으로 뒀다.

```py
async def execute(self, context, event_queue):
    task = new_task_from_user_message(context.message)
    task.status.state = TaskState.TASK_STATE_WORKING
    await event_queue.enqueue_event(task)

    updater = TaskUpdater(
        event_queue=event_queue,
        task_id=task.id,
        context_id=task.context_id,
    )

    if not self.grant.active:
        await updater.reject(
            new_text_message("approval already revoked")
        )
        return

    try:
        await asyncio.sleep(0.4)  # downstream 작업

        if self.recheck_before_write and not self.grant.active:
            await updater.reject(
                new_text_message("approval revoked before ERP write")
            )
            return

        self.side_effects.append("ORDER_CREATED")
        await updater.complete(
            new_text_message("purchase completed")
        )
    except asyncio.CancelledError:
        self.execute_cancelled = True
        raise
```

`grant.revoke()`는 승인 저장소의 상태만 바꾼다. 실행 중인 `execute()`에 취소 신호를 보내지 않는다. 그래서 시작할 때만 승인 상태를 본 구현은 그대로 주문을 만들었다.

반면 모의 ERP 쓰기 직전에 승인 상태를 다시 본 구현은 `TASK_STATE_REJECTED`로 끝났다. 이 비교에서는 `execute()`가 취소된 것이 아니다. Agent 코드가 바뀐 승인 상태를 읽고 스스로 쓰기를 거절했다.

## 승인 회수와 Task 취소는 같은 동작이 아니다

[A2A v1.0의 `CancelTask`](https://github.com/a2aproject/A2A/blob/v1.0.0/docs/specification.md#L266-L285)는 취소 성공을 보장하지 않는다. 명세는 서버가 취소를 시도한다고 표현한다. Python 코루틴을 어떤 순서로 멈출지, 외부 시스템 호출을 어떻게 중단할지는 SDK와 Agent 구현의 몫이다.

클라이언트 호출은 다음 한 줄이다.

```py
from a2a.types import CancelTaskRequest

await client.cancel_task(
    CancelTaskRequest(id=task_id)
)
```

그 뒤의 동작은 Python SDK 1.1.2 소스에서 확인했다.

```text
CancelTask
  → DefaultRequestHandlerV2.on_cancel_task()
  → ActiveTask.cancel()
      1. _producer_task.cancel()
      2. AgentExecutor.cancel()
      3. ActiveTask의 _is_finished까지 대기
  → 갱신된 Task 반환
```

실제 [`ActiveTask.cancel()` 구현](https://github.com/a2aproject/a2a-python/blob/v1.1.2/src/a2a/server/agent_execution/active_task.py#L707-L756)은 `_producer_task.cancel()`을 호출한 뒤 `AgentExecutor.cancel()`을 실행한다. `asyncio.Task.cancel()`은 즉시 강제 종료하는 API가 아니다. [Python 3.12 문서](https://docs.python.org/3.12/library/asyncio-task.html#asyncio.Task.cancel)에 적힌 대로 다음 실행 기회에 `CancelledError`가 들어가도록 예약한다. 코루틴이 취소를 삼키거나 이벤트 루프에 제어권을 돌려주지 않으면 바로 멈춘다고 보장할 수 없다.

`AgentExecutor.cancel()`도 애플리케이션이 구현한다. SDK의 [interface contract](https://github.com/a2aproject/a2a-python/blob/v1.1.2/src/a2a/server/agent_execution/agent_executor.py#L51-L77)는 취소를 시도하고 `TASK_STATE_CANCELED` 상태 이벤트를 발행하라고 안내한다. 이 실험에서는 `TaskUpdater.cancel()`로 그 이벤트를 남겼다.

```py
async def cancel(self, context, event_queue):
    updater = TaskUpdater(
        event_queue=event_queue,
        task_id=context.task_id,
        context_id=context.context_id,
    )
    await updater.cancel(
        new_text_message("A2A CancelTask received")
    )
```

두 번째 실행 로그에서 `execute_cancelled=TRUE`, `cancel_hook_called=TRUE`를 함께 확인했다. `TASK_STATE_CANCELED`만 본 것이 아니라 SDK가 producer에 취소 신호를 보냈고 Agent의 취소 훅까지 실행했다는 뜻이다.

승인을 회수했다고 A2A 클라이언트가 실행 중인 `task_id`를 찾아 주지는 않는다. Task를 멈추려면 승인과 `task_id`의 관계를 서비스가 기록해 두고 `CancelTask`를 별도로 보내야 한다.

취소 요청을 보냈다고 항상 멈추는 것도 아니다. v1.0 명세는 이미 끝났거나 현재 단계에서 취소할 수 없는 Task에 `TaskNotCancelableError`를 반환할 수 있도록 정의한다.

공식 [Hello World 예제의 `cancel()`](https://github.com/a2aproject/a2a-samples/blob/e580a885a73e689eb448c377789b3a65e97b6c0d/samples/python/agents/helloworld/agent_executor.py#L77-L80)도 `NotImplementedError`를 던진다. SDK를 설치했다고 Agent별 취소 처리가 생기는 것은 아니다. 외부 job ID가 있다면 `cancel()`에서 해당 시스템의 취소 API를 호출하고 그 결과에 맞춰 Task 상태를 남겨야 한다.

ERP에 주문이 이미 저장됐다면 취소의 의미가 또 달라진다. `TASK_STATE_CANCELED`로 바꿔도 주문은 남아 있다. 주문 취소나 환불처럼 이미 반영된 결과를 되돌리는 작업이 따로 필요하다.

| 제어 | 지키려는 것 | 보장하지 않는 것 |
| --- | --- | --- |
| 승인 회수 | 이후 요청의 권한 차단 | 실행 중인 A2A Task 중단 |
| `CancelTask` | 불필요한 실행을 빨리 멈춤 | 이미 반영된 외부 변경의 원복 |
| 쓰기 직전 권한 검사 | 승인 없는 외부 변경 차단 | 서로 다른 시스템 사이의 원자성 |
| 보상 작업 | 이미 반영된 변경을 업무적으로 되돌림 | 원래 실행 이력 삭제 |

`CancelTask`는 실행을 중단시키는 Task 수명주기 제어다. 승인 없는 주문이 생기지 않아야 한다는 안전 불변식은 외부 변경 직전의 권한 검사나 자원 서버의 fencing으로 지켜야 한다.

## 호출별 `ALLOW`만으로는 작업 전체를 설명하지 못한다

여러 Agent가 연결되면 승인 회수와 실행 사이의 시간차가 호출별 로그에 잘 드러나지 않는다. 아래 타임라인은 앞의 SDK 실행 로그가 아니라, 같은 문제를 위임 token과 ERP API까지 확장한 운영 예시다.

```text
10:00:00  Alice가 갱신 승인
10:00:01  개인 Agent → 구매 Agent      ALLOW
10:00:02  구매 Agent용 token 발급       ALLOW
10:00:05  Alice가 승인 회수
10:00:08  구매 Agent → ERP API          ALLOW
10:00:09  주문 생성
```

ERP가 받은 token은 아직 만료되지 않았고 scope와 audience도 맞는다. ERP 입장에서는 `ALLOW`가 정상이다. 앞의 A2A 요청도 승인 당시에는 문제가 없었다. 각 시스템은 자기 시점의 입력만 보면 틀린 판단을 하지 않았다.

문제는 10시 5분 이후다. Alice의 승인은 이미 회수됐다. **각 호출이 모두 `ALLOW`여도 multi-agent 작업 전체는 사용자가 허용하지 않은 결과를 만들 수 있다.**

OAuth 2.0 Token Exchange를 써도 이 시간차가 자동으로 없어지지는 않는다. [RFC 8693](https://datatracker.ietf.org/doc/html/rfc8693)은 입력 token과 교환된 token의 수명이 강하게 묶이지 않으며 입력 token 회수를 출력 token에 전파할지는 구현에 맡긴다.

4월에는 Agent 단위 회수를 제안한 Internet-Draft도 나왔다. [OAuth 2.0 Agent Authorization Explicit Revocation](https://datatracker.ietf.org/doc/draft-chen-oauth-agent-revocation/)은 상위 Agent를 회수해도 하위 Agent의 token이 남는 문제를 지적한다. `agent_id`와 전파 깊이를 받아 관련 token을 함께 회수하는 방식이다. 다만 개인 초안이어서 IETF의 합의 문서나 RFC는 아니다. 이 초안대로 token을 끊더라도 실행 중인 A2A Task와 이미 생성된 주문까지 취소되는 것은 아니다.

[A2A v1.0 명세](https://github.com/a2aproject/A2A/blob/v1.0.0/docs/specification.md#L1884-L1938)는 `TASK_STATE_AUTH_REQUIRED`와 credential 전달 책임을 정한다. credential은 기본적으로 out-of-band로 받도록 하고 접근 경계는 각 Agent의 authorization model에 맡긴다. 애플리케이션의 `approval_id`, token 회수 이벤트, 외부 주문을 이어 주는 데이터 모델은 A2A에 없다.

```text
can_write =
  approval_is_active
  AND delegated_token_is_valid
  AND task_is_not_canceled
  AND resource_policy_allows
```

네 조건을 A2A 요청이 들어올 때 한 번만 확인하면 오래 실행되는 Task에는 빈틈이 생긴다. 이 식은 A2A 명세의 policy language가 아니라 서비스에서 유지해야 할 권한 불변식을 줄여 쓴 것이다.

## 승인 ID와 `task_id`를 연결해 둔다

운영에 넣는다면 승인 상태를 비활성화하는 transaction에서 회수 이벤트도 outbox에 함께 남긴다. 그 이벤트를 받은 worker가 파생 token과 실행 중인 Task, 이미 반영된 결과를 각각 처리한다. 아래 코드는 구조만 보이기 위한 의사코드다.

```py
async def on_grant_revoked(approval_id):
    await grant_store.mark_inactive(approval_id)
    await token_broker.revoke_descendants(approval_id)

    for task_id in await task_index.running_tasks(approval_id):
        try:
            await control_plane_a2a_client.cancel_task(
                CancelTaskRequest(id=task_id)
            )
        except TaskNotCancelableError:
            await reconcile_task_result(task_id)

    await reconcile_committed_side_effects(approval_id)
```

`control_plane_a2a_client`는 회수 대상인 사용자 token과 다른 service identity를 쓴다. [A2A v1.0의 authorization scoping](https://github.com/a2aproject/A2A/blob/v1.0.0/docs/specification.md#L3050-L3076)은 `CancelTask`를 포함한 모든 Task operation에서 호출자의 접근 권한을 확인하도록 요구한다. 사용자 token을 먼저 폐기하고 같은 token으로 `CancelTask`를 보내면 취소 요청부터 거절될 수 있다. 취소용 identity도 전체 Task에 접근시키지 않고 해당 tenant와 Task owner 범위로 제한한다.

내부 기록에는 `approval_id`, 위임 token 식별자(`jti` 등), A2A `task_id`, ERP 주문 ID가 함께 남아 있어야 한다. 한 번의 승인이 여러 Task를 만들 수 있으므로 `approval_id`와 `task_id`는 일대일이라고 가정하지 않는다. 자연어 대화나 `context_id`만으로는 어느 Task와 token을 회수해야 하는지 정확히 찾기 어렵다. 인증 정보 자체는 기록하지 않는다.

돈을 쓰거나 외부 메시지를 보내거나 레코드를 바꾸기 직전에는 승인 상태를 다시 확인한다. 모든 조회에 중앙 정책 서버를 동기 호출할 필요는 없다. 실제 변경이 생기는 작업만 짧은 유효 시간이나 거래 단위 권한으로 묶는 편이 낫다.

승인 회수 이벤트는 중복되거나 순서가 바뀔 수 있다. `event_id`와 `approval_version`을 기록하고 `CancelTask`, token 회수, 주문 취소를 멱등하게 만든다. A2A Task가 종료 상태에 도달한 뒤에는 ERP 주문 같은 실제 결과와 상태가 맞는지도 대조한다.

## 쓰기 직전 재확인에도 TOCTOU는 남는다

세 번째 실험은 승인 상태와 모의 ERP가 같은 프로세스 안에 있다. `grant.active`를 읽은 직후 list에 `ORDER_CREATED`를 넣으므로 결과가 단순하다. 실제 서비스에서 승인 저장소와 ERP가 분리돼 있다면 다음 경쟁 조건이 남는다.

```text
T0  승인 저장소 조회 → ACTIVE
T1  사용자가 승인 회수
T2  ERP 주문 API 호출 → ORDER_CREATED
```

쓰기 직전 재확인은 이 시간 창을 줄이지만 없애지는 못한다. 같은 데이터베이스를 쓸 수 있다면 승인 검사와 변경을 한 transaction에 묶을 수 있다. 시스템이 분리돼 있다면 자원 서버가 `approval_version` 같은 fencing 값을 검사해야 한다. 또는 승인 회수가 token의 `active=false`로 이어지는 구성이라면 [token introspection](https://datatracker.ietf.org/doc/html/rfc7662)으로 최신 상태를 확인할 수 있다. 여기서 `approval_version`은 서비스가 단조 증가시키고 자원 서버가 이전 버전의 쓰기를 거절하는 값이다. 짧은 만료 시간은 노출 시간을 줄일 뿐 원자성을 만들지 않는다.

ERP가 이런 검사를 지원하지 않으면 최종 방어선은 멱등한 요청과 보상 작업이다. 이 경우 `CancelTask` 성공을 주문 취소 성공으로 기록해서도 안 된다. A2A Task 상태와 ERP 상태를 별도로 저장하고 나중에 대조해야 한다.

## 이 실험에서 확인하지 않은 것

- 실제 OAuth token의 발급과 회수 전파 시간
- HTTP/REST와 gRPC binding의 취소 경로
- 프로세스와 네트워크가 분리된 환경의 취소 경쟁 조건
- 이미 ERP에 반영된 주문을 되돌리는 보상 transaction
- `cancel()`이 오래 걸리거나 `CancelledError`를 삼키는 Agent

따라서 세 실행 결과는 A2A 전체 구현의 안전성을 증명하지 않는다. Python SDK 1.1.2의 JSON-RPC 경로에서 애플리케이션 승인 회수, `CancelTask`, 쓰기 직전 재확인이 서로 다른 동작임을 재현한 결과다.

## `SendMessage` 성공만으로 연결이 끝난 것은 아니다

Agent Card를 읽고 `SendMessage`가 성공하면 Agent끼리 대화할 수 있다. 운영 서비스에서는 다음 경로까지 확인해야 한다.

- 승인 회수 이벤트로 실행 중인 `task_id`를 찾을 수 있는가
- 그 이벤트가 token 회수와 control-plane identity의 `CancelTask`로 이어지는가
- 호출받은 Agent가 `cancel()`을 실제로 구현했는가
- 자원 서버가 외부 변경 시점의 승인 상태나 fencing 값을 확인하는가
- 이미 반영된 변경을 되돌릴 방법이 있는가

Agent identity와 호출별 권한 검사가 필요하다는 건 변하지 않는다. 다만 실제 프로덕션에서는 호출이 허용된 뒤 사용자의 승인이 바뀌는 구간까지 다뤄야 한다.

그래서 `SendMessage`가 성공했다는 이유만으로 A2A를 운영에 넣을 준비가 끝났다고 보기는 어렵다. A2A v1.0은 Agent끼리 Task를 주고받고 취소를 요청하는 형식을 맞춰 준다. `CancelTask`는 불필요한 실행을 줄이지만 권한 불변식까지 보장하지 않는다. 사용자 승인에서 파생된 token과 Task, 실제 변경을 연결하고 자원 서버에서 최신 승인을 확인해야 한다. 이미 반영된 결과는 별도의 보상 작업으로 맞춰야 한다. 이 부분은 프로토콜이 아니라 서비스를 설계하는 쪽의 책임이다.

## 참고 자료

- [A2A Protocol v1.0.0 release](https://github.com/a2aproject/A2A/releases/tag/v1.0.0)
- [What's New in A2A Protocol v1.0 — release tag](https://github.com/a2aproject/A2A/blob/v1.0.0/docs/whats-new-v1.md)
- [A2A Protocol Specification v1.0 — release tag](https://github.com/a2aproject/A2A/blob/v1.0.0/docs/specification.md)
- [A2A Python SDK 1.1.2 release](https://github.com/a2aproject/a2a-python/releases/tag/v1.1.2)
- [A2A Python SDK 1.1.2 — AgentExecutor source](https://github.com/a2aproject/a2a-python/blob/v1.1.2/src/a2a/server/agent_execution/agent_executor.py)
- [A2A official Python Hello World example](https://github.com/a2aproject/a2a-samples/tree/e580a885a73e689eb448c377789b3a65e97b6c0d/samples/python/agents/helloworld)
- [AWS — Building a serverless A2A gateway for agent discovery, routing, and access control](https://aws.amazon.com/blogs/machine-learning/building-a-serverless-a2a-gateway-for-agent-discovery-routing-and-access-control/)
- [Microsoft Foundry — Agent2Agent (A2A) authentication](https://learn.microsoft.com/en-us/azure/foundry/agents/concepts/agent-to-agent-authentication)
- [IETF Internet-Draft — OAuth 2.0 Agent Authorization Explicit Revocation](https://datatracker.ietf.org/doc/draft-chen-oauth-agent-revocation/)
- [RFC 8693 — OAuth 2.0 Token Exchange](https://datatracker.ietf.org/doc/html/rfc8693)
- [RFC 7662 — OAuth 2.0 Token Introspection](https://datatracker.ietf.org/doc/html/rfc7662)
