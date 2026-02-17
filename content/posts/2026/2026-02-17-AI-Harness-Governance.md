---
title: "코드를 덜 쓰고 규칙을 더 쓰는 시대: AI 코딩 어시스턴트 하네스 거버넌스 설계기"
date: "2026-02-17"
teaser: "Cursor·Codex·Claude Code를 오가며 느낀 진짜 병목은 모델 성능보다 운영 모델의 불일치였다. 특히 skills 계층의 비대칭까지 포함해, 개인 취향과 팀 표준을 분리하는 실전 거버넌스 구조를 정리한다."
image: "/images/posts/2026/2026-02-17-AI-Harness-Governance/cover.png"
tags:
  - AI Engineering
  - Coding Assistant
  - Claude Code
  - Codex
  - Cursor
  - Governance
  - Context Engineering
---

## 결론부터

이 글의 결론은 단순합니다. AI 코딩 생산성의 병목은 모델 성능보다 운영 방식의 불일치에서 먼저 생깁니다.
그래서 팀 프로젝트에서는 도구를 Claude Code로 맞추고, 여전히 남는 문제는 Team 규칙과 Personal 취향의 경계를 합의하는 방식으로 풀었습니다.
사이드 프로젝트는 완전 통일보다, 내가 유지 가능한 수준으로 타협해 계속 굴러가게 만드는 쪽이 현실적이었습니다.

---

## 시작하며: 요즘 내가 코드를 덜 쓰는 이유

예전에는 프레임워크를 바꿔가며 모델을 학습했다면,
요즘은 도구를 바꿔가며 에이전트를 학습시키는 데 더 많은 시간을 쓰고 있습니다.

Cursor를 쓰다가 Antigravity로 넘어가고,
Claude Code에서 hook과 plugin을 붙여 쓰다가,
다시 Codex까지 오가다 보니 한 가지가 분명해졌습니다.

> 문제는 "어떤 모델이 더 똑똑한가"가 아니었습니다.
> 문제는 "내가 만든 작업 방식이 도구를 바꿔도 유지되는가"였습니다.

같은 문장을 규칙 파일에 넣어도 동작은 달랐고,
같은 이름의 기능이라도 실행 경로와 우선순위는 제각각이었습니다.

---

## 내가 특히 막혔던 지점: skills는 생각보다 비대칭이다

처음에는 rules와 hooks만 맞추면 될 줄 알았습니다.
그런데 실제 운영에서는 **skills 계층**이 더 크게 작용했습니다.

### Claude Code 쪽에서 보인 특징

공식 문서 기준으로 Claude Code의 skills는 스코프가 분명합니다.

- 개인: `~/.claude/skills/<skill>/SKILL.md`
- 프로젝트: `.claude/skills/<skill>/SKILL.md`
- 플러그인: `<plugin>/skills/<skill>/SKILL.md`

여기서 중요한 포인트는 plugin skills입니다.
plugin이 활성화되면 skill이 자동 발견되고, `plugin-name:skill-name` 네임스페이스로 충돌도 피합니다.
즉, "기능 묶음(plugin) + 실행 단위(skill)"를 함께 배포하기가 좋습니다.

### Codex 쪽에서 확인한 특징

Codex도 skills 자체는 있습니다.
다만 문서 구조를 보면 중심은 plugin 번들보다 **디렉터리 기반 skills 발견 모델**에 가깝습니다.

- repo: `.agents/skills` (현재 디렉터리에서 루트까지 탐색)
- user: `$HOME/.agents/skills`
- admin: `/etc/codex/skills`
- system: 내장 skills

그리고 AGENTS.md는 재사용 가능한 호출형 skill이라기보다,
"세션 시작 시 로드되는 지속 지침"에 가깝습니다.

정리하면, 제 체감은 이렇습니다.

- Claude Code: 신뢰할 만하게 패키징된 plugin·skill 자료가 많아서, 잘 골라 붙이면 바로 굴러가는 경험이 강함
- Codex: skill 자체는 있지만 plugin처럼 묶여 공유되는 단위보다 단건 skill을 가져다 쓰는 흐름이 더 익숙해서, 결국 내가 직접 만들고 커스터마이징하는 비중이 커짐

그래서 "Claude에서 하던 skill 배포 방식이 Codex에서도 동일하게 먹을 것"이라고 가정하면,
생각보다 빨리 깨집니다.

---

## 왜 설정 피로가 생기나: 같은 단어, 다른 의미론

아래 표는 제가 실제로 문제를 겪었던 축만 요약한 겁니다.

| 축 | Claude Code | OpenAI Codex | Cursor |
|---|---|---|---|
| 규칙/메모리 파일 | `CLAUDE.md`, `.claude/rules/*.md` | `AGENTS.md`, `AGENTS.override.md` | Project/User/Team Rules, `.cursor/rules` |
| 실행 제어 | hooks + skills + subagents | AGENTS 지침 + rules + MCP + skills | rules 중심 + 모드/자동적용 |
| skills 확장 관점 | plugin skills가 1급 구성요소 | 디렉터리 기반 skills 중심(문서상) | 자체 rule/workflow 중심 |

핵심은 단순합니다.

**문장 이식성과 동작 이식성은 다릅니다.**
같은 모양의 플러그라도 전압이 다르면 그대로 꽂아 쓰기 어렵듯, 규칙 문장이 같아도 실행 의미론이 다르면 결과는 달라집니다.

---

## 경계를 먼저 나누면 훨씬 덜 꼬인다

여기서부터는 제가 지금 실제로 쓰는 기준입니다.

### 1) Team Contract (팀 공유)

- 코드베이스 재현성과 협업 규칙
- 테스트 기준, PR 규칙, 디렉터리별 컨벤션
- 팀원이 바뀌어도 유지되어야 하는 공통 작업 방식

### 2) Personal Preference (개인 로컬)

- 말투, 작업 습관, 개인 생산성 최적화
- 공유할 필요가 없는 것들
- 각자 잘 맞는 도구 사용감(모드 선호, 워크플로 템포 등)

기준은 간단합니다.

> 팀 전체 결과에 직접 영향을 주면 Team, 아니면 Personal.

---

## 내가 정착한 구조: 단순화된 운영과 남은 고민

원래는 도구를 통일하려 하지 않고,
차이를 관리 가능한 구조로 묶는 쪽이 훨씬 현실적이라고 봤습니다.

그런데 이건 이 블로그 프로젝트 얘기가 아니라,
회사에서 진행하는 팀 프로젝트 맥락에서 나온 판단이었습니다.
동료들과 이야기한 뒤 그 프로젝트는 Claude Code를 주력으로 맞추기로 했고,
운영은 실제로 꽤 단순해졌습니다.

다만 단순해졌다고 고민이 사라진 건 아니었습니다.
여전히 "이건 팀 공통 규칙인가, 내 개인 취향인가"를 매번 스스로 구분해야 했습니다.
그리고 이 기준을 서로 공유하는 과정에서,
각자가 편한 방식만 주장하는 게 아니라 특정 프로젝트 개발에 맞는 최적의 하네스를 함께 찾아간다는 효능도 분명히 느꼈습니다.

도구를 혼용하던 시기에는, 원본 정책은 하나로 두고(SSOT), 도구별로 변환하고(Adapter), 결과를 검증하는(Verification) 방식도 실제 운영안으로 검토했습니다.
지금은 팀이 Claude Code를 주력으로 쓰고 있어서 이 구조를 그대로 실행하지는 않습니다.
다만 나중에 서로 다른 서비스를 쓰고 싶은 동료들과 협업하게 되면,
그때 다시 꺼내 볼 수 있는 설계안이라고 생각합니다.

---

## skills를 둘러싼 현실: 정답보다 합의가 더 어렵다

요즘은 좋은 스킬과 플러그인이 너무 빠르게 공유됩니다.
그래서 "무엇이 정답인가"보다 "무엇이 우리에게 맞는가"를 설명하는 일이 더 어렵고, 그걸 팀 합의로 번역하는 과정이 더 어렵습니다.

솔직히 말하면, 이 지점이 기술적인 문제라기보다 심리적인 부담으로 다가올 때가 있습니다.
"내가 편한 방식을 주장하는 것처럼 보이지 않을까"라는 생각이 들기 때문입니다.

그래서 저는 이제 이렇게 정리합니다.

- 팀 프로젝트: 도구를 Claude Code로 맞췄다면, Team/Personal 경계만 합의한다.
- 사이드 프로젝트: 완전 통일보다는 유지 가능한 수준의 관리만 남긴다.

현재 제 사이드 프로젝트 운영은 타협적인 형태입니다.

- Claude Code 세팅을 기본으로 유지
- 모델은 프록시로 Codex도 함께 사용
- 스킬은 되도록 프로젝트 레벨에서 관리
- 워크스페이스 레벨에서는 스킬 검색/배치용 커스텀 스킬로 보조
- README를 훅으로 자동 갱신해 한눈에 보이게 유지

완벽한 구조는 아니지만, 지금의 저에게는 "계속 굴러가는 구조"입니다.
그리고 이 정도 타협이 있어야 실제 개발을 이어갈 수 있었습니다.

---

## 트레이드오프와 한계

- 초기에 설계 비용이 큽니다.
- 도구 간 의미론을 1:1로 완전히 맞추는 건 어렵습니다.
- 동기화는 쉬워도, 동작 동치는 결국 검증으로만 확보됩니다.
- 도구 문서와 생태계 변화가 빨라 유지보수가 필요합니다.

그리고 가장 현실적인 한계도 있습니다.
명절처럼 오랜만에 여유가 생겨 "개발 좀 해야지" 하고 앉았는데,
정작 코드보다 하네스(환경/설정)를 만지는 시간이 더 길어지는 날이 반복됩니다.

저도 한동안은 이걸 제 개인 비효율로 받아들였는데,
지금은 그렇게만 보지 않습니다.
이건 제가 게을러서라기보다,
지금 우리가 겪는 에이전트 개발 문화의 과도기적 비용에 더 가깝다고 생각합니다.

---

## 마무리

예전에는 코드를 얼마나 빨리 쓰느냐가 제 생산성의 기준이었습니다.
지금은 다릅니다.

- 어떤 규칙을 어디에 둘지,
- 어떤 능력을 skill로 묶어 배포할지,
- 그리고 이걸 어떻게 검증할지,

이 세 가지가 제 작업 속도를 더 크게 좌우합니다.

다만 최근에는 한 가지를 더 배웠습니다.
모든 걸 일반화해 해결하려고 하면 오히려 오래 걸린다는 점입니다.
팀 프로젝트라면 팀 합의에 맞게 단순화하고,
사이드 프로젝트라면 내가 유지 가능한 수준으로 타협하는 게 현실적이었습니다.

그래서 지금의 제 결론은 이 문장으로 정리됩니다.

**정답을 찾기보다, 팀과 나에게 맞는 운영 경계를 먼저 정하자.**

---

## 참고 자료

- [Claude Code Skills](https://code.claude.com/docs/en/skills)
- [Claude Code Plugins Reference](https://code.claude.com/docs/en/plugins-reference)
- [Claude Code Memory](https://code.claude.com/docs/en/memory)
- [Claude Code Settings](https://code.claude.com/docs/en/settings)
- [Claude Code Hooks](https://code.claude.com/docs/en/hooks)
- [OpenAI Codex CLI](https://developers.openai.com/codex/cli)
- [OpenAI Codex Skills](https://developers.openai.com/codex/skills)
- [OpenAI Codex AGENTS.md Guide](https://developers.openai.com/codex/guides/agents-md)
- [OpenAI Codex Rules](https://developers.openai.com/codex/rules)
- [Cursor Rules Docs](https://docs.cursor.com/en/context/rules)
- [rulesync (GitHub)](https://github.com/jpcaparas/rulesync)
- [skills CLI Docs](https://skills.sh/docs/cli)
- [add-skill](https://add-skill.org/)
