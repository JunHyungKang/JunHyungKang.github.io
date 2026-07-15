---
title: "29억 토큰을 처리하고도 371등: 자가개선 에이전트의 Local Optimum"
date: "2026-07-15"
teaser: "Codex 하네스는 약 7일간 29억 토큰을 처리하며 스스로 작업 방식을 개선했다. 하지만 개선할수록 더 안전한 작은 일에 갇혔다."
image: "/images/posts/2026/2026-07-15-Agent-Self-Improvement-Local-Optimum/seven-day-run.svg"
tags:
  - AI Agent
  - Agent Harness
  - Codex
  - Kaggle
  - Long-running Agent
---

## 결론부터: 자가개선은 올바른 방향을 보장하지 않는다

AI 에이전트에게 Kaggle 대회를 맡기면 어디까지 갈 수 있을까?

이번에는 문제 몇 개를 대신 풀게 하는 수준이 아니라, **대회 분석부터 전략 수립, 구현, 검증, 제출, 회고까지 장기 실행하는 에이전트 하네스**를 만들었다. 목표는 명확했다. NeuroGolf 2026에서 1등을 하는 것.

후반에는 Codex Goal을 중심으로 약 7일 동안 작업 루프를 거의 계속 돌렸다. 에이전트는 공개 자료를 찾고, 400개 모델을 분석하고, 후보를 구현하고, 제출 결과를 읽고, 실패 원인을 다음 규칙에 반영했다. 내가 자리를 비운 사이에도 다음 작업을 선택하고 artifact를 남겼다.

결과는 이랬다.

| 항목 | 최종 결과 |
|---|---:|
| 처리한 tokens | `2,908,485,828` |
| Public score | `7374.21` |
| Public rank | `371 / 3034` |
| 1위 점수 | `8179.99` |
| 1위와의 격차 | `805.78` |

토큰 수는 마지막 7일 구간의 로컬 Codex session log에서 메인 에이전트와 subagent의 `token_count` 누적 증가분을 합산한 값이다. 총 input은 약 `28.99억`, 그중 cached input은 약 `27.91억`으로 input의 약 `96.3%`였고, output은 약 `919만` tokens였다. 따라서 이 숫자는 API 청구량이나 비용이 아니라, 캐시를 포함해 하네스가 **처리한 전체 token usage**를 뜻한다.

**실행 지속성은 성공했고, 대회 목표는 실패했다.** 더 중요한 사실은 하네스가 실패를 겪을 때마다 실제로 개선됐는데도 1등과 가까워지지 않았다는 점이다.

검증 실패 뒤에는 validator가 강화됐고, 반복 작업 뒤에는 scanner가 생겼으며, 잘못된 선택 뒤에는 ranking rule이 추가됐다. 그런데 시스템이 개선될수록 위험한 가설은 더 빨리 제거됐고, 측정하기 쉬운 작은 최적화가 더 높은 순위를 차지했다.

> **Self-improvement도 local optimum에 빠진다.** 무엇을 개선할지 정의하는 평가 함수가 잘못되어 있으면, 에이전트는 목표가 아니라 현재 하네스가 보상하는 행동에 점점 더 능숙해진다.

이것이 이번 프로젝트의 핵심이다. 에이전트가 오래 일하게 만드는 것과, 오래 일한 결과가 목표에 수렴하게 만드는 것은 전혀 다른 문제였다.

![약 7일간의 NeuroGolf 에이전트 실행 요약](/images/posts/2026/2026-07-15-Agent-Self-Improvement-Local-Optimum/seven-day-run.svg)

---

## 무엇을 맡겼나

[NeuroGolf 2026](https://www.kaggle.com/competitions/neurogolf-2026)은 ARC-AGI의 400개 grid 변환 문제를 각각 ONNX 모델로 구현하는 대회다. 정답뿐 아니라 실행 중 사용하는 메모리와 파라미터가 작아야 높은 점수를 받는다.

처음에는 400개 문제를 에이전트가 하나씩 풀면 된다고 생각했다. 하지만 실제 경쟁은 다음에 더 가까웠다.

- 공개된 고득점 portfolio를 계속 추적한다.
- 400개 모델 중 개선 여지가 큰 slot을 찾는다.
- ONNX graph를 역공학해 더 싼 표현을 설계한다.
- local 정답, hidden risk, runtime 호환성을 따로 검증한다.
- 실제 제출로 positive ablation인지 확인한다.
- 실패를 다음 탐색의 입력으로 바꾼다.

즉, 이 프로젝트의 핵심은 ONNX 모델 한 개가 아니라 **장기간 경쟁 상태를 관찰하고 스스로 작업을 이어가는 시스템**이었다.

---

## 7일 동안 실제로 돌아간 하네스

대화 context만으로 장기 작업을 이어갈 수는 없었다. 세션이 바뀌면 같은 문제를 다시 분석했고, 이미 실패한 접근을 반복했으며, 오래된 leaderboard를 기준으로 엉뚱한 최적화를 시작했다.

그래서 기억을 문서 하나가 아니라 실행 가능한 여러 층으로 나눴다.

- `Goal`: 무엇을 달성해야 하는지와 완료 조건
- `AGENTS.md`: 프로젝트 전체의 운영 원칙과 금지선
- repo-local skills: 분석, ONNX 설계, 검증, 제출 기록, 회고 절차
- scripts: ranking, 비용 계산, archive 검증, 반복 검사
- wiki와 ledger: 근거, 실패, 점수, provenance
- subagents: 규칙 추론, graph review, hidden-risk review의 독립된 역할

매 loop는 최소 하나의 구체적인 artifact를 남기도록 했다. 분석만 하다가 끝나는 세션을 막기 위해서였다.

![NeuroGolf 장기 실행 에이전트 하네스의 피드백 루프](/images/posts/2026/2026-07-15-Agent-Self-Improvement-Local-Optimum/harness-loop.svg)

이 구조는 실제로 효과가 있었다. 에이전트는 세션이 바뀌어도 root submission을 보호했고, 이전 실험의 hash와 점수를 찾았으며, 실패한 operator 조합을 다시 제출하지 않도록 validator와 ranking rule을 수정했다.

무엇보다 **쉬지 않고 다음 일을 찾는 시스템**은 만들 수 있었다.

---

## Self-improvement도 local optimum에 빠진다

### 1. Goal보다 하네스의 평가 함수가 더 강했다

나는 Goal에 “1등을 하라”고 썼다. 그러나 에이전트의 실제 행동을 결정한 것은 문장이 아니라 ranking과 gate였다.

하네스는 다음을 잘 보상했다.

- 공식 비용이 얼마나 줄었는가
- local exact와 random equivalence를 통과했는가
- 현재 root를 망가뜨릴 위험이 낮은가
- 이번 loop에서 검증 가능한 artifact를 남겼는가

반대로 새로운 representation이나 학습형 모델처럼 성공 가능성은 낮지만 upside가 큰 시도는 불확실해서 계속 뒤로 밀렸다.

Goal은 공격적이었지만 평가 함수는 보수적이었다. 에이전트는 자연스럽게 “1등에 필요한 큰 변화”보다 “증명 가능한 작은 개선”을 선택했다.

### 2. 하네스가 점점 잘못된 일을 잘하게 됐다

초기에는 local exact 모델을 많이 만드는 데 집중했다. 공개 reference보다 비싼 모델이라는 사실을 뒤늦게 반영하자, 다음에는 reference보다 싼 slot만 찾도록 ranking을 고쳤다.

검증 실패가 나오면 gate를 추가했고, runtime 오류가 나오면 compatibility scanner를 추가했다. 이 과정은 합리적이었다. 문제는 실패를 막는 장치가 늘어날수록 탐색 공간도 함께 줄었다는 점이다.

후반의 하네스는 아주 안정적이었다. root archive를 보호했고, 잘못된 제출을 줄였으며, 작은 compiler optimization을 정확히 누적했다. 하지만 800점이 넘는 격차 앞에서 `+0.01`, `+0.02`를 안전하게 쌓는 시스템은 1등 전략이 아니었다.

![시간이 지날수록 exploitation에 치우친 작업 선택](/images/posts/2026/2026-07-15-Agent-Self-Improvement-Local-Optimum/explore-exploit.svg)

### 3. Exploration을 의지가 아니라 예산으로 만들지 않았다

중간에 여러 번 “학습형 ONNX를 더 시도하자”, “exploration 비중을 높이자”고 Goal을 수정했다. 하지만 exploration queue에 별도의 시간, 병렬 subagent, 실패 허용량을 강제로 배정하지 않았다.

그 결과 급한 제출과 확실한 cost reduction이 생기면 exploration은 다시 밀렸다. **시간이 남으면 탐색한다는 규칙은 탐색하지 않겠다는 규칙과 거의 같았다.**

### 4. 공개 reference가 너무 강력한 local optimum이었다

공개된 고득점 submission을 managed reference로 삼은 것은 좋은 안전장치였다. 하지만 동시에 모든 생각을 “이 모델의 한 slot을 어떻게 조금 더 줄일까?”로 제한했다.

Portfolio 전체를 새로 생성하는 방법, 여러 task에 재사용되는 compiler, 학습형 표현처럼 판을 바꿀 가능성이 있는 작업보다 taskwise graft와 micro surgery가 계속 우선됐다.

기준선은 지켜야 할 바닥이었는데, 어느 순간 연구의 천장이 됐다.

---

## 중간에 하네스를 어떻게 바꿨나

실패를 인식할 때마다 하네스도 수정했다.

### 정답과 개선 가치를 분리했다

local example을 모두 맞힌 모델도 public reference의 같은 task보다 비싸면 교체하지 않았다. task별 기록에 `correctness`와 `reference replacement value`를 별도 필드로 두었다.

### 파일 크기 대신 공식 비용을 계산했다

ONNX byte size가 작아도 중간 tensor가 크면 점수가 나빠졌다. 이후 모든 비교를 공식 `memory + params` 기준으로 바꾸고, reference task별 cost ranking을 만들었다.

### 실패를 문서가 아니라 gate로 바꿨다

사람 눈으로 같은 grid가 나오는 것과 competition의 raw output이 같은 것은 달랐다. 한 후보는 visible output `268/268`을 맞혔지만 strict raw output은 `0/268`이었고, public score가 `15.90` 하락했다.

이후 validator에 strict one-hot, zero-hot padding, argmax-only를 분리한 검사를 추가했다. 로컬에서는 동작했지만 Kaggle에서 오류가 난 integer `TopK` 조합도 compatibility hard stop으로 만들었다.

### 학습형 모델에 complete-graph gate를 추가했다

작은 neural head가 곧 작은 ONNX 프로그램은 아니었다. 한 QLinearConv 후보는 학습 데이터와 local task를 정확히 맞혔지만, feature construction과 renderer까지 포함하자 reference cost `8426`보다 큰 `10665`가 됐다.

그 뒤에는 학습 전에 complete graph의 메모리, 파라미터, feature 생성 비용을 먼저 추정하도록 바꿨다.

### subagent를 역할별로 분리했다

같은 질문을 여러 모델에 던지는 대신 task rule, ONNX feasibility, hidden risk, pre-submit review를 나눴다. 빠른 모델은 metadata와 triage에, 강한 모델은 “불가능하다”는 결론을 뒤집을 가치가 있는 어려운 판단에 배치했다.

이 수정들은 하네스를 분명 더 견고하게 만들었다. 다만 **견고함이 곧 목표 달성 가능성은 아니었다.**

---

## 결과를 어떻게 해석해야 하나

최종 `7374.21` 전체가 에이전트가 처음부터 만든 400개 모델의 점수는 아니다. 공개 submission을 기준 portfolio로 사용했고, 공개된 task 모델과 graph surgery를 검증해 조합한 비중이 컸다.

에이전트가 직접 만든 확실한 기여는 그 위에서 동작했다.

- 400개 graph의 op family와 공식 비용 분석
- taskwise provenance와 SHA를 보존하는 submission ledger
- public reference 위의 focused ablation 절차
- strict output과 runtime compatibility 검증
- INT32 index lane, cast sinking, `GatherND(batch_dims)` 같은 작은 graph surgery
- 실패를 ranking, scanner, skill로 환류하는 self-improvement loop

실제 local-generated compiler batch가 public score를 `7374.19 → 7374.21`로 올리기도 했다. 작은 변화지만, 에이전트가 가설을 만들고 구현하고 독립 검토 후 제출해 root를 승격한 end-to-end 결과였다.

그러나 1등과의 격차는 `805.78`이었다. 따라서 정직한 결론은 이렇다.

> 에이전트는 장기간 자율적으로 운영 가능한 연구·실험 파이프라인을 만들고 개선했다. 하지만 그 파이프라인이 선택한 연구 포트폴리오는 1등에 필요한 위험과 upside를 감당하지 못했다.

---

## 이번에 얻은 인사이트

### 장기 실행의 병목은 기억보다 작업 선택이다

memory, wiki, ledger가 잘 갖춰지면 반복 실수는 줄어든다. 하지만 과거를 잘 기억하는 시스템이 미래의 가장 좋은 행동을 고르는 것은 아니다. 장기 에이전트의 핵심 병목은 context 보존에서 **portfolio allocation**으로 이동한다.

### Goal prompt는 운영체제가 아니다

Goal은 방향을 말할 뿐이다. 실제 행동은 ranking metric, validator, artifact 정의, stop rule이 만든다. Goal과 하네스의 평가 함수가 다르면 하네스가 이긴다.

### 안전성만 개선하면 탐색 능력은 줄어든다

실패할 때마다 validator를 강화하면 검증은 좋아진다. 하지만 시스템은 “더 안전한 시스템”으로만 자가 개선될 수 있다. 탐색 능력, 가설 다양성, 기대값 추정도 명시적인 개선 대상이어야 한다.

### Exploration은 별도 SLA가 필요하다

다시 한다면 자원의 예를 들어 `60% exploit / 40% exploration`처럼 두 queue를 분리하고, exploration이 실패해도 정해진 예산까지는 중단하지 않게 할 것이다. 동시에 각 탐색에는 wall-clock limit과 중간 checkpoint를 둬 무한 실험을 막는다.

### 진행률과 목표 도달률은 다르다

매 loop마다 artifact가 생기면 시스템은 매우 생산적으로 보인다. 그러나 artifact 수와 1등 가능성은 무관할 수 있다. “이번 작업이 남은 격차를 얼마나 줄일 수 있는가?”를 계속 다시 계산해야 한다.

---

## 다시 한다면 이렇게 설계할 것이다

1. **첫날에 승리 경로를 세 갈래로 둔다.** 안전한 graph surgery, 재사용 가능한 family compiler, 고위험 learned/hybrid portfolio를 병렬 운영한다.
2. **탐색 예산을 강제한다.** Goal 문구가 아니라 scheduler가 exploration 몫을 보장하게 한다.
3. **매일 전략 감사를 한다.** 현재 속도로 마감까지 줄일 수 있는 점수와 1위 격차를 비교하고, 불가능하면 작업 분포를 바꾼다.
4. **하네스 개선의 목적을 분리한다.** 안전성 개선과 탐색력 개선을 각각 측정한다.
5. **공개 reference는 guardrail로만 쓴다.** taskwise 최적화와 별개로 portfolio generator를 계속 돌린다.
6. **중단 조건도 목표의 일부로 둔다.** 기대값이 사라지면 micro optimization을 이어가는 대신 결과를 정리하고 다음 프로젝트로 이동한다.

---

## 마치며

이번 프로젝트에서 가장 놀라웠던 것은 에이전트가 약 7일간 계속 일했다는 사실 자체가 아니었다. **계속 일하는 시스템도 얼마든지 잘못된 방향으로 정교해질 수 있다는 점**이었다.

강한 모델, 긴 context, 많은 subagent, 잘 정리된 wiki만으로는 충분하지 않았다. 장기 실행 에이전트의 성능은 결국 목표, 작업 선택, 평가, 실패 예산, 피드백 구조를 포함한 전체 하네스의 성능이었다.

1등은 하지 못했다. 대신 “에이전트를 오래 돌리는 방법”과 “에이전트가 목표에 수렴하게 만드는 방법” 사이에 어떤 간극이 있는지 실제 경쟁 환경에서 확인했다.

다음에는 단순히 멈추지 않는 에이전트가 아니라, **자신이 안전한 일에만 갇히고 있는지 감지하고 탐색 비중까지 스스로 재조정하는 에이전트**를 만들어보고 싶다.

---

## 참고 자료

- [The 2026 NeuroGolf Championship](https://www.kaggle.com/competitions/neurogolf-2026)
- [ARC-AGI](https://arcprize.org/arc-agi)
- [ONNX](https://onnx.ai/)
