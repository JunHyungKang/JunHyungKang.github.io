---
title: "Software engineering: efficiency vs. effectiveness"
url: https://www.youtube.com/watch?v=lqcKquUl3Wk
channel: Google for Developers
speaker: Addy Osmani
date: 2025-12-09
duration: 10m 6s
views: 29,904
likes: 1,907
series: "Effective Software Engineers (How to be an effective SWE)"
playlist: https://www.youtube.com/playlist?list=PLOU2XLYxmsILi7JehojdVv-WreC-TJtwj
processed_at: 2026-02-20
---

# Software engineering: efficiency vs. effectiveness

## 요약

Google 엔지니어링 리더 Addy Osmani가 **효율적인(efficient) 엔지니어**와 **효과적인(effective) 엔지니어**의 차이를 설명하는 10분 영상. 핵심 메시지는 "Efficient engineers do things right. Effective engineers do the right things."이며, output(산출물) 중심 사고에서 outcome(성과) 중심 사고로의 전환을 강조한다.

**주요 포인트 3가지:**
1. Efficiency(효율)는 과정(process)에, Effectiveness(효과)는 목적(objective)에 초점 — 둘 다 갖추는 것이 이상적
2. Output("코드 1000줄 작성") vs Outcome("전환율 15% 개선") — 진짜 가치는 outcome에서 온다
3. 커리어 성장에 따라 질문이 진화한다: "어떻게 구현하지?"(주니어) → "올바른 접근법인가?"(시니어) → "올바른 문제인가?"(Staff+)

## 시리즈 전체 구성 (Effective Software Engineers)

| # | 제목 | 길이 | 핵심 주제 |
|---|------|------|----------|
| 1 | Individual contributor or manager: choosing your engineering path | 5m | IC vs 매니저 경로 선택 |
| 2 | Strategic thinking for software engineers: outputs vs outcomes | 5m | 전략적 사고, output vs outcome |
| 3 | 5 engineering anti-patterns that limit your career | 6m | 커리어 성장을 막는 안티패턴 |
| 4 | How to become a "T-shaped" software engineer | 9m | T자형 엔지니어 모델 |
| 5 | 3 skills every early-career engineer needs | 6m | 초기 커리어 필수 스킬 |
| 6 | Software engineering: efficiency vs. effectiveness | 10m | 효율 vs 효과 (본 영상) |

## 인사이트

### 핵심 아이디어

**"사다리를 빠르게 올라가는 것보다, 올바른 벽에 기대어 있는지가 더 중요하다"**

Addy Osmani의 비유: "If you're only efficient, you might climb a ladder very quickly only to find it's leaning against the wrong wall." 이는 AI 시대에 특히 울림이 크다. 하루에 토큰을 얼마나 썼는지, 사이드 프로젝트를 몇 개 했는지는 output이다. 그 과정에서 실제로 어떤 문제를 해결했는지가 outcome이다.

**커리어 레벨별 사고의 진화:**
- Junior: "How do I implement this feature?" (실행 중심)
- Senior: "Is this the right approach to the problem?" (문제 해결 중심)
- Staff+: "Is this even the right problem to solve?" (전략 중심)

**효과적인 엔지니어의 10가지 특성:**
1. User-centric mindset — 사용자 공감 기반 기술 결정
2. Problem-solving ability — 근본 원인 파악과 확장 가능한 해결책
3. Simplicity — 복잡성은 팀에 대한 장기 부채
4. Communication — 복잡한 아이디어를 명확히 전달
5. Trust, autonomy, social capital — 신뢰와 협업 관계 구축
6. Strategic alignment — 팀 전략과 목표 깊이 이해
7. Independent prioritization — 자기주도적 우선순위 결정
8. Long-term thinking — 유지보수, 확장성, 기술 부채 고려
9. Scout rule — "Leave projects better than you found them"
10. Growth mindset — 모호함과 새 도전을 기회로 봄

**환경의 중요성:**
- Project Aristotle: 효과적인 팀의 핵심은 심리적 안전감(psychological safety)
- Project Oxygen: 좋은 매니저 = 코치, 팀 임파워먼트, 명확한 비전

### 적용 가능한 점

1. **일일/주간 회고 시 "outcome" 질문하기**: "오늘 무엇을 했는가?"가 아니라 "오늘 어떤 가치를 만들었는가?"
2. **AI 도구 사용 시 effectiveness 기준 적용**: 토큰 사용량이나 프로젝트 수가 아니라, 각 프로젝트가 해결하는 실제 문제에 집중
3. **커리어 레벨에 맞는 질문 연습**: 현재 자신의 레벨에서 한 단계 위 질문을 의식적으로 던져보기

## 전체 스크립트 (한글 번역)

[00:00] 좋은 소프트웨어 엔지니어와 진정으로 뛰어난 엔지니어를 구분하는 것이 무엇인지 궁금했던 적이 있나요? 저도 커리어 초기에 같은 궁금증을 가졌습니다. 안녕하세요, 저는 Addy Osmani입니다. 25년간 업계에 몸담아 온 Google 엔지니어링 리더입니다. Google에서 13년간 전 세계 팀을 이끌고 업계 최고의 엔지니어들과 일하면서, 이 질문은 기술적 역량이나 작성한 코드 줄 수를 넘어선다는 것을 배웠습니다. 답은 하나의 강력한 단어에 있습니다 — 효과성(effectiveness).

[01:02] 하지만 실제로 그것이 무엇을 의미할까요? 효과적인 엔지니어가 되고 싶다면, 영향력을 극대화하고, 커리어 성장을 가속화하며, 진정으로 중요한 소프트웨어를 만들고 싶다면, 어떤 구체적인 특성과 습관을 길러야 할까요? 오늘 Google과 다른 기업들에서 얻은 핵심 교훈을 공유하겠습니다.

먼저 중요한 구분부터 짚어보겠습니다. 첫째, **효율적(efficient)**이라는 개념이 있습니다. 효율적인 엔지니어는 **일을 올바르게(do things right)** 합니다. Bob이라는 예를 봅시다. Bob은 지시를 받아 완벽하게 따라 가구를 조립합니다. 빠르게 일하고, 실수 없이, 한 번에 제대로 해냅니다. 소프트웨어에서 이것은 빠르게 티켓을 닫고, 스펙에 맞는 깔끔한 코드를 작성하고, 확립된 프로세스를 벗어나지 않고 따르는 것입니다. 매우 가치 있는 일입니다.

하지만 동전의 다른 면이 있습니다 — **효과성(effectiveness)**. 효과적인 엔지니어는 **올바른 일을(do the right things)** 합니다. 효과적인 엔지니어는 더 큰 그림을 봅니다. "이것을 어떻게 만들까?"만 묻지 않고, "가장 큰 가치를 제공할 것을 만들고 있는가?"라고 묻습니다.

[02:20] 이것이 우리를 단순하지만 심오한 프레임워크로 이끕니다. **효율은 일을 올바르게 하는 것**이고, **효과는 올바른 일을 하는 것**입니다. 하나는 과정에, 다른 하나는 목적에 초점을 맞춥니다. 효율적이기만 하면 사다리를 매우 빠르게 올라가다가 잘못된 벽에 기대어 있었다는 것을 발견할 수 있습니다. 잘못된 일을 완벽하게 해서 노력을 낭비할 수 있습니다. 하지만 둘을 결합하면 최고의 성과를 달성할 수 있습니다.

[03:19] 이를 프레이밍하는 핵심 방법은 **산출물(output)보다 성과(outcome)에 집중**하는 것입니다. Output은 활동의 측정치입니다 — "코드 1,000줄을 작성했다." 무엇을 했는지는 알려주지만 어떤 가치를 만들었는지는 알려주지 않습니다. Outcome은 임팩트의 측정치입니다 — "전환율을 15% 개선했다." 결과와 사용자 및 비즈니스에 전달된 가치에 초점을 맞춥니다.

[04:07] 이 진화는 엔지니어가 커리어에서 성장할수록 명확해집니다. 주니어 엔지니어는 실행에 집중합니다 — "이 기능을 어떻게 구현하지?" 마이크로 최적화에 자부심을 느낍니다 — "이 함수를 최적화해서 5밀리초 빨라졌다." 시니어 엔지니어는 솔루션 자체를 비판적으로 생각하기 시작합니다 — "이것이 문제에 대한 올바른 접근인가?" "이 컴포넌트가 매 키 입력마다 리렌더링된다. 근본 원인을 고치자." Staff+ 엔지니어는 대화를 한 단계 더 끌어올립니다 — "이것이 풀어야 할 올바른 문제인가?" "클라이언트 사이드 복잡성과 전체 로드 시간을 줄이기 위해 이 로직을 서버 사이드로 옮기면 어떨까?"

[05:34] 효과적인 엔지니어의 핵심 특성들: 사용자를 생각하고, 뛰어난 문제 해결 능력을 가지며, 단순함을 추구하고, 커뮤니케이션을 잘하며, 신뢰·자율성·사회적 자본을 구축하고, 팀 전략과 목표를 깊이 이해하며, 독립적으로 우선순위를 정하고, 장기적으로 생각하며, 스카우트 룰("프로젝트를 발견한 것보다 더 나은 상태로 남긴다")을 실천하고, 새로운 도전을 기회로 받아들입니다.

[08:21] 엔지니어의 효과성은 환경에 의해서도 형성됩니다. Google의 Project Aristotle 연구에 따르면 효과적인 팀의 가장 중요한 요소는 **심리적 안전감(psychological safety)**입니다. Project Oxygen은 좋은 매니저의 특성 — 코칭, 팀 임파워먼트, 명확한 비전 — 이 모두 엔지니어가 효과적일 수 있는 환경을 만드는 것이라고 밝혔습니다.

[09:07] 효과적인 엔지니어가 되는 것은 여정입니다. 바쁜 것과 임팩트 있는 것의 차이, output과 outcome의 차이를 이해하는 것에서 시작합니다. "어떻게(how)"에서 "무엇을(what)"으로, 그리고 마침내 "왜(why)"로 관점을 진화시키는 것입니다. 기술적, 전략적, 커뮤니케이션 스킬의 조합을 길러 일을 올바르게 할 뿐만 아니라, 일관되게 올바른 일을 하는 것입니다.
