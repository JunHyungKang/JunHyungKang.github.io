---
title: "나는 왜 새 Agent 서비스에 Router부터 두지 않는가"
date: "2026-07-29"
teaser: "새 agent 프로젝트는 별도 Router나 Planner를 두기보다 primary agent 하나와 harness로 시작해 왔다. 반복되는 실패를 보고 agent 경계를 추가하는 기준을 정리했다."
image: "/images/posts/2026/2026-07-29-Router-First-Agent-Architecture/cover.svg"
contentType: "아키텍처 판단 기록"
evidence: "여러 agent 서비스를 점검하며 본 반복 실패와 역할·권한 경계 문제를 설계 기준으로 정리했습니다."
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

예전에는 나도 역할별 agent를 먼저 나누는 구조를 썼다. 하지만 한 agent가 작업을 끝까지 소유하고 필요한 기능을 harness로 보완하는 방식으로 바꾼 지는 꽤 됐다. 지금은 새 agent 프로젝트를 primary agent 하나로 시작한다.

Subagent를 쓰지 않는다는 뜻은 아니다. 조사 범위가 커서 병렬 실행이 필요하거나 긴 context를 떼어놓아야 할 때는 실행 중에 호출하고 결과를 다시 받는다.

내가 피한 건 multi-agent 자체가 아니다.

**아직 실패가 확인되지 않았는데 작업의 소유권부터 쪼개는 방식이다.**

Router가 없어서 생긴 실패를 보기 전에는 Router를 넣지 않는다.

![Router-first 구조와 single-agent baseline 비교](/images/posts/2026/2026-07-29-Router-First-Agent-Architecture/cover.svg)

## 차이는 routing을 하느냐가 아니라 언제 강제하느냐다

Router-first 구조와 subagent를 쓰는 구조 모두 다른 agent를 고르는 판단을 포함한다. 차이는 그 선택을 모든 요청의 첫 단계로 고정하느냐에 있다.

앞단 Router는 모든 요청을 먼저 분류한 뒤 선택한 전문 agent에게 작업을 넘긴다. Router가 상태를 유지하지 않는다면 다음 요청에서도 같은 분류와 context 전달을 다시 거친다.

Primary agent는 직접 실행하다가 병렬 처리나 context 격리가 필요해졌을 때 subagent를 동적으로 spawn할 수 있다. 미리 정의해 둔 subagent를 골라 호출하는 방식도 마찬가지다. 제한된 작업만 맡기고 결과를 돌려받은 뒤 primary agent가 다음 판단을 이어간다. 사용자 요청의 소유권도 그대로 남는다.

Handoff는 다른 agent가 이후 대화와 판단까지 직접 맡는다는 점에서 다르다.

Researcher가 조사하고 Writer가 쓰고 Reviewer가 검토하는 구성은 그럴듯하다. 세 역할이 같은 원문과 판단 근거를 계속 봐야 한다면 얘기가 달라진다. Context를 나눈 뒤 같은 정보를 계속 전달하느라 호출만 늘 수 있다.

## Router-first가 합리적이었던 이유

내가 예전에 Router-first 구조를 택했던 가장 큰 이유는 모델 성능이었다. 당시 모델에게 여러 tool과 긴 지침을 주고 상황에 맞는 기능을 실행 중에 고르게 하는 방식은 안정적이지 않았다.

그래서 사람이 실행 경로를 workflow로 더 깊게 설계했다. 요청은 Router가 먼저 분류하고 역할별 실행 순서도 미리 정했다. 각 agent가 보는 prompt와 tool을 줄이면 모델의 판단 범위가 좁아졌고 역할별 동작을 따로 시험하기도 쉬웠다. 당시에는 꽤 합리적인 선택이었다.

Tool이 많을 때 잘못 고르거나 긴 지침을 놓치는 문제는 지금도 남아 있다. 다만 내가 다루는 최근 모델은 tool 선택과 긴 지침 처리가 전보다 나아졌다. harness에서도 요청에 맞는 tool만 노출하고 필요한 지침을 그때 불러올 수 있다. 작업 상태는 대화에 전부 싣지 않고 별도 state로 관리한다.

이제는 별도 agent를 만들기 전에 tool 노출과 재시도, 검증을 harness에서 해결할 수 있는지 먼저 본다. 인증과 승인처럼 결과가 명확한 분기는 LLM Router가 아니라 코드로 처리한다. 팀과 권한이 실제로 나뉘어 있다면 그때 agent 경계도 함께 나눈다.

## Router가 맡던 일은 primary agent와 harness로 나눴다

별도 Router를 뺐다고 조율까지 없어진 건 아니다.

사용자 목표와 대화, 작업 상태, 최종 결과는 primary agent가 끝까지 들고 간다. 실행 상태를 보며 tool과 skill을 고른다. 병렬화나 context 격리가 필요할 때는 subagent를 부른다. 결과를 검증하고 작업을 끝낼 시점도 판단한다.

승인과 checkpoint, 재시도, 강제 종료는 harness와 일반 코드에 남겼다.

## Orchestrator는 첫 분류보다 진행 관리에 가깝다

별도 orchestrator를 두는 경우에도 첫 요청 분류만 맡기지는 않는다. 여러 worker의 진행 상태를 보고 다음 작업을 정한다. 막힌 작업을 다시 계획하거나 중단할 시점도 판단하게 한다.

Orchestrator는 worker의 진행 상태와 실패 신호를 계속 볼 수 있어야 한다. 첫 요청에서 worker 하나만 고른 뒤 끝난다면 내가 이 글에서 Router라고 부르는 역할과 크게 다르지 않다.

여러 장기 작업의 상태를 따로 관리해야 할 때는 orchestrator를 검토한다. 실행 중 조율할 일이 없다면 primary agent와 harness 안에서 처리한다.

## 연구에서도 작업 구조에 따라 결과가 달랐다

내가 가장 참고한 것은 2026년 7월 24일 [Nature Machine Intelligence에 게재된 연구](https://www.nature.com/articles/s42256-026-01268-y)다. Google Research·Google DeepMind·MIT 연구진이 여섯 개 과제, 다섯 가지 구조와 세 모델 계열의 `260개` 구성을 비교했다. prompt와 tool interface, 추론 token budget 상한을 맞췄다.

여러 분석을 서로의 결과를 기다리지 않고 진행할 수 있는 금융 과제에서 중앙 조율 방식은 single agent보다 `80.8%` 높았다. 앞 단계 판단이 다음 단계로 이어지는 순차 계획에서는 최대 `70%` 낮았고, SWE-bench Verified에서는 네 multi-agent 구조가 모두 single agent보다 낮았다.

어느 구조가 항상 낫다는 결과는 아니었다. 하위 작업 사이의 의존성과 single-agent 기준선의 성능이 결과를 갈랐다.

[OpenHands-Versa](https://aclanthology.org/2026.findings-eacl.318/)는 강한 single-agent 기준선이 어떤 모습인지 보여준다. 코딩, 리서치, 웹 탐색을 전문 agent로 나누는 대신 OpenHands 기반 agent 하나에 shell, code execution, browser, search API와 multimodal file viewer를 붙였다. 긴 브라우저 기록은 압축하고 일정 step마다 진행 상황과 다음 계획을 다시 쓰게 했다.

평가는 세 종류였다. SWE-Bench Multimodal은 이미지나 영상이 포함된 프런트엔드 GitHub issue를 수정하는 과제다. GAIA는 웹 검색과 파일 해석이 필요한 조사 과제다. The Agent Company는 가상 회사의 GitLab·OwnCloud·RocketChat에서 업무를 처리하는 과제다.

같은 기반 모델로 맞춘 비교에서는 OpenHands-Versa가 SWE-Bench Multimodal에서 Agentless-Lite보다 `2.32%p`, GAIA에서 TapeAgents보다 `3.98%p` 높았다. The Agent Company에서는 모든 checkpoint를 완료한 비율이 OpenHands v0.28.1보다 `4.57%p` 높았다. 영역마다 비교 대상과 평가 지표가 달라 “single agent가 multi-agent를 이겼다”는 실험은 아니다.

내가 이 연구에서 본 것은 순위보다 범용성이다. 같은 agent scaffold가 코드 수정, 조사, 업무 자동화 세 영역에서 모두 기준선 역할을 했다.

요청이 복잡하다는 이유만으로 multi-agent부터 두지는 않는다. 대부분의 일은 마음만 먹으면 잘게 나눌 수 있다. 나눈 작업이 서로의 중간 결과를 기다리지 않고 병렬로 진행되는지, 같은 context를 반복해 넘기지 않아도 되는지가 더 중요하다. 그 전에 single-agent 기준선이 이미 충분히 강한지도 본다.

서로 결과를 기다리지 않아도 되는 검색은 나도 subagent로 병렬 실행한다. 처음부터 조사·작성·검토 역할로 나누는 대신 동시에 실행할 수 있는 검색 갈래만 떼어낸다. 최종 판단과 사용자 응답은 primary agent가 맡는다.

## Router를 추가하면 실패 지점도 늘어난다

Router의 model call 한 번은 작은 비용처럼 보인다. 운영에서는 호출 비용보다 실패 지점이 늘어나는 쪽이 더 번거롭다.

잘못된 routing이라는 실패 유형부터 생긴다. 전문 agent가 답을 틀린 것인지 Router가 잘못 보낸 것인지 따로 판단해야 한다. 한 요청이 두 영역에 걸치면 한 곳만 고를지, 둘 다 호출할지, 최종 답은 누가 합칠지도 정해야 한다.

Context 전달 방식도 정해야 한다. 사용자 원문을 그대로 넘기면 다음 agent가 의도를 다시 해석한다. Router가 요약해서 넘기면 제약 조건이 빠질 수 있다. 최종 응답만 보면 오분류인지, 전달 손실인지, 실행 agent의 오류인지 바로 알기 어렵다.

[SILO-BENCH](https://aclanthology.org/2026.acl-long.1354/)는 각 agent에 정보 일부만 나눠준 뒤 자유롭게 통신해 하나의 답을 만들게 했다. agent들은 과제에 맞는 통신 구조를 스스로 찾았지만, 모은 정보를 최종 답으로 합치는 데 자주 실패했다.

Agent를 나누면 권한 경계도 늘어난다. 여러 agent가 쓰기 tool을 공유하면 승인과 복구 규칙이 같은 수준으로 강제되는지 확인해야 한다. Primary agent 하나가 작업을 소유하면 승인 정책을 한 실행 경계에 둘 수 있다. 실제 권한 검사는 각 tool과 runtime에서도 강제해야 한다.

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

## 지금은 이렇게 시작한다

이건 여러 agent 서비스를 만들고 점검하면서 굳어진 내 방식이다.

Primary agent 하나와 harness로 먼저 돌려본다. 실패가 반복되면 원인을 보고 Router나 subagent를 하나씩 붙인다. 확인된 실패가 없다면 작업의 소유권부터 나누지 않는다.

## 참고 자료

- [Capable language models can outgrow the benefits of collaboration — Nature Machine Intelligence 2026](https://www.nature.com/articles/s42256-026-01268-y)
- [Coding Agents with Multimodal Browsing are Generalist Problem Solvers — Findings of EACL 2026](https://aclanthology.org/2026.findings-eacl.318/)
- [SILO-BENCH: A Scalable Environment for Evaluating Distributed Coordination in Multi-Agent LLM Systems — ACL 2026](https://aclanthology.org/2026.acl-long.1354/)
