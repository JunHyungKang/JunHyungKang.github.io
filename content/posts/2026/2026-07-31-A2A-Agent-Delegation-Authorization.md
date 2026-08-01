---
title: "사용자 승인을 회수했지만 A2A Task는 계속 실행됐다"
date: "2026-07-31"
teaser: "공식 A2A Python SDK 1.1.2로 승인 회수 뒤 실행 중인 Task를 확인했다. 별도 CancelTask나 쓰기 직전 재확인이 없으면 Task는 완료됐고 모의 ERP에 주문 기록도 남았다."
image: "/images/posts/2026/2026-07-31-A2A-Agent-Delegation-Authorization/cover.svg"
contentType: "구현 검토"
evidence: "A2A Protocol v1.0과 공식 Python SDK 1.1.2로 비동기 Task를 실행하고 승인 회수와 Task 취소 시점에 따른 결과를 재현했습니다."
tags:
  - AI Agent
  - A2A
  - Authorization
  - Task Lifecycle
  - Multi-Agent
---

## 승인을 회수했는데 주문 기록이 남았다

A2A를 실제 서비스에 적용할 때 Agent Card를 읽고 요청을 주고받는 것만으로는 부족하다. Task 실행 중 사용자가 승인을 회수했을 때 작업을 어떻게 멈출지, 이미 외부 시스템에 반영됐다면 어떻게 되돌릴지도 정해야 한다.

승인 회수 뒤 Task가 자동으로 취소되는지 공식 SDK로 직접 확인했다. 7월 22일 PyPI에 배포된 [`a2a-sdk 1.1.2`](https://pypi.org/project/a2a-sdk/1.1.2/)로 개인 Agent 역할의 A2A 클라이언트와 구매 Agent를 연결했다. 구매 Agent는 요청을 받아 모의 ERP에 주문을 기록한다. 주문 Task가 시작된 직후 사용자의 승인을 회수하고 세 가지 처리를 비교했다.

| 승인 회수 뒤 처리 | Task 최종 상태 | 모의 ERP 주문 |
| --- | --- | --- |
| 추가 처리 없음 (승인은 Task 시작 때만 확인) | 완료 (`TASK_STATE_COMPLETED`) | 생성됨 (`ORDER_CREATED`) |
| `CancelTask` 전송 | 취소 (`TASK_STATE_CANCELED`) | 생성되지 않음 |
| `CancelTask` 없이 모의 ERP 쓰기 직전에 승인 재확인 | 거절 (`TASK_STATE_REJECTED`) | 생성되지 않음 |

승인 상태만 `REVOKED`로 바꾼 첫 실행에서는 Task가 `COMPLETED`로 끝났고 모의 ERP에 주문 기록도 남았다. 승인 회수와 실행 중인 Task 취소가 자동으로 이어지지 않았기 때문이다.

[A2A Protocol v1.0](https://github.com/a2aproject/A2A/releases/tag/v1.0.0)은 2026년 3월 12일 정식 릴리스됐다. v1.0에서는 `Part`와 Agent Card 구조가 바뀌었고 `ListTasks`와 multi-tenancy가 추가됐다. protocol version도 Agent Card 전체가 아니라 각 interface에 붙는다. 자세한 차이는 [v0.3 대비 변경사항](https://a2a-protocol.org/latest/whats-new-v1/)에서 확인할 수 있다.

`CancelTask`는 v1.0에서 처음 나온 기능은 아니다. v0.3의 JSON-RPC 메서드 `tasks/cancel`이 `CancelTask`로 이름을 바꿨고 취소 가능한 상태와 상태 전이가 더 분명해졌다. A2A 명세에 정의된 Task 취소 요청이며, 이미 끝났거나 현재 단계에서 취소할 수 없는 Task는 요청을 거부할 수 있다.

최근 공개된 구현 자료는 주로 호출 시점의 권한을 다룬다. AWS가 7월 1일 공개한 [A2A Gateway 예제](https://aws.amazon.com/blogs/machine-learning/building-a-serverless-a2a-gateway-for-agent-discovery-routing-and-access-control/)는 JWT scope로 접근할 수 있는 Agent를 제한한다. 7월 9일 업데이트된 Microsoft Foundry의 [A2A 인증 문서](https://learn.microsoft.com/en-us/azure/foundry/agents/concepts/agent-to-agent-authentication)는 하나의 Agent identity를 공유하는 방식과 사용자별 OAuth 권한을 넘기는 방식을 구분한다.

이번 실험에서는 두 Agent 사이의 호출 권한을 정상으로 두고, 호출이 시작된 뒤 승인 상태가 바뀌는 경우를 봤다. 사용자가 구매 승인을 회수하면 이미 실행 중인 A2A Task도 멈출까. A2A는 서비스의 승인 저장소를 모르기 때문에 승인 회수를 `CancelTask`로 바꿔 보내지 않는다.

![승인과 A2A Task의 수명이 어긋나는 구간](/images/posts/2026/2026-07-31-A2A-Agent-Delegation-Authorization/task-lifecycle.svg)

테스트는 Python 3.12.4에서 실행했다. 별도 Agent framework를 거치지 않고 A2A 클라이언트와 서버, `CancelTask`를 공식 SDK로 붙였다. 승인 저장소와 ERP 쓰기는 메모리로 단순화했다. 실제 ERP API를 호출하는 대신 `ORDER_CREATED`를 기록했다.

전체 코드는 [`examples/a2a-v1-revocation-lifecycle`](https://github.com/JunHyungKang/JunHyungKang.github.io/tree/master/examples/a2a-v1-revocation-lifecycle)에 두었다.

## Task를 반환한 뒤에도 `execute()`는 계속 실행된다

A2A v1.0의 `SendMessage`는 바로 답할 수 있는 요청에는 `Message`를 반환한다. 시간이 걸리는 작업에는 상태를 추적할 `Task`를 반환할 수 있다. `Task`가 반환됐다고 작업이 끝난 것은 아니다.

공식 Python SDK에서는 `SendMessageConfiguration(return_immediately=True)`로 이 흐름을 만들 수 있다.

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

`return_immediately=True`일 때 SDK는 `AgentExecutor`가 첫 `Task`나 `Message`를 이벤트 큐에 넣을 때까지만 기다린다. 클라이언트가 `task_id`를 받은 뒤에도 서버의 `execute()`는 계속 돈다.

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
```

`grant.revoke()`는 승인 저장소의 상태만 바꾼다. 실행 중인 `execute()`에 취소 신호를 보내지 않는다. 그래서 시작할 때만 승인 상태를 본 구현은 그대로 주문을 만들었다.

반면 ERP 쓰기 직전에 승인 상태를 다시 본 구현은 `TASK_STATE_REJECTED`로 끝났다.

## 승인 회수와 Task 취소는 같은 동작이 아니다

A2A v1.0 명세에는 실행 중인 Task를 멈추기 위한 `CancelTask` 요청이 정의돼 있다. 공식 Python SDK에서는 `client.cancel_task(...)`로 보낸다.

```py
from a2a.types import CancelTaskRequest

await client.cancel_task(
    CancelTaskRequest(id=task_id)
)
```

공식 Python SDK는 `CancelTask`를 받으면 실행 중인 `execute()`를 취소하고 `AgentExecutor.cancel()`을 호출한다. Agent 구현도 취소 상태를 이벤트 큐에 남겨야 한다.

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

승인을 회수했다고 A2A 클라이언트가 실행 중인 `task_id`를 찾아 주지는 않는다. Task를 멈추려면 승인과 `task_id`의 관계를 서비스가 기록해 두고 `CancelTask`를 별도로 보내야 한다.

취소 요청을 보냈다고 항상 멈추는 것도 아니다. [A2A v1.0 명세](https://a2a-protocol.org/latest/specification/#315-cancel-task)는 이미 끝났거나 현재 단계에서 취소할 수 없는 Task에 `TaskNotCancelableError`를 반환하도록 정의한다.

공식 [Hello World 예제의 `cancel()`](https://github.com/a2aproject/a2a-samples/blob/e580a885a73e689eb448c377789b3a65e97b6c0d/samples/python/agents/helloworld/agent_executor.py#L77-L80)도 `NotImplementedError`를 던진다. SDK가 `execute()` 코루틴을 취소해도 Agent가 이미 시작한 외부 작업까지 저절로 멈추지는 않는다. `cancel()`에서 외부 작업을 중단하고 취소 상태를 남기는 처리가 필요하다.

ERP에 주문이 이미 저장됐다면 취소의 의미가 또 달라진다. `TASK_STATE_CANCELED`로 바꿔도 주문은 남아 있다. 주문 취소나 환불처럼 이미 반영된 결과를 되돌리는 작업이 따로 필요하다.

| 동작 | 처리하는 범위 | 그대로 남는 것 |
| --- | --- | --- |
| 승인 회수 | 승인 상태를 다시 확인하는 지점 | 이미 실행 중인 A2A Task |
| `CancelTask` | 아직 중단할 수 있는 Task | 이미 반영된 외부 변경 |
| 보상 작업 | 주문 취소처럼 되돌릴 수 있는 결과 | 원래 실행 이력 |

## 호출마다 `ALLOW`였는데 전체 작업은 허용되지 않았다

여러 Agent가 연결되면 승인 회수와 실행 사이의 시간차가 로그에 잘 드러나지 않는다.

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

OAuth 2.0 Token Exchange를 써도 이 시간차가 자동으로 없어지지는 않는다. [RFC 8693](https://datatracker.ietf.org/doc/html/rfc8693)은 입력 token과 교환된 token의 수명이 강하게 묶이지 않으며, 입력 token 회수를 출력 token에 전파할지는 구현에 맡긴다.

4월에는 Agent 단위 회수를 제안한 Internet-Draft도 나왔다. [OAuth 2.0 Agent Authorization Explicit Revocation](https://datatracker.ietf.org/doc/draft-chen-oauth-agent-revocation/)은 상위 Agent를 회수해도 하위 Agent의 token이 남는 문제를 지적한다. `agent_id`와 전파 깊이를 받아 관련 token을 함께 회수하는 방식이다. 다만 개인 초안이어서 IETF의 합의 문서나 RFC는 아니다. 이 초안대로 token을 끊더라도 실행 중인 A2A Task와 이미 생성된 주문까지 취소되는 것은 아니다.

[A2A 명세](https://a2a-protocol.org/latest/specification/#764-in-task-authorization-scope)도 `TASK_STATE_AUTH_REQUIRED`를 거쳐 받은 권한의 범위와 유효 기간, 회수 방식을 정하지 않는다. Agent를 연결한 서비스가 실제 변경 시점의 조건을 다시 확인해야 한다.

```text
can_write =
  approval_is_active
  AND delegated_token_is_valid
  AND task_is_not_canceled
  AND resource_policy_allows
```

네 조건을 A2A 요청이 들어올 때 한 번만 확인하면 오래 실행되는 Task에는 빈틈이 생긴다.

## 승인 ID와 `task_id`를 연결해 둔다

운영에 넣는다면 승인 회수 이벤트에서 승인 상태, 파생 token, 실행 중인 Task, 이미 반영된 결과를 순서대로 처리한다.

```py
async def on_grant_revoked(approval_id):
    await grant_store.mark_inactive(approval_id)
    await token_broker.revoke_descendants(approval_id)

    for task_id in await task_index.running_tasks(approval_id):
        await a2a_client.cancel_task(
            CancelTaskRequest(id=task_id)
        )

    await reconcile_committed_side_effects(approval_id)
```

그러려면 내부 기록에 `approval_id`, 위임 token 식별자(`jti` 등), A2A `task_id`, ERP 주문 ID가 함께 남아 있어야 한다. 자연어 대화나 `context_id`만으로는 어느 Task와 token을 회수해야 하는지 정확히 찾기 어렵다. 인증 정보 자체는 기록하지 않는다.

돈을 쓰거나 외부 메시지를 보내거나 레코드를 바꾸기 직전에는 승인 상태를 다시 확인한다. 모든 조회에 중앙 정책 서버를 동기 호출할 필요는 없다. 실제 변경이 생기는 작업만 짧은 유효 시간이나 거래 단위 권한으로 묶는 편이 낫다.

승인 회수 이벤트가 재전송돼도 `CancelTask`와 주문 취소가 두 번 실행되지 않게 한다. A2A Task가 종료 상태에 도달한 뒤에는 ERP 주문 같은 실제 결과와 상태가 맞는지도 대조한다.

## `SendMessage` 성공만으로 연결이 끝난 것은 아니다

Agent Card를 읽고 `SendMessage`가 성공하면 Agent끼리 대화할 수 있다. 운영 서비스에서는 다음 경로까지 확인해야 한다.

- 승인 회수 이벤트로 실행 중인 `task_id`를 찾을 수 있는가
- 그 이벤트가 token 회수와 `CancelTask`로 이어지는가
- 호출받은 Agent가 `cancel()`을 실제로 구현했는가
- 외부 변경 직전에 승인 상태를 다시 확인하는가
- 이미 반영된 변경을 되돌릴 방법이 있는가

Agent identity와 호출별 권한 검사가 필요하다는 건 변하지 않는다. 다만 실제 프로덕션에서는 호출이 허용된 뒤 사용자의 승인이 바뀌는 구간까지 다뤄야 한다.

그래서 `SendMessage`가 성공했다는 이유만으로 A2A를 운영에 넣을 준비가 끝났다고 보기는 어렵다. 사용자 승인에서 파생된 token과 Task, 실제 변경을 끝까지 추적할 수 있어야 한다. 승인이 회수되면 실행 중인 Task를 멈추고 이미 반영된 결과는 되돌려야 한다. A2A v1.0은 Agent끼리 Task를 주고받는 형식을 맞춰 준다. 승인과 token, Task, 실제 변경의 수명을 연결하는 코드는 서비스 쪽에 남는다.

## 참고 자료

- [A2A Protocol v1.0.0 release](https://github.com/a2aproject/A2A/releases/tag/v1.0.0)
- [What's New in A2A Protocol v1.0](https://a2a-protocol.org/latest/whats-new-v1/)
- [A2A Protocol Specification v1.0](https://a2a-protocol.org/latest/specification/)
- [A2A Python SDK 1.1.2 release](https://github.com/a2aproject/a2a-python/releases/tag/v1.1.2)
- [A2A Python SDK — AgentExecutor API](https://a2a-protocol.org/latest/sdk/python/api/a2a.server.agent_execution.agent_executor.html)
- [A2A official Python Hello World example](https://github.com/a2aproject/a2a-samples/tree/e580a885a73e689eb448c377789b3a65e97b6c0d/samples/python/agents/helloworld)
- [AWS — Building a serverless A2A gateway for agent discovery, routing, and access control](https://aws.amazon.com/blogs/machine-learning/building-a-serverless-a2a-gateway-for-agent-discovery-routing-and-access-control/)
- [Microsoft Foundry — Agent2Agent (A2A) authentication](https://learn.microsoft.com/en-us/azure/foundry/agents/concepts/agent-to-agent-authentication)
- [IETF Internet-Draft — OAuth 2.0 Agent Authorization Explicit Revocation](https://datatracker.ietf.org/doc/draft-chen-oauth-agent-revocation/)
- [RFC 8693 — OAuth 2.0 Token Exchange](https://datatracker.ietf.org/doc/html/rfc8693)
