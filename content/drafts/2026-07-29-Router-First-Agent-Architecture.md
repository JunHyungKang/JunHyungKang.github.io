---
title: "나는 왜 새 Agent 서비스에 Router부터 두지 않는가"
date: "2026-07-29"
teaser: "새 agent 프로젝트는 별도 Router나 Planner를 두기보다 primary agent 하나와 harness로 시작해 왔다. 반복되는 실패를 보고 agent 경계를 추가하는 기준을 정리했다."
image: "/images/posts/2026/2026-07-29-Router-First-Agent-Architecture/cover.svg"
tags:
  - AI Agent
  - Agent Architecture
  - Multi-Agent
  - Context Engineering
  - Agent Harness
  - Evals
---

## Router나 Planner부터 두는 구조

최근 여러 agent 서비스를 점검하면서 아래 구조를 자주 봤다.

`User → Router/Planner → Researcher·Reviewer·Executor`

팀마다 이름은 다르다. Router라고도 하고 Planner라고도 한다. 여기서는 **사용자의 첫 요청을 받아 담당 agent를 고르거나 실행 계획을 만든 뒤 다른 agent에게 넘기는 별도 LLM 호출**을 Router라고 부르겠다. 권한이나 tenant 값으로 결정되는 코드 분기와 primary agent가 실행 중에 tool이나 subagent를 고르는 일은 포함하지 않는다.

예전에는 나도 역할별 agent를 먼저 나누는 구조를 썼다. 하지만 한 agent가 작업을 끝까지 소유하고 필요한 기능을 harness로 보완하는 방식으로 바꾼 지는 꽤 됐다. 지금은 새 agent 프로젝트를 primary agent 하나로 시작한다. 사용자 요청과 작업 상태, 최종 결과를 이 agent가 계속 들고 간다.

Subagent도 쓴다. 조사 범위가 크면 몇 갈래로 나눠 동시에 돌린다. 긴 context를 떼어놓아야 할 때는 별도 작업으로 보낸다. 그래도 사용자 요청을 소유하는 agent는 바뀌지 않는다. Primary agent가 실행 중에 subagent를 호출하고 결과를 돌려받는다.

내가 피한 건 multi-agent 자체가 아니다. 아직 실패가 확인되지 않았는데 작업의 소유권부터 쪼개는 방식이다. Router가 없어서 생긴 실패를 보기 전에는 Router를 넣지 않는다.

![Router-first 구조와 single-agent baseline 비교](/images/posts/2026/2026-07-29-Router-First-Agent-Architecture/cover.svg)

## Router와 Subagent는 작업을 넘기는 시점이 다르다

앞단 Router는 첫 요청을 분류한 뒤 선택한 전문 agent에게 작업을 넘긴다. Router가 상태를 유지하지 않는다면 다음 요청에서 같은 분류와 context 전달을 다시 거친다.

Subagent를 쓰는 구조에서는 메인 agent가 계속 작업을 소유한다. 실행하다가 독립적으로 떼어낼 일이 생겼을 때만 worker를 불러 결과를 받은 뒤 다음 판단을 이어간다. Handoff는 여기서 한 단계 더 나간다. 다른 agent가 이후 대화와 판단을 직접 맡는다.

Supervisor는 최초 분류보다 실행 중 조율에 가깝다. 여러 worker의 진행 상태를 보고 다음 작업을 정하며 결과를 합친다. Skill은 agent를 늘리지 않는다. 같은 agent가 필요한 지침과 자료를 불러온다.

Researcher가 조사하고 Writer가 쓰고 Reviewer가 검토하는 구성은 그럴듯하다. 세 역할이 같은 원문과 판단 근거를 계속 봐야 한다면 얘기가 달라진다. Context를 나눈 뒤 같은 정보를 계속 전달하느라 호출만 늘 수 있다.

## Router-first가 합리적이었던 이유

Router를 두면 선택된 agent가 보는 prompt와 tool을 줄일 수 있다. 역할별 동작을 따로 시험하기도 편하다. 한 agent가 비슷한 tool 사이에서 자주 틀리거나 긴 지침을 놓친다면 역할을 나눌 이유가 있다.

tool이 많거나 지침이 길어질 때 생기는 문제는 지금도 남아 있다. 다만 agent를 분리하기 전에 시도할 수 있는 수단이 많아졌다. 요청에 맞는 tool만 노출하고 긴 지침은 skill로 불러올 수 있다. 작업 상태도 대화에 전부 싣지 않고 artifact나 checkpoint에 남긴다.

나는 별도 agent를 만들기 전에 tool 노출과 재시도, 검증을 harness에서 해결할 수 있는지 먼저 본다. 인증과 승인처럼 결과가 명확한 분기는 LLM Router가 아니라 코드로 처리한다. 팀과 권한이 실제로 나뉘어 있다면 그때 agent 경계도 함께 나누면 된다.

## Router가 맡던 일은 primary agent와 harness로 나눴다

별도 Router를 뺐다고 조율까지 없어진 건 아니다.

사용자 목표와 대화, 작업 상태, 최종 결과는 primary agent가 끝까지 들고 간다. 실행 상태를 보며 tool과 skill을 고른다. 병렬화나 context 격리가 필요할 때는 subagent를 부른다. 결과를 검증하고 작업을 끝낼 시점도 판단한다.

어떤 기능을 쓸지는 primary agent가 실행 중에 판단한다. 승인과 checkpoint, 재시도, 강제 종료는 harness와 일반 코드에 남겼다. 여러 장기 작업의 진척을 조율해야 할 때만 별도 supervisor를 둔다.

## Orchestrator는 첫 분류보다 진행 관리에 가깝다

별도 orchestrator를 두는 경우에도 첫 요청 분류만 맡기지는 않는다. 여러 worker의 진행 상태를 보고 다음 작업을 정한다. 막힌 작업을 다시 계획하거나 중단할 시점도 판단하게 한다.

이 역할에는 실행 중인 작업을 계속 볼 수 있는 상태와 관측 정보가 필요하다. 첫 요청에서 worker 하나만 고르고 끝난다면 내가 이 글에서 Router라고 부르는 역할과 크게 다르지 않다.

그래서 여러 장기 작업의 상태를 따로 관리해야 할 때는 orchestrator를 검토한다. 실행 중 조율할 일이 없다면 primary agent와 harness 안에서 처리한다.

## 연구에서는 과업 구조가 결과를 갈랐다

앞단 Router 하나의 효과만 떼어 측정한 2026년 연구는 찾지 못했다. 대신 같은 해 공개된 single-agent와 multi-agent 연구로 내 판단을 점검했다.

내가 가장 참고한 것은 2026년 7월 24일 [Nature Machine Intelligence에 게재된 연구](https://www.nature.com/articles/s42256-026-01268-y)다. Google Research·Google DeepMind·MIT 연구진이 여섯 개 과제, 다섯 가지 구조와 세 모델 계열의 `260개` 구성을 비교했다. Prompt와 tool interface, reasoning-token budget 상한을 맞췄다.

독립적으로 나누기 좋은 금융 분석에서는 중앙 조율 방식이 `80.8%` 좋아졌다. 앞 단계 판단이 다음 단계로 이어지는 순차 계획에서는 최대 `70%` 나빠졌고, SWE-bench Verified에서는 네 multi-agent 구조가 모두 single agent보다 낮았다. Agent 수보다 single-agent 기준선의 성능이 결과를 더 잘 설명했다.

Nature 연구만으로 single agent가 우월하다고 말할 수는 없다. 이 연구에서 agent 수보다 먼저 봐야 했던 것은 과업을 독립적으로 나눌 수 있는지와 single-agent 기준선의 성능이었다.

[OpenHands-Versa](https://aclanthology.org/2026.findings-eacl.318/)는 강한 single-agent 기준선이 어떤 모습인지 보여준다. 코딩, 리서치, 웹 탐색을 전문 agent로 나누는 대신 OpenHands 기반 agent 하나에 shell, code execution, browser, search API와 file viewer를 붙였다. 긴 브라우저 기록은 압축하고 일정 step마다 진행 상황과 다음 계획을 다시 쓰게 했다.

OpenHands-Versa는 세 benchmark에서 기존 공개 전문 시스템과 경쟁하거나 `1.3~9.1%p` 앞섰다. 비교 대상의 model과 비용이 같지는 않았으므로 “single agent가 multi-agent를 이겼다”는 실험은 아니다. 그래도 tool과 context를 잘 관리한 범용 agent가 비교의 출발점이 될 수 있다는 점은 확인할 수 있었다.

두 연구를 함께 보면 “요청이 복잡하니 multi-agent”라는 설명만으로는 부족하다. 먼저 과업을 독립적으로 나눌 수 있는지, single agent 기준선은 충분히 강한지부터 봐야 한다.

독립 검색을 병렬로 돌릴 수 있는 과업에서는 나도 subagent를 쓴다. 처음부터 역할을 `Researcher`, `Writer`, `Reviewer`로 나누는 대신 실제로 동시에 실행할 수 있는 검색 갈래만 떼어낸다. 최종 판단과 사용자 응답은 primary agent가 맡는다.

## Router를 추가하면 실패 지점도 늘어난다

Router의 model call 한 번은 작은 비용처럼 보인다. 운영에서는 호출 비용보다 실패 지점이 늘어나는 쪽이 더 번거롭다.

잘못된 routing이라는 실패 유형부터 생긴다. 전문 agent가 답을 틀린 것인지 Router가 잘못 보낸 것인지 따로 판단해야 한다. 한 요청이 두 영역에 걸치면 한 곳만 고를지, 둘 다 호출할지, 최종 답은 누가 합칠지도 정해야 한다.

Context 전달 방식도 정해야 한다. 사용자 원문을 그대로 넘기면 다음 agent가 의도를 다시 해석한다. Router가 요약해서 넘기면 제약 조건이 빠질 수 있다. 최종 응답만 보면 오분류인지, 전달 손실인지, 실행 agent의 오류인지 바로 알기 어렵다.

[SILO-BENCH](https://aclanthology.org/2026.acl-long.1354/)는 agent 사이에 정보가 나뉜 환경을 측정했다. agent끼리는 활발하게 메시지를 주고받았지만 분산된 정보를 하나의 답으로 합치는 데 자주 실패했다. 메시지가 오갔다는 사실만으로 필요한 정보가 전달됐다고 볼 수 없었다.

권한 경계도 복제될 수 있다. 여러 agent가 쓰기 tool을 공유하면 승인과 복구 규칙이 같은 수준으로 강제되는지 확인해야 한다. Primary agent 하나가 작업을 소유하면 승인 정책을 한 실행 경계에 둘 수 있다. 실제 권한 검사는 각 tool과 runtime에서도 막아야 한다.

Agent 경계가 추가되면 routing과 전달, 합성은 각각 따로 평가해야 한다. 메시지가 오갔는지만 보지 않고 필요한 정보가 최종 판단까지 남았는지도 확인해야 한다.

## 새 프로젝트에 적용하는 순서

![Single-agent에서 multi-agent로 확장하는 판단 순서](/images/posts/2026/2026-07-29-Router-First-Agent-Architecture/architecture-ladder.svg)

**1. Single agent로 기준선을 만든다.**

Primary agent에 필요한 tool과 skill을 붙인다. 비교 단위는 agent 수가 아니라 같은 사용자 과업이다. Model과 tool set, 최대 추론 예산을 고정하고 성공률과 p95 지연시간, 성공 건당 비용을 남긴다. 반복 횟수와 timeout, retry 조건도 같아야 한다.

**2. 실패 trace부터 나눈다.**

Tool을 잘못 골랐는지, 긴 context에서 조건을 놓쳤는지, 독립 작업이 순서대로 실행돼 느린지 구분한다. Tool schema와 노출 범위, checkpoint를 고쳐 해결되면 agent를 추가하지 않는다.

**3. 확인한 실패에 경계 하나만 추가한다.**

독립 검색을 동시에 돌려야 하면 subagent를 쓴다. 이후 대화의 소유권이 바뀌면 handoff를 쓴다. 첫 요청의 의미만으로 전문 영역을 나눠야 하고 분류 정확도가 검증됐다면 앞단 Router를 검토한다. 권한 경계는 agent 선택과 별개로 코드와 tool runtime에서 강제한다.

**4. 같은 평가 세트로 다시 비교한다.**

Router를 붙인 실험에서는 오분류율과 원문 조건 유실, route별 재시도 횟수를 추가로 본다. 성공률이 조금 올라도 지연시간과 비용, 실패 복구 시간이 크게 늘면 운영상 이득이 아닐 수 있다. 차이가 없다면 다시 합친다.

고객 지원처럼 첫 요청의 영역이 명확하고 이후 전문 agent가 대화를 넘겨받는 서비스라면 앞단 Router가 자연스럽다. 서로 다른 팀이 각자의 권한과 배포 주기로 agent를 운영한다면 agent 경계를 나눌 이유도 있다. 담당 agent를 고르는 일이 의미 분류라면 검증된 Router를 쓴다. 권한으로 결정된다면 코드로 나눈다.

반면 일이 순차적이고 같은 context를 계속 봐야 한다면 한 agent가 끝까지 맡는 편이 단순하다. 역할 이름을 붙이기 전에 실제로 병렬화할 수 있는 작업인지, 경계 사이에 무엇을 전달해야 하는지부터 본다.

## 다음은 같은 과업으로 직접 비교할 차례다

이 글은 통제된 운영 benchmark가 아니다. 여러 agent 서비스를 설계하고 점검하며 써온 기준을 공개 연구와 대조한 기록이다. 점검한 서비스의 trace와 수치를 공개할 수 없어 “Router를 빼면 성능이 오른다”는 주장은 할 수 없다.

인용한 2026년 연구도 앞단 Router 하나의 효과를 직접 측정하지 않았다. OpenHands-Versa는 비교 대상의 model과 비용이 달랐고, Nature 연구와 SILO-BENCH 역시 과제와 구조가 서로 다르다.

같은 사용자 과업을 primary agent 하나, 고정 LLM Router, 필요할 때만 subagent를 쓰는 구조에 넣고 성공률과 비용, 지연시간을 재야 한다. 그때는 routing 오류와 조건 유실, 실패 복구 시간도 함께 남길 생각이다.

그 전까지 내 출발점은 같다. 먼저 primary agent로 기준선을 만든다. 반복되는 실패가 경계를 요구할 때 Router나 subagent를 하나씩 추가한다.

## 참고 자료

- [Capable language models can outgrow the benefits of collaboration — Nature Machine Intelligence 2026](https://www.nature.com/articles/s42256-026-01268-y)
- [Coding Agents with Multimodal Browsing are Generalist Problem Solvers — Findings of EACL 2026](https://aclanthology.org/2026.findings-eacl.318/)
- [SILO-BENCH: A Scalable Environment for Evaluating Distributed Coordination in Multi-Agent LLM Systems — ACL 2026](https://aclanthology.org/2026.acl-long.1354/)
