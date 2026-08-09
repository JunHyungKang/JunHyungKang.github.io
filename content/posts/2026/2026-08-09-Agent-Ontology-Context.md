---
title: "Agent를 위한 온톨로지는 전사 데이터 모델에서 시작하지 않는다"
date: "2026-08-09"
teaser: "전사 데이터를 먼저 온톨로지로 묶기보다 Agent가 실제로 답해야 할 질문에서 필요한 개념과 관계를 좁혀 간다. GraphRAG와 자동 구축을 어디까지 적용할지도 함께 정리했다."
image: "/images/posts/2026/2026-08-09-Agent-Ontology-Context/cover.svg"
contentType: "아키텍처 판단 기록"
evidence: "Competency Question 방법론과 2025~2026년 GraphRAG 비교, ontology induction 연구, AWS·Snowflake의 공식 구현 지침을 대조했습니다."
tags:
  - AI Agent
  - Ontology
  - Knowledge Graph
  - Context Engineering
  - GraphRAG
  - AI Platform
---

## 온톨로지로 무엇을 만들지보다 먼저 볼 것

나는 Agent가 업무에 필요한 맥락을 가져올 수 있도록 온톨로지를 만들고 갱신하는 플랫폼을 구축하고 있다. 이 일을 설명하려면 먼저 답해야 할 질문이 있다.

“결국 회사 데이터를 전부 온톨로지로 만드는 건가요?”

적어도 내가 만들고 있는 플랫폼은 그렇지 않다. 어디에 쓸지 정하지 않은 채 전사 데이터부터 모델링하면 클래스와 관계는 계속 늘어난다. 정작 Agent가 어떤 질문에 답해야 하는지, 그 답이 어느 원천에서 왔는지는 뒤로 밀린다.

우리 플랫폼은 Agent가 실제로 답해야 할 질문에서 필요한 데이터와 관계를 좁혀 온톨로지 후보를 만들고 검증하는 과정을 자동화한다. 여러 업무에서 반복해서 쓰인 개념만 공통 모델로 올리는 방식은 이 글에서 한 단계 더 제안하는 운영 원칙이다.

**온톨로지의 범위는 전사 데이터가 아니라 Agent가 답해야 할 질문이 정해야 한다.**

![전사 데이터 전체를 먼저 모델링하는 경로와 Agent 질문에서 필요한 온톨로지를 좁히는 경로](/images/posts/2026/2026-08-09-Agent-Ontology-Context/cover.svg)

이 글에서는 이 판단의 근거와 한계를 함께 다룬다. 전사 공통 온톨로지가 필요 없다는 이야기도, GraphRAG가 벡터 검색보다 낫다는 이야기도 아니다.

## 질문 하나가 모델의 범위를 바꾼다

예를 들어 고객 관리 Agent가 “이 고객에게 계약 갱신 할인을 제안해도 되는가”에 답해야 한다고 해보자. 특정 회사의 실제 업무가 아니라 설명을 위한 가상의 예시다.

전사 데이터 모델부터 시작하면 고객, 계약, 상품, 청구, 캠페인처럼 관련 있어 보이는 데이터를 넓게 모으게 된다. 어느 수준까지 모델링해야 충분한지 끝을 정하기 어렵다.

질문에서 시작하면 확인할 범위가 달라진다.

- 현재 유효한 계약이 있는가.
- 고객 등급과 상품에 맞는 할인 정책은 무엇인가.
- 정책이 계약 갱신일에도 유효한가.
- 답을 뒷받침하는 계약과 정책 원문은 무엇인가.
- 필요한 정보가 없을 때 Agent는 답하지 않고 멈추는가.

온톨로지 엔지니어링에서는 온톨로지가 답해야 할 질문을 `competency question`이라고 부른다. Grüninger와 Fox가 1995년에 제시한 방법론에서는 이 질문을 온톨로지의 요구사항이자 검증 기준으로 사용한다. 최근에는 LLM으로 질문 초안을 만들고 정리하는 연구도 나왔지만, 도메인 전문가의 검토와 합의는 그대로 남아 있다. [Grüninger & Fox](https://doi.org/10.1007/978-0-387-34847-6_3), [IDEA2](https://arxiv.org/abs/2604.01344)

실제로는 질문만 한 줄 적어 두지 않는다. 필요한 정보와 근거, 답하지 말아야 할 조건도 함께 적는다. 아래 YAML은 표준 형식이 아니라 구축과 평가에서 같은 질문을 보기 위해 만든 예시다.

```yaml
question: "이 고객에게 계약 갱신 할인을 제안해도 되는가?"

requires:
  - active_contract
  - customer_segment
  - discount_policy
  - policy_validity

evidence:
  - contract_source
  - policy_source
  - valid_at

abstain_when:
  - active_policy_is_missing
  - contract_status_is_ambiguous
```

여기서 `requires`는 필요한 개념과 관계의 범위를 정한다. `evidence`는 답을 원천 자료까지 추적하기 위한 조건이다. `abstain_when`은 온톨로지에 정보가 부족할 때 Agent가 그럴듯한 답을 만들어 내지 못하게 하는 평가 기준이 된다.

질문이 먼저 있으면 새 클래스나 관계를 추가할 이유도 설명할 수 있다. 반대로 어느 질문에도 쓰이지 않는 개념은 당장 공통 모델에 올리지 않을 수 있다.

## 그래프를 전부 프롬프트에 넣지는 않는다

온톨로지나 지식 그래프를 만들었다고 해서 전체 그래프를 Agent의 프롬프트에 넣는 것은 아니다.

실제 질의 경로는 대체로 이렇다.

```text
사용자 질문
  → 벡터·키워드 검색으로 관련 문서와 개체 후보 선택
  → 필요한 경우 관계·경로·유효 시점 탐색
  → 답을 뒷받침하는 원문 조각 회수
  → Agent 입력 구성
```

단일 문서 안의 사실이나 특정 문구를 찾을 때는 벡터 검색이 좋은 기준선이다. 고객과 계약, 정책을 여러 번 따라가야 하거나 과거와 현재 상태를 나눠 봐야 할 때는 그래프가 도움이 될 수 있다.

2026년에 개정된 [RAG와 GraphRAG 비교 연구](https://arxiv.org/abs/2502.11371)는 같은 chunking과 embedding, 생성 모델 조건에서 이 차이를 확인했다. 논문의 Llama 3.1 8B 설정에서 Natural Questions처럼 한 번의 검색으로 답할 수 있는 질문은 Vector RAG의 F1이 `64.78`로 HippoRAG 2의 `61.03`보다 높았다. HotpotQA에서는 HippoRAG 2가 `63.01`, Vector RAG가 `60.04`였다. 여러 문서의 시간 관계를 묻는 질문에서는 GraphRAG 계열이 더 높은 정확도를 보였다.

이 숫자를 현재 Agent 서비스의 성능으로 그대로 옮길 수는 없다. 오래된 QA benchmark와 Llama 3.1을 사용했고 graph를 만드는 모델의 품질에도 영향을 받는다. 근거가 없는 질문에서 일부 global GraphRAG의 답변 거부 성능이 크게 떨어진 반례도 있었다.

이 연구에서 더 눈여겨본 부분은 승자를 하나 정하지 않았다는 점이다. 질문에 따라 Vector RAG와 GraphRAG를 고르거나 두 결과를 합치는 방식이 한 가지 검색 방식을 고정하는 것보다 안정적이었다.

[HippoRAG 2](https://arxiv.org/abs/2502.14802)도 벡터 검색을 버리지 않는다. 벡터로 문서 조각과 관계 triple의 시작점을 찾고, 그래프를 탐색한 뒤 원문 조각을 다시 순위화한다. 그래프 탐색이 실패하면 벡터 검색 결과로 돌아간다.

Agent에 온톨로지를 쓴다는 말은 모든 질문을 그래프 질의로 바꾼다는 뜻이 아니다. **벡터 검색이 놓치는 관계와 시간 조건이 실제 실패로 확인됐을 때 그래프를 추가한다.**

## LLM에는 운영 온톨로지 수정 권한을 주지 않는다

문서와 데이터 schema를 사람이 처음부터 읽고 온톨로지를 만드는 방식은 확장하기 어렵다. LLM이 도움을 줄 수 있는 부분도 분명하다.

- 문서에서 entity와 relation 후보 추출
- 비슷한 용어와 mapping 후보 탐색
- class와 property 초안 작성
- RDF·OWL 같은 구조화된 형식으로 변환
- 새 원천 데이터가 들어왔을 때 변경안 생성

문제는 후보를 운영 온톨로지에 바로 반영할 때 생긴다.

2026년 [OntoEKG](https://arxiv.org/abs/2602.01276)는 기업 문서에서 class와 property를 추출하고 계층을 만드는 과정을 공개했다. LLM은 모델링 범위를 스스로 정하기 어려워했고 class와 instance를 혼동하거나 `subClassOf` 방향을 뒤집었다. Finance 영역의 exact-match F1은 `0`이었고 fuzzy-match F1도 `0.121`이었다. 형식에 맞는 RDF를 만들 수 있다는 것과 업무 의미가 맞는 온톨로지를 만든다는 것은 다른 문제다.

반면 2026년 [SCOPE·SCION](https://arxiv.org/abs/2607.21610)은 생성 범위를 입력 문서에서 찾은 후보로 제한한다. 각 후보를 원문 근거에 연결하고 구조화된 출력과 정해진 검증 절차를 둔다. 기존 용어와 합칠 근거가 약하면 강제로 병합하지 않고 출처가 남은 확장 항목으로 보관한다.

두 결과를 보고 내가 잡은 경계는 이렇다.

```text
새 원천 데이터와 schema
  → LLM이 근거가 연결된 용어·관계 후보 생성
  → 기존 온톨로지와의 변경 내역 작성
  → RDF parse + SHACL + OWL consistency + 질문 회귀 검사
  → 도메인 담당자가 의미와 병합 여부 확인
  → 새 온톨로지 버전 발행
  → Agent 평가
```

그래서 LLM에는 운영 온톨로지를 직접 고칠 권한을 주지 않는다. 원문 근거가 붙은 변경안을 만들게 한다. 검토자는 전체 문서를 다시 읽는 대신 변경 내역과 자동 검사에서 걸린 항목을 본다.

SHACL이나 OWL reasoner도 역할이 제한돼 있다. RDF 구문과 개수 제약(cardinality), 사람이 미리 적은 규칙과 논리적 일관성은 자동으로 검사할 수 있다. 검사를 통과했다고 해서 “할인 가능 고객”의 업무 정의가 현실과 맞다는 뜻은 아니다. 검증기는 사람이 정한 규칙을 실행할 뿐이다. [W3C SHACL](https://www.w3.org/TR/shacl/)

2026년 공개된 [CQ4OE benchmark](https://oeg-upm.github.io/cq4oe-benchmark/leaderboard/index.html)는 competency question별 term과 axiom coverage를 검사하는 코드와 데이터를 제공한다. 평가에 쓰이는 기준 온톨로지와 질문-공리 연결도 여러 사람의 검토를 거쳐 만들어졌다. 자동 구축과 자동 검사가 늘어나도 의미의 책임이 사라지지 않는 이유다.

## 공통 모델은 실제로 재사용된 개념에서 만든다

질문별로 온톨로지를 만들면 도메인마다 같은 개념을 중복해서 정의할 수 있다. `Customer`, `Product`, `Organization`처럼 여러 업무에서 쓰이는 개념의 식별자가 달라지면 도메인을 가로지르는 질의도 어려워진다.

그래서 중앙 플랫폼에는 최소한의 공통 모델과 승격 경로가 필요하다.

처음부터 모든 데이터의 표준 의미를 정하는 대신 실제 질문을 구현하며 반복해서 등장한 개념을 찾는다. 두 도메인이 같은 고객 식별자와 계약 관계를 쓰기 시작하면 공통 모델 후보로 올린다. 이름과 namespace, 호환성과 폐기 절차는 중앙에서 관리한다. 업무상 정의와 정답으로 인정할 데이터는 도메인 담당자가 확인한다.

이 경계는 앞서 쓴 [사내 AX 조직의 소유권에 관한 글](/posts/2026-08-02-Enterprise-AX-Ownership-Boundary)과도 이어진다. 중앙팀은 온톨로지의 버전과 등록 정보, 검증·배포 경로를 운영할 수 있다. “이 계약이 유효한가”, “어떤 정책이 정답인가”까지 중앙팀이 대신 결정할 수는 없다.

AWS가 2026년 7월 공개한 [AI assistant용 semantic ontology 구현](https://aws.amazon.com/blogs/database/build-a-semantic-ontology-to-power-ai-assistants-on-aws-part-1/)도 raw schema를 대량으로 프롬프트에 넣는 방식의 문제를 지적한다. catalog와 실제 데이터 분포에서 기초 구조를 만들고 LLM이 관계를 제안하면 사람이 검증하는 bottom-up 방식을 택했다. graph store와 vector index를 함께 두고 질문에 필요한 정보만 가져온다.

[Snowflake의 semantic view 가이드](https://docs.snowflake.com/en/user-guide/views-semantic/best-practices-modeling)도 데이터베이스 구조보다 사용자의 업무 관점에서 설계하라고 권한다. 처음에는 한 업무 범위와 `5~10개` 테이블로 시작하고 “사용자가 이 컬럼을 실제로 물을 것인가”를 기준으로 범위를 줄인다. 전사 데이터 웨어하우스 전체를 한 번에 모델링하는 것은 피해야 할 패턴으로 든다.

두 자료가 온톨로지 설계의 정답을 증명하는 것은 아니다. 다만 최근 Agent 제품이 거대한 공통 모델보다 작은 업무 범위와 필요한 맥락에서 출발하는 흐름은 확인할 수 있다.

## 전사 온톨로지부터 설계해야 하는 경우도 있다

질문에서 시작하는 방식을 모든 조직에 적용할 수는 없다.

규제 보고나 산업 표준처럼 상호운용성 자체가 목표라면 공통 모델을 먼저 맞춰야 한다. 고객과 조직, 상품처럼 여러 시스템의 identity를 통일해야 하는 경우도 마찬가지다. 원천 데이터가 적고 개념이 오래 안정적이거나 같은 정책과 추론 규칙을 여러 업무에 강제해야 할 때도 중앙 모델의 가치가 크다.

반대로 쓸 업무가 아직 없고 원천 데이터는 계속 바뀌는데 “언젠가 Agent가 쓸 것”이라는 이유로 전사 온톨로지부터 만들면 비용을 통제하기 어렵다. 모델의 크기보다 다음 질문에 답할 수 있는지를 먼저 봐야 한다.

- 어느 Agent 질문을 새로 풀게 됐는가.
- 답을 원문과 유효 시점까지 추적할 수 있는가.
- 새 질문을 추가할 때 필요한 모델 변경은 얼마인가.
- 원천 데이터가 바뀌었을 때 어떤 질문이 깨졌는지 찾을 수 있는가.
- 도메인 담당자가 변경안을 검토하는 데 얼마나 걸리는가.

이 값이 좋아지지 않는다면 온톨로지의 class와 relation 수가 늘어도 Agent context 플랫폼은 나아진 것이 아니다.

## 질문에서 시작하고 재사용이 확인되면 넓힌다

온톨로지를 먼저 만들지 말자는 뜻이 아니다. **무엇을 답할지 정하기 전에 넓게 만들지 말자는 뜻이다.**

Agent가 답해야 할 질문을 적고, 필요한 관계와 근거를 모델링한다. 벡터 검색으로 충분한 질문에는 그래프를 얹지 않는다. LLM은 근거가 붙은 변경 후보를 만들고, 자동 검사는 사람이 정한 제약을 실행한다. 업무 의미는 도메인 담당자가 승인한다.

그렇게 만든 개념이 다른 Agent에서도 반복해서 쓰일 때 공통 모델로 올린다. 내게 전사 온톨로지는 출발점이 아니다. 검증된 업무 맥락이 쌓인 결과다.

## 참고 자료

- Michael Grüninger, Mark S. Fox, [The Role of Competency Questions in Enterprise Engineering](https://doi.org/10.1007/978-0-387-34847-6_3)
- Elliott Watkiss-Leek 외, [IDEA2: Expert-in-the-loop competency question elicitation for collaborative ontology engineering](https://arxiv.org/abs/2604.01344)
- Haoyu Han 외, [RAG vs. GraphRAG: A Systematic Evaluation and Key Insights](https://arxiv.org/abs/2502.11371)
- Bernal Jiménez Gutiérrez 외, [From RAG to Memory: Non-Parametric Continual Learning for Large Language Models](https://arxiv.org/abs/2502.14802)
- Miaobo Hu 외, [SCOPE and SCION](https://arxiv.org/abs/2607.21610)
- Abdulsobur Oyewale, Tommaso Soru, [LLM-Driven Ontology Construction for Enterprise Knowledge Graphs](https://arxiv.org/abs/2602.01276)
- [CQ4OE Benchmark](https://oeg-upm.github.io/cq4oe-benchmark/leaderboard/index.html)
- AWS, [Build a semantic ontology to power AI assistants on AWS – Part 1](https://aws.amazon.com/blogs/database/build-a-semantic-ontology-to-power-ai-assistants-on-aws-part-1/)
- Snowflake, [Best practices for modeling semantic views](https://docs.snowflake.com/en/user-guide/views-semantic/best-practices-modeling)
- W3C, [Shapes Constraint Language](https://www.w3.org/TR/shacl/)
