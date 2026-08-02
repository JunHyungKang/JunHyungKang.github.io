---
title: "사내 AX 전담조직이 모든 Agent를 만들면 생기는 병목"
date: "2026-08-02"
teaser: "중앙 AX팀이 업무별 Agent 구현까지 전부 소유하면 초기에는 빠르지만 운영 단계에서는 변경 대기열이 길어진다. 중앙팀과 업무조직이 각각 무엇을 소유해야 하는지 정리했다."
image: "/images/posts/2026/2026-08-02-Enterprise-AX-Ownership-Boundary/ownership-boundary.svg"
contentType: "운영 모델"
evidence: "2026 Work Trend Index와 Microsoft·OpenAI·AWS가 공개한 Agent 운영 모델을 대조해 중앙 AX팀과 업무조직의 소유권 경계를 정리했습니다."
tags:
  - AX
  - AI Agent
  - Operating Model
  - AI Platform
  - AI Governance
---

## Agent 수보다 변경 권한을 먼저 본다

현재 회사에서 새로운 AI 기술을 미리 살펴보고 실제 사업에 연결하는 조직에서 일한다. 나는 그중 Agent가 업무 맥락을 가져오는 온톨로지 기반 지식 플랫폼을 구축하고 있다.

이 일을 하며 사내 Agent 도입을 지원하는 기술 조직이 어디까지 직접 만들고, 어디서부터 업무팀에 소유권을 넘겨야 하는지 자주 생각하게 됐다.

사내 AX 전담조직이 업무별 Agent를 전부 만들어 주면 초기에는 빠르다. 모델과 보안, 배포 경험이 한 팀에 모여 있고 비슷한 시행착오도 반복하지 않을 수 있다.

업무가 늘기 시작하면 상황이 달라진다. 현업의 정책 변경과 예외 처리, 데이터 품질 문제, 장애 대응까지 중앙 AX팀의 작업 대기열에 쌓인다. Agent 하나를 배포한 뒤에도 업무는 계속 바뀌기 때문이다.

사내 Agent 과제가 몇 개의 PoC를 넘어 부서별 운영 서비스로 늘어나는 시점에는 구현 방식보다 이 소유권 구조가 먼저 문제가 된다.

그러면 중앙팀은 공통 기반을 만드는 팀이 아니라 여러 부서의 요구사항을 대신 구현하는 SI 조직에 가까워진다. 현업은 작은 정책 하나를 바꿀 때도 AX팀의 우선순위를 기다린다. AX팀은 업무 맥락을 다시 전달받느라 시간을 쓴다.

내가 사내 AX의 기본 구조를 잡을 때 먼저 보는 것은 Agent 수가 아니다.

**이 Agent의 업무 결과를 누가 책임지고, 업무 규칙이 바뀌었을 때 누가 직접 고칠 수 있는가.**

회사마다 AI CoE, AX실, AI Platform 팀처럼 이름은 다르다. 이 글에서는 전사 공통 역량을 맡은 조직을 중앙 AX팀, 실제 업무와 결과를 맡은 조직을 도메인 팀이라고 부르겠다.

실제로는 CoE와 플랫폼 엔지니어링 조직을 분리할 수도 있다. CoE는 기준과 교육을 맡고 플랫폼팀은 실행 환경을 운영한다. 여기서는 업무별 Agent를 납품하는 조직과 구분하기 위해 두 기능을 중앙 AX팀으로 묶었다.

## 중앙팀이 Agent 공장이 되는 과정

처음 몇 개 과제는 중앙집중형이 합리적이다. 아직 보안 기준과 배포 방식이 없고 Agent를 운영해 본 엔지니어도 적다. 한 팀에서 기술 선택과 구현을 맡으면 빠르게 기준을 만들 수 있다.

문제는 이 방식을 기본 운영 모델로 굳힐 때 생긴다.

구매 Agent는 역할 경계를 설명하기 위해 만든 가상의 예시다. 이 Agent가 발주 규정을 읽고 ERP에 주문을 만든다고 해보자. 첫 구현이 끝난 뒤에는 금액별 승인선이 바뀐다. 특정 공급사 예외가 추가되고 ERP 필드와 권한 정책도 달라진다. 주문이 실패했을 때 누가 재처리할지, 이미 생성된 주문을 어떻게 취소할지도 정해야 한다.

이 변경을 모두 AX팀이 받아 구현하면 업무 흐름은 다음처럼 된다.

`구매팀의 변경 → AX팀 설명 → 구현 대기 → 구매팀 검수 → 예외 발견 → AX팀 재작업`

병목은 모델 호출이나 Agent 코드에서만 생기지 않는다. 업무를 가장 잘 아는 팀과 코드를 바꿀 수 있는 팀이 분리되면서 생긴다. 중앙팀이 여러 도메인의 작업 대기열과 운영 책임을 함께 들고 있으면 Agent가 늘수록 전달 비용도 같이 늘어난다.

Microsoft가 2026년 7월 14일 업데이트한 [Agentic Center of Excellence 가이드](https://learn.microsoft.com/en-us/agents/center-of-excellence/)도 모든 변경을 중앙에서 심사하는 CoE를 대표적인 실패 형태로 든다. 안전한 경로를 만드는 대신 모든 요청의 gatekeeper가 되면 중앙팀이 병목이 되고 업무조직은 승인 경로 밖에서 별도 Agent를 만들기 시작한다는 설명이다.

조직 운영이 AI 성과와 연결된다는 조사도 있다. Microsoft의 [2026 Work Trend Index](https://www.microsoft.com/en-us/worklab/work-trend-index/agents-human-agency-and-the-opportunity-for-every-organization)는 10개국에서 AI를 쓰는 근로자 2만 명을 조사했다. 응답자가 보고한 AI 성과와의 연관성을 분석했더니 조직 문화와 관리자 지원, 구성원 평가·육성 방식 같은 조직 요인이 67%를 차지했다. 개인의 태도와 행동은 32%였다.

이 조사는 중앙 AX팀의 병목을 직접 측정한 것은 아니다. 그래도 AX 성과를 몇몇 개인의 Agent 활용 능력만으로 설명하기 어렵다는 배경은 된다.

## 중앙화할 것은 구현 요청이 아니라 공통 실행 기반이다

중앙 AX팀이 필요 없다는 뜻은 아니다. 오히려 Agent가 외부 시스템을 읽고 쓰기 시작하면 전사 공통으로 강제해야 할 항목이 더 많아진다.

내가 중앙 AX팀에 두는 것은 Agent별 신원과 최소 권한, 승인된 tool·connector의 등록 방식, 실행 환경과 비밀정보 관리다. 공통 실행 이력 형식과 평가·비용 관측, Agent registry와 배포 기준도 중앙에서 만든다.

중앙팀은 중단 요청과 복구 작업을 추적하는 공통 경로를 제공할 수 있다. 실제로 무엇을 취소하고 어떤 업무 상태로 되돌릴지는 업무팀이 정해야 한다.

OpenAI도 2026년 7월 [Agent 시대의 AI 투자 원칙](https://openai.com/index/managing-ai-investments-in-agentic-era/)에서 identity, trusted connector, curated knowledge, eval, observability, model routing, 재사용 가능한 Agent 패턴을 중앙에서 투자할 공통 역량으로 분류했다. 각 업무팀이 인증과 관측, 평가 도구를 매번 새로 만드는 것은 자율성이 아니라 중복이다.

다만 중앙에서 공통 기반을 제공하는 것과 업무별 Agent를 대신 운영하는 것은 다른 일이다. **중앙 통제는 회의와 티켓 대기열이 아니라 실행 환경에서 강제돼야 한다.**

| 경계 | 중앙 AX팀이 소유할 것 | 도메인 팀이 소유할 것 |
| --- | --- | --- |
| 업무 목표 | 전사 우선순위 기준과 위험 등급 | 해결할 업무, 사용자, 성공 지표 |
| 지식 | 저장·검색·권한·갱신을 위한 공통 기반 | 어떤 문서가 정답인지, 내용의 정확성과 최신성 |
| Tool | 인증, 등록, schema와 감사 기준 | 업무 API의 의미, 입력 제약과 실패 처리 |
| 평가 | 실행기, 데이터 형식, 회귀 검사와 대시보드 | 실제 실패 사례, 정답 기준과 허용 가능한 오차 |
| 운영 | 공통 실행 환경, 관측, 비용과 보안 정책 | 업무별 장애 대응, 예외 처리, 개선과 폐기 결정 |

`curated knowledge`를 중앙 역량으로 분류해도 지식의 정답까지 중앙팀이 소유할 수는 없다. 검색 인프라와 접근 정책은 중앙에서 제공할 수 있지만 “이 규정이 아직 유효한가”를 판단할 책임은 도메인에 남아야 한다.

평가도 역할이 나뉜다. 중앙팀은 eval을 실행하고 기준 미달 배포를 막는 체계를 만들 수 있다. 어떤 답이 실제 업무에서 틀렸는지, 어떤 예외를 반드시 통과해야 하는지는 도메인 팀이 정해야 한다.

구매 Agent의 `create_order` tool을 예로 들면 중앙팀은 Agent별 접근 권한과 인증 정보 전달 방식, 감사 로그 형식을 표준화할 수 있다. 재시도 때문에 같은 주문이 두 번 만들어지지 않게 하는 처리는 구매 시스템을 맡은 팀이 정해야 한다. 금액별 승인선과 이미 생성된 주문의 취소 규칙도 마찬가지다. 이 의미까지 중앙 AX팀이 떠안으면 ERP 정책이 바뀔 때마다 다시 중앙 대기열을 거치게 된다.

![중앙 AX팀과 도메인 팀의 소유권 경계](/images/posts/2026/2026-08-02-Enterprise-AX-Ownership-Boundary/ownership-boundary.svg)

## 도메인 소유는 현업에게 코드를 떠넘긴다는 뜻이 아니다

현업이 소유한다고 해서 모든 직원에게 운영에 쓸 Agent를 직접 만들라고 할 필요는 없다. 여기서 소유권은 구현 도구보다 의사결정권과 운영 책임에 가깝다.

업무 책임자(business owner)는 `구매팀`처럼 조직 이름만 적지 않고 사람 이름까지 정해 둔다. 어떤 업무를 자동화할지, 언제 사람에게 넘길지, 어떤 결과를 실패로 볼지 결정한다. 지식 문서와 승인 기준이 바뀌면 Agent의 동작도 함께 고치고, 배포 후에는 업무 지표와 예외를 본다.

구현은 팀의 역량에 따라 달라질 수 있다. 도메인에 개발자가 있다면 공통 플랫폼 위에서 직접 만들 수 있다. 그렇지 않다면 중앙 AX팀이나 별도 제품 엔지니어가 함께 구현할 수 있다. 그래도 작업 우선순위와 합격 기준, 운영 판단까지 구현팀이 대신 소유해서는 안 된다.

[Microsoft의 역할과 의사결정권 가이드](https://learn.microsoft.com/en-us/agents/center-of-excellence/roles-responsibilities)는 중앙 CoE가 표준과 guardrail을, 도메인이 그 안의 Agent 우선순위와 설계, 지식 품질, 일상 운영, KPI를 소유하는 형태를 제안한다. 같은 문서가 강조하는 기준은 단순하다. 안전하게 판단할 수 있는 가장 낮은 수준으로 의사결정권을 내리고, 중앙팀은 전사 통제를 위해 꼭 필요한 gate만 남긴다.

## 모든 Agent를 같은 방식으로 분산할 필요도 없다

읽기 전용 사내 검색 Agent와 고객에게 환불을 실행하는 Agent를 같은 절차로 운영할 수는 없다. 소유권은 위험과 영향 범위에 따라 달라져야 한다.

한 팀의 데이터만 읽고 실패 영향도 그 팀 안에 머무는 Agent라면 승인된 platform과 connector 안에서 도메인 팀이 배포하고 운영하는 편이 낫다. 중앙팀은 등록과 정책 준수 여부를 자동으로 확인한다.

업무 시스템을 바꾸는 Agent라면 배포 전에 승인 절차부터 확인한다. 같은 요청이 다시 실행돼도 결과가 중복되지 않아야 한다. 실패 뒤 되돌릴 방법과 감사 로그도 남아 있어야 한다. 업무 규칙과 예외 처리는 도메인이 맡는다. 중앙 플랫폼은 이런 안전 조건이 빠진 Agent의 배포를 막는다.

여러 부서의 데이터 경계를 넘거나 고객, 재무, 규제 대상 업무에 영향을 주는 Agent라면 중앙 보안·플랫폼 조직이 설계와 출시 과정에 직접 참여할 이유가 충분하다. 중앙집중형은 잘못된 구조가 아니라 위험이 높은 구간에서 선택할 운영 방식이다.

AWS도 2026년 7월 [여러 사업부의 Agent 확산을 다룬 글](https://aws.amazon.com/blogs/industries/managing-ai-agent-sprawl-across-business-units/)에서 중앙 hub가 공통 정책과 registry를 맡고 각 사업부가 guardrail 안에서 Agent를 운영하는 federated model을 제안한다. 다른 사업부의 데이터나 외부 사용자에게 영향을 주는 경우에는 중앙 검토를 강화한다. 조직도를 한 번 정해 고정하기보다 위험과 운영 역량에 맞춰 중앙 개입 수준을 바꾸는 방식이다.

## 새 프로젝트에서는 소유권 표부터 그린다

새 업무를 Agent로 만들 때는 아키텍처보다 소유권 표를 먼저 한 장 만든다.

누가 업무 책임자인지, 업무 규칙과 지식의 변경 권한은 누구에게 있는지, 운영 중 실패했을 때 누가 대응하는지를 적는다. 중앙 AX팀이 제공해야 할 identity, connector, eval, observability가 무엇인지도 함께 정한다. 구현이 끝난 뒤 운영팀을 찾는 순서로는 늦다.

중앙팀의 성과도 배포한 Agent 수만으로 보지 않는다. 도메인의 정책 변경이 운영 환경에 반영되기까지 걸린 시간, 공통 connector와 eval 경로의 재사용률, 업무 책임자와 운영 담당자가 지정된 Agent의 비율을 함께 봐야 한다.

Agent 수가 빠르게 늘었는데 모든 변경이 중앙 작업 대기열에 쌓인다면 AX가 확산된 것이 아니다. 중앙팀의 납품 범위만 넓어진 것이다.

내가 생각하는 중앙 AX팀의 좋은 역할은 모든 Agent를 가장 잘 만드는 팀이 아니다.

**각 도메인이 자기 업무의 Agent를 안전하게 바꾸고 운영할 수 있도록 공통 기반과 경계를 가장 잘 만드는 팀이다.**

## 참고 자료

- [Build an agentic Center of Excellence — Microsoft Learn, 2026-07-14](https://learn.microsoft.com/en-us/agents/center-of-excellence/)
- [Define roles, responsibilities, and decision rights — Microsoft Learn](https://learn.microsoft.com/en-us/agents/center-of-excellence/roles-responsibilities)
- [Organizational readiness for AI agents — Microsoft Cloud Adoption Framework](https://learn.microsoft.com/en-us/azure/cloud-adoption-framework/ai-agents/organization-people-readiness-plan)
- [2026 Work Trend Index Annual Report — Microsoft, 2026-05-05](https://www.microsoft.com/en-us/worklab/work-trend-index/agents-human-agency-and-the-opportunity-for-every-organization)
- [How to manage AI investments in the agentic era — OpenAI, 2026-07-14](https://openai.com/index/managing-ai-investments-in-agentic-era/)
- [Managing AI agent sprawl across business units — AWS, 2026-07-17](https://aws.amazon.com/blogs/industries/managing-ai-agent-sprawl-across-business-units/)
