---
title: "나는 왜 새 Agent 서비스의 첫 상자에 Router를 두지 않는가"
date: "2026-07-29"
teaser: "약 1년간 별도 LLM Router 대신 primary agent와 tools를 새 agent 프로젝트의 출발점으로 삼았다. 첫 routing 경계를 추가하기 전에 확인할 운영 신호를 정리했다."
image: "/images/posts/2026/2026-07-29-Router-First-Agent-Architecture/cover.svg"
tags:
  - AI Agent
  - Agent Architecture
  - Multi-Agent
  - Context Engineering
  - Agent Harness
  - Evals
---

## 나는 아키텍처 그림보다 routing eval을 먼저 찾는다

최근 여러 agent 서비스를 점검하면서 아래 구조를 자주 봤다.

`User → Router → Researcher·Planner·Executor → Supervisor`

이 그림을 보면 routing eval과 trace부터 찾는다. Router가 없을 때 어떤 요청이 실패했고, 넣은 뒤 end-to-end 성공률이 얼마나 달라졌는지 보기 위해서다.

개별 서비스의 trace와 수치는 공개할 수 없어 아래 주장의 근거로 쓰지 않았다. 여기서는 점검할 때 사용하는 질문과 공개 연구로 확인할 수 있는 범위만 다룬다.

이 글에서 Router는 사용자 요청을 받은 뒤 **별도의 LLM 호출로 담당 agent를 고르는, 상태를 유지하지 않는 첫 관문**을 뜻한다. 권한이나 tenant를 코드로 나누는 결정론적 분기, primary agent가 실행 중에 tool이나 subagent를 고르는 일은 포함하지 않는다.

나는 약 1년 전부터 새 agent 프로젝트를 primary agent 하나로 시작해 왔다. 사용자 요청과 작업 상태, 최종 결과를 계속 들고 가는 agent다. 저장소 규칙은 `AGENTS.md`, 반복 절차는 skill, 외부 기능은 tool로 붙인다.

Subagent도 쓴다. 조사 범위가 크면 몇 갈래로 나눠 동시에 돌리고, 긴 context를 떼어놓아야 할 때는 별도 작업으로 보낸다. 그래도 사용자 요청을 소유하는 agent는 바뀌지 않는다. Primary agent가 실행 중에 subagent를 호출하고 결과를 돌려받는다.

첫 요청을 받은 Router가 작업 시작 전에 담당 agent부터 고르는 구조와는 다르다. 내가 피한 건 multi-agent 자체가 아니라, 아직 실패도 확인하지 않은 상태에서 작업의 소유권부터 쪼개는 방식이다.

고객 지원처럼 첫 요청의 의미를 해석해 담당 영역을 골라야 하고 선택된 agent가 이후 대화까지 맡는다면 Router를 검토할 수 있다. 반면 tenant나 role, 접근 권한으로 정해지는 분기는 코드와 policy에서 처리한다. 독립적인 장기 작업이 여러 개라면 먼저 상태를 따로 관리하고, 실행 중 우선순위 판단까지 필요할 때 supervisor를 검토한다.

내 기준은 간단하다. Router가 없어서 생긴 실패를 보기 전에는 Router를 넣지 않는다.

![Router-first 구조와 single-agent baseline 비교](/images/posts/2026/2026-07-29-Router-First-Agent-Architecture/cover.svg)

## “Single agent로 시작하라”는 새로운 얘기가 아니다

[LangChain은 2026년 1월 공개한 아키텍처 가이드](https://www.langchain.com/blog/choosing-the-right-multi-agent-architecture)에서 single agent와 잘 설계한 tool로 시작하라고 권한다. 한계가 확인되면 subagent, skill, handoff, router 가운데 맞는 패턴을 고르라는 내용이다. 결론만 놓고 보면 이 글과 상당히 가깝다.

내가 더 확인하고 싶었던 건 패턴의 종류가 아니었다. 모델이 tool을 직접 고르고 필요한 지침을 그때그때 불러오는 환경에서도, 왜 운영 서비스의 앞단에는 여전히 별도 LLM Router가 자주 놓일까? 그리고 Router를 빼면 원래 맡던 조율은 누가 가져가야 할까?

그래서 아래에서는 일반적인 single-agent 대 multi-agent 비교보다 작업 소유권과 운영 실패를 중심으로 본다.

## Router와 Subagent는 작업을 넘기는 시점이 다르다

Front-door Router는 첫 요청을 분류한 뒤 선택한 전문 agent에게 작업을 넘긴다. Router가 상태를 유지하지 않는다면 다음 요청에서 같은 분류와 context 전달을 다시 거친다.

Subagent를 쓰는 구조에서는 메인 agent가 계속 작업을 소유한다. 실행하다가 독립적으로 떼어낼 일이 생겼을 때만 worker를 부르고, 결과를 받아 다음 판단을 이어간다. Handoff는 여기서 한 단계 더 나간다. 다른 agent가 이후 대화와 판단을 직접 맡는다.

Supervisor는 최초 분류보다 실행 중 조율에 가깝다. 여러 worker의 진행 상태를 보고 다음 작업을 정하며 결과를 합친다. Skill은 agent를 늘리지 않는다. 같은 agent가 필요한 지침과 자료를 불러온다.

Researcher가 조사하고 Writer가 쓰고 Reviewer가 검토하는 구성은 그럴듯하다. 세 역할이 같은 원문과 판단 근거를 계속 봐야 한다면 얘기가 달라진다. Context를 나눈 뒤 같은 정보를 계속 전달하느라 호출만 늘 수 있다.

## Router-first가 합리적이었던 이유

Router를 두면 선택된 agent가 보는 prompt와 tool을 줄일 수 있다. 역할별 동작을 따로 시험하기도 편하다. 한 agent가 비슷한 tool 사이에서 자주 틀리거나 긴 지침을 놓친다면 역할을 나눌 이유가 있다.

그 한계는 지금도 남아 있다. 다만 agent를 분리하기 전에 시도할 수 있는 수단이 많아졌다. 요청에 맞는 tool만 노출하고 긴 지침은 skill로 불러올 수 있다. 작업 상태도 대화에 전부 싣지 않고 artifact나 checkpoint에 남긴다.

나는 별도 agent를 만들기 전에 tool 노출과 재시도, 검증을 harness에서 해결할 수 있는지 먼저 본다. 인증과 승인처럼 결과가 명확한 분기는 LLM Router가 아니라 코드로 처리한다. 팀과 권한이 실제로 나뉘어 있다면 그때 agent 경계도 함께 나누면 된다.

## Router가 맡던 일은 primary agent와 harness로 나눴다

별도 Router를 뺐다고 조율까지 없어진 건 아니다.

사용자 목표와 대화, 작업 상태, 최종 결과는 primary agent가 끝까지 들고 간다. 실행 상태를 보며 tool과 skill을 고르고, 병렬화나 context 격리가 필요할 때 subagent를 부른다. 결과를 검증하고 작업을 끝낼 시점도 판단한다.

첫 영역 선택은 primary agent가 실행 중에 tool과 subagent를 고르는 과정으로 흡수했다. 승인과 checkpoint, 재시도, 강제 종료는 harness와 일반 코드에 남겼다. 여러 장기 작업의 진척을 조율해야 할 때만 별도 supervisor를 둔다.

Microsoft Research의 [Magentic-One](https://www.microsoft.com/en-us/research/publication/magentic-one-a-generalist-multi-agent-system-for-solving-complex-tasks/)은 내 구조의 근거라기보다 supervisor를 단순한 첫 분류기로 보면 안 되는 이유를 보여준다. Magentic-One의 orchestrator는 목표와 계획을 task ledger에 남기고, progress ledger로 진척과 정체를 추적한다. 일이 막히면 다시 계획하고 worker에게 다음 지시를 내린다.

GAIA ablation에서 이 구조를 단순한 next-speaker selector로 바꾸고 ledger와 진척 추적, loop 감지, worker별 지시를 제거하자 성능이 저자 보고 기준 `31%` 떨어졌다. Magentic-One은 2024년 프리프린트이고, 같은 tool과 예산을 쓴 single agent와 비교한 실험도 아니다. 이 수치로 supervisor가 언제나 필요하다고 말할 수는 없다. 대신 multi-agent에서 효과가 있었던 조율은 최초 분류가 아니라 진척 추적과 재계획이었다.

Magentic-One 연구진이 이를 “orchestrator의 역할 변화”라고 부른 것은 아니다. 구현을 운영 관점에서 읽은 내 해석이다. Orchestrator를 첫 요청 앞에 놓인 별도 router로만 볼 필요는 없었다.

## 연구 결과는 과업에 따라 갈렸다

아래 연구는 single-agent와 multi-agent 구조 전반을 비교한다. Front-door router 한 번의 효과만 떼어 측정하지 않았고, 내가 쓰는 기준을 직접 증명하지도 않는다. 기준선을 먼저 만들고 조율 비용을 따로 재야 한다는 판단을 점검하는 데 썼다.

[OpenHands-Versa](https://aclanthology.org/2026.findings-eacl.318/)는 코딩, 리서치, 웹 탐색을 전문 agent로 나누지 않았다. OpenHands 기반 agent 하나에 shell, code execution, browser, search API와 file viewer를 붙였다. 긴 브라우저 기록을 압축하고 일정 step마다 진행 상황과 다음 계획을 다시 쓰게 했다.

이 시스템은 세 benchmark에서 기존 공개 전문 시스템과 경쟁하거나 `1.3~9.1%p` 앞섰다. 다만 비교 대상의 model과 비용이 같지는 않았다. “Single agent가 multi-agent를 이겼다”는 실험이 아니라, tool과 context를 잘 관리한 범용 agent가 유효한 기준선이 될 수 있다는 결과로 읽었다.

내가 가장 참고한 것은 2026년 7월 24일 [Nature Machine Intelligence에 게재된 연구](https://www.nature.com/articles/s42256-026-01268-y)다. Google Research·Google DeepMind·MIT 연구진이 여섯 개 과제, 다섯 가지 구조와 세 모델 계열의 `260개` 구성을 비교했다. Prompt와 tool interface, reasoning-token budget 상한을 맞췄다.

독립적으로 나누기 좋은 금융 분석에서는 중앙 조율 방식이 `80.8%` 좋아졌다. 앞 단계 판단이 다음 단계로 이어지는 순차 계획에서는 최대 `70%` 나빠졌고, SWE-bench Verified에서는 네 multi-agent 구조가 모두 single agent보다 낮았다. Agent 수보다 single-agent 기준선의 성능이 결과를 더 잘 설명했다.

이 결과만으로 single agent가 우월하다고 말할 수는 없다. 과업을 독립적으로 나눌 수 있는지와 현재 single-agent 기준선이 얼마나 강한지가 먼저였다. “복잡한 요청”이라는 이유만으로 agent 수를 늘리는 건 설명이 부족하다.

## 병렬 검색에서는 multi-agent가 맞았다

Anthropic 내부 평가에서는 [Research 시스템의 lead agent와 subagent 구성](https://www.anthropic.com/engineering/multi-agent-research-system)이 단일 Claude Opus 4보다 `90.2%` 높았다. 여러 회사를 동시에 조사하는 것처럼 독립적인 검색 갈래를 한꺼번에 훑는 과업이었다.

토큰 사용량도 공개했다. 일반 agent는 채팅보다 약 `4배`, multi-agent 시스템은 약 `15배` 많은 토큰을 사용했다. 모든 agent가 같은 context를 공유해야 하거나 작업 사이 의존성이 높은 영역은 잘 맞지 않았고, coding은 research만큼 병렬화할 수 있는 일이 많지 않다고 설명했다.

Anthropic은 이득의 주된 이유를 별도 context window에서 독립 검색을 병렬로 수행하고 더 많은 tool call과 추론 예산을 쓴 데서 찾았다. 조사 가치가 추가 비용보다 큰 과업이어야 한다는 조건도 붙였다.

이런 경우에는 나도 subagent를 쓴다. 처음부터 역할을 `Researcher`, `Writer`, `Reviewer`로 나누는 대신 실제로 동시에 실행할 수 있는 검색 갈래만 떼어낸다. 최종 판단과 사용자 응답은 primary agent가 맡는다.

## Router를 하나 추가할 때 실제로 늘어나는 것

Router의 model call 한 번은 작은 비용처럼 보인다. 운영에서는 그 뒤에 다른 비용이 붙는다.

잘못된 routing이라는 실패 유형부터 생긴다. 전문 agent가 답을 틀린 것인지 Router가 잘못 보낸 것인지 따로 판단해야 한다. 한 요청이 두 영역에 걸치면 한 곳만 고를지, 둘 다 호출할지, 최종 답은 누가 합칠지도 정해야 한다.

Context 전달 방식도 정해야 한다. 사용자 원문을 그대로 넘기면 다음 agent가 의도를 다시 해석한다. Router가 요약해서 넘기면 제약 조건이 빠질 수 있다. 이때 최종 실패만 보면 오분류인지, 전달 손실인지, 실행 agent의 오류인지 바로 알기 어렵다.

[SILO-BENCH](https://aclanthology.org/2026.acl-long.1354/)는 정보가 나뉜 환경에서 이 문제를 측정했다. Agent들은 활발하게 메시지를 주고받았지만 분산된 정보를 하나의 답으로 합치는 데 자주 실패했다. Agent 사이에 메시지가 오갔다는 사실만으로 필요한 정보가 전달됐다고 볼 수 없었다.

권한 경계도 복제될 수 있다. 여러 agent가 쓰기 tool을 공유하면 승인과 복구 규칙이 같은 수준으로 강제되는지 확인해야 한다. Primary agent 하나가 작업을 소유하면 승인 정책을 한 실행 경계에 둘 수 있다. 실제 권한 검사는 각 tool과 runtime에서도 막아야 한다.

[MAST 연구](https://proceedings.neurips.cc/paper_files/paper/2025/hash/b1041e52d3be19f0a9bc491657488e4a-Abstract-Datasets_and_Benchmarks_Track.html)는 일곱 multi-agent framework의 실행 trace `1,642개`에서 실패 유형 `14개`를 분류했다. Agent 사이의 정보 불일치와 검증 누락, 잘못된 종료가 별도 유형으로 나타났다. Agent 경계가 추가되면 routing과 전달, 합성은 각각 따로 평가해야 한다.

## 새 프로젝트에 적용하는 순서

![Single-agent에서 multi-agent로 확장하는 판단 순서](/images/posts/2026/2026-07-29-Router-First-Agent-Architecture/architecture-ladder.svg)

**1. Single agent로 기준선을 만든다.**

Primary agent에 필요한 tool과 skill을 붙인다. 비교 단위는 agent 수가 아니라 같은 사용자 과업이다. Model과 tool set, 최대 추론 예산을 고정하고 성공률과 p95 지연시간, 성공 건당 비용을 남긴다. 반복 횟수와 timeout, retry 조건도 같아야 한다.

**2. 실패 trace부터 나눈다.**

Tool을 잘못 골랐는지, 긴 context에서 조건을 놓쳤는지, 독립 작업이 순서대로 실행돼 느린지 구분한다. Tool schema와 노출 범위, checkpoint를 고쳐 해결되면 agent를 추가하지 않는다.

**3. 확인한 실패에 경계 하나만 추가한다.**

독립 검색을 동시에 돌려야 하면 subagent를 쓴다. 이후 대화의 소유권이 바뀌면 handoff를 쓴다. 첫 요청의 의미만으로 전문 영역을 나눠야 하고 분류 정확도가 검증됐다면 front-door Router를 검토한다. 권한 경계는 agent 선택과 별개로 코드와 tool runtime에서 강제한다.

**4. 같은 평가 세트로 다시 비교한다.**

Router를 붙인 실험에서는 오분류율과 원문 조건 유실, route별 재시도 횟수를 추가로 본다. 성공률이 조금 올라도 지연시간과 비용, 실패 복구 시간이 크게 늘면 운영상 이득이 아닐 수 있다. 차이가 없다면 다시 합친다.

고객 지원처럼 첫 요청의 영역이 명확하고 이후 전문 agent가 대화를 넘겨받는 서비스라면 front-door Router가 자연스럽다. 서로 다른 팀이 각자의 권한과 배포 주기로 agent를 운영한다면 agent 경계를 나눌 이유도 있다. 이때 담당 agent를 고르는 일이 의미 분류라면 검증된 Router를 쓰고, 권한으로 결정된다면 코드로 나눈다.

반면 일이 순차적이고 같은 context를 계속 봐야 한다면 한 agent가 끝까지 맡는 편이 단순하다. 역할 이름을 붙이기 전에 실제로 병렬화할 수 있는 작업인지, 경계 사이에 무엇을 전달해야 하는지부터 본다.

## 이 글이 아직 증명하지 못한 것

이 글은 통제된 운영 benchmark가 아니다. 설계 리뷰에서 약 1년간 사용한 기준을 공개 연구와 대조한 기록이다. 점검한 서비스의 trace와 수치를 공개할 수 없으므로 “Router를 빼면 성능이 오른다”는 주장은 하지 않는다.

인용한 연구도 front-door Router 하나의 효과를 직접 측정하지 않았다. OpenHands-Versa는 비교 대상의 model과 비용이 달랐고, Anthropic의 `90.2%`는 자사 Research 시스템의 내부 평가다. Nature 연구와 SILO-BENCH, MAST 역시 과제와 구조가 서로 다르다.

다음 단계는 직접 비교다. 같은 과업을 primary agent 하나, 고정 LLM Router, 필요할 때만 subagent를 쓰는 구조에 넣고 성공률과 비용, 지연시간을 재야 한다. 그때는 routing 오류와 조건 유실, 실패 복구 시간도 함께 남길 생각이다.

## 참고 자료

- [Choosing the Right Multi-Agent Architecture — LangChain](https://www.langchain.com/blog/choosing-the-right-multi-agent-architecture)
- [How we built our multi-agent research system — Anthropic](https://www.anthropic.com/engineering/multi-agent-research-system)
- [Magentic-One: A Generalist Multi-Agent System for Solving Complex Tasks — Microsoft Research](https://www.microsoft.com/en-us/research/publication/magentic-one-a-generalist-multi-agent-system-for-solving-complex-tasks/)
- [Coding Agents with Multimodal Browsing are Generalist Problem Solvers — Findings of EACL 2026](https://aclanthology.org/2026.findings-eacl.318/)
- [Why Do Multi-Agent LLM Systems Fail? — NeurIPS 2025](https://proceedings.neurips.cc/paper_files/paper/2025/hash/b1041e52d3be19f0a9bc491657488e4a-Abstract-Datasets_and_Benchmarks_Track.html)
- [Capable language models can outgrow the benefits of collaboration — Nature Machine Intelligence 2026](https://www.nature.com/articles/s42256-026-01268-y)
- [SILO-BENCH: A Scalable Environment for Evaluating Distributed Coordination in Multi-Agent LLM Systems — ACL 2026](https://aclanthology.org/2026.acl-long.1354/)
