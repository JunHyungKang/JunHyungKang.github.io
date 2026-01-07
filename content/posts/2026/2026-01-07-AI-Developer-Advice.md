---
title: "AI 개발자로서 신입분들에게 전하고 싶은 이야기"
date: "2026-01-07"
teaser: "LangChain, LangGraph 기반 AI 개발 경험을 바탕으로 신입 개발자들에게 전하고 싶은 실무 팁과 마인드셋을 정리했습니다."
image: "/images/posts/2026/2026-01-07-AI-Developer-Advice/thumbnail.png"
tags:
  - AI Development
  - LangChain
  - LangGraph
  - Career Advice
  - Junior Developer
  - Agent
  - Workflow
---

## 들어가며

연말에 팀 이동을 하게 되면서 신입 개발자분들과 함께 일할 기회가 많지 않았습니다. 아쉬운 마음에 마지막 인사를 대신해 평소 나누고 싶었던 생각들을 정리해 전달했는데, 사내 프로젝트 관련 내용을 제외하고 공유해도 괜찮을 것 같아 블로그에 남겨봅니다.

> ⚠️ **참고**: 아래 내용은 저의 개인적인 경험과 생각입니다. AI 기반 개발에 치우친 시각일 수 있으니, 다양한 선배들과 함께 일하면서 여러 관점을 접해보시길 권합니다.

---

## 🔧 Workflow vs Agent 용어를 구분하세요

내부적으로 **workflow와 agent를 구분해서 용어를 사용**하는 것이 중요합니다.

과거에 "agent로 구성했다", "multi-agent로 만들었다"고 해서 코드를 살펴보면, 실제로는 거의 정형화된 workflow에 특정 부분만 LLM을 활용한 경우가 많았습니다.

**용어를 구분하면:**
- 서로 간의 인지부하를 줄여줍니다
- 조언을 구할 때 대략적인 컨셉이나 방안이 암묵적으로 공유됩니다

---

## 🤔 LangGraph 사용에 대해

저는 LangGraph 사용을 긍정적으로 보지만, production 레벨에서의 적용을 부정적으로 보는 시각도 존재합니다.

어찌되었든 시간이 갈수록 모델은 발전할 것입니다. 현재의 에이전트를 점점 통합하고, 더 발전된 모델을 지원하도록 **미들웨어나 Tool, 메모리 레벨의 설계**를 어떻게 할 것인지 고민하는 시대가 왔습니다.

---

## 📁 LangChain & LangGraph 코드 구조화와 모듈화

### 기존 Workflow 구조 예시

많은 node로 구성된 workflow에서는 nodes를 명확하게 파일 단위로 구분하고 재사용할 수 있도록 관리하는 것이 중요합니다.

> 참고: [LangChain Blog - LangGraph Learnings & Best Practices](https://blog.langchain.com/beyond-rag-implementing-agent-search-with-langgraph-for-smarter-knowledge-retrieval/)

저의 경우 노드의 수와 복잡도를 고려해서:
- **노드마다 분리**할 때도 있었고
- **노드들을 전부 모아서** graph마다 하나의 파일로 관리하기도 했습니다

### LangChain 1.0 Middleware 활용

최근에는 LangChain 1.0의 middleware를 사용하면서, node 대신 `middleware`와 `tools`를 예전의 node처럼 구분해서 구조를 잡는 것이 더 효율적으로 느껴집니다.

> 참고: [LangChain DeepAgents GitHub](https://github.com/langchain-ai/deepagents)

### 핵심 원칙

- **협업 측면에서 일관성과 모듈화가 생산성을 좌우합니다**
- Code assistant를 이용할 때도, 몇천 줄의 코드 하나로 작업하기보다 **코드베이스 자체에 의미를 내장**하는 것이 좋습니다
- 구조화된 코드가 LLM에게도 이해하기 쉽습니다

---

## 📁 LangChain & LangGraph State 관리

State를 관리할 때는 다양한 접근 방식이 있습니다:

- **통합 관리**: sub-graph까지 포함해서 하나의 state로 관리
- **분리 관리**: sub-graph와 상위 graph의 state를 독립적으로 관리

당연히 장단점이 있고, 의도하지 않은 state값 변경이나 누락을 조심하면서 선택해야 합니다.

저의 경우에는 보통 **분리해서 관리**하는 것이 협업에 유리하다고 판단됩니다. 단, 이 경우 `create_agent`를 사용하면 상위 graph, sub-graph, agent 객체가 모두 다른 state를 가지기 때문에 효율적인 관리가 필요합니다.

**제가 사용하는 패턴:**
1. 상위 graph의 state 객체를 상속받아 sub-graph state를 관리
2. sub-graph의 state 값을 `create_agent` 객체의 context schema로 관리
3. `create_agent`의 state는 default인 message를 제외하고 실제 동작에 필요한 최소한의 값만 사용

```python
# 상위 Graph State를 상속받아 Sub-Graph State 정의
class SubGraphState(ParentGraphState):
    sub_specific_field: str

# create_agent 호출 시 context_schema로 Sub-Graph State 전달
agent = create_agent(
    model=llm,
    tools=[...],
    middleware=[...],
    state_schema=AgentState,        # Agent 내부 state (최소한으로 유지)
    context_schema=SubGraphState,   # Sub-graph state를 context로 전달
)
```

---

## ⚠️ Vibe 코딩의 함정

Vibe 코딩에 너무 의존하면 **과도한 추상화**를 하게 되는 경우가 있습니다.

> "A little copying is better than a little dependency" - Go Proverbs

AI 코드 어시스턴트가 만들어내는 코드를 무비판적으로 수용하다 보면, 불필요하게 복잡한 추상화 레이어가 쌓이기 쉽습니다. 때로는 단순한 복사가 복잡한 의존성보다 나을 수 있다는 점을 기억하세요.

---

## 📚 AI 도메인에 있는 이상 끊임없이 배우세요

- **억지로 틈을 만들어서라도 공부해야 합니다.** 업무만 하지 마세요.
- 블로그, 뉴스레터, 유명한 오픈소스 레포, 논문 등에서 트렌드를 따라가세요.
- 디테일에는 힘이 있지만, 이제는 AI가 어느 정도 도와줄 수 있습니다. **그렇기 때문에 더더욱 본질을 알아야 합니다.**

---

## 📈 2025 - 2026 AI 트렌드 흐름

타이틀만 보더라도 대략적인 흐름을 알 수 있습니다. 이런 큰 그림을 따라가야 합니다.

| 시점 | 트렌드 |
|------|--------|
| 작년 | Workflow에서 Agent로 트렌드 전환 |
| RAG | 한계를 느끼면서 관심 감소, GraphRAG도 기술적 성숙에도 불구하고 관심 감소 |
| Memory | 관심 증가, Context Engineering이라는 범주에 통합되는 느낌 |
| 올해 전망 | Agent의 context 관리와 멀티모달 agent에 대한 관심 증가 예상 |

---

## 💡 본질에 집중하세요

넓게 보면 결국 다 프롬프트입니다. 하지만 단순히 **프롬프트 string 값의 튜닝에 시간을 쏟기보다 더 본질적인 디자인 패턴이나 설계를 고민**하는 것이 먼저입니다.

이걸 할 수 있으려면 본질을 알아야 합니다.

> 추천 영상: [Andrej Karpathy - Let's build GPT](https://youtu.be/iwXr1IRaqWA?si=iOIbv0xhIto2kNtA)

---

## 📚 방법론 적용의 벽

방법론을 아는 것과 실제 과제에 적용하는 것 사이에는 넘어야 할 벽이 있습니다.

예를 들어 prompt optimizer에 대한 연구들을 많이 보고 논의했지만, 실제 프로젝트에 적용하기에는 만만치 않아서 결국 적용하지 못한 경험이 있습니다.

딸깍 한 번에 논문 요약이 착착 나오는 시대에서는, **늘 자신의 서비스에 어떻게 적용할지 고민해야 진정한 인사이트가 나올 수 있습니다.**

---

## 🤝 협업과 동료

- **AI 개발자라고 아예 백엔드를 모르면 안 됩니다.** 제가 생각하는 AI 개발자의 기준:
  - 스스로 서비스를 만들고 API까지 기능 레벨로 뽑아내는 수준
  - 배포 관리는 본인의 욕심에 달린 영역

- **늘 더 나은 동료와 일하려 노력하세요.** 생각을 나누고 의지하고 도움이 되는 동료를 만드세요.

- **버스 팩터(Bus Factor)를 기억하세요.** 내가 없어져도 다른 사람이 내 코드를 보고 작업을 이어나갈 수 있어야 합니다.

- 모든 일에는 근거가 있어야 합니다. 왜 이렇게 코드를 짰는지 생각할수록 실력이 쌓입니다.

- **자신만의 가치를 만드세요.** "내가 하는 거 어차피 남들도 다 아는 건데" 라고 생각하기 전에...
  - **그렇게 생각하는 사람들과 다른 무언가를 발견할 수 있는 사람이 되기 위해 노력하세요.**

- 그러다 보면 또 "내가 제일 잘 안다"는 자만의 시기가 올 수 있는데, 그때는 서로 배울 것이 있는, 함께 기술적인 고민을 나눌 수 있는 동료를 찾는 것이 중요합니다.

---

## 💬 솔직하게 소통하세요

- 본인의 의견을 적극적으로 내세요.
- **못하면 못한다고 말하는 게 능력입니다.** 더 빨리 말할수록 좋습니다.
- 그때의 해결은 아직 여러분의 몫이 아닙니다.
- 하지만 이제 조금씩은 내가 할 수 있는 일도 나누고 위임하는 방법을 배우기 시작해야 합니다.

---

## ✍️ 글쓰기와 설명 능력

- **이해하기 쉬운 글을 쓰세요.** 미팅에서도 본인의 아이디어를 상대방이 이해하기 쉽도록 설명하는 것이 개발자의 능력입니다.
- 급하더라도 경우에 따라서는 상대방을 배려하는 정리된 글쓰기가 필요합니다.

---

## 🔄 실수에서 배우세요

- **다만 같은 실수를 반복하는 사람을 좋아하는 사람은 없습니다.**
- 저는 PR 피드백을 모아두고 Cursor Rule로 관리하고 있습니다.
- 이게 정답은 아니지만, 특히나 요즘 세상에서는 AI를 이용해서 같은 실수를 하지 않고, 더 나은 결과를 만들려는 고민과 노력은 필요합니다.

---

## ⚡ 우선순위와 Critical Path

- 협업할 때는 **Critical Path가 무엇인지** 고민하세요.
- 때로는 나에게 중요하거나 재밌거나 어려운 일보다, 전체 일정상 내가 바로 수행해야 할 일이 있습니다.

---

## 🙏 마치며

지금까지 말한 부분은 저도 완벽히 하지 못하고 있고, 정답이 아닐 수도 있습니다. 다른 사람의 말을 시니컬하지 않게, 하지만 비판적으로 수용하는 자세도 필요합니다.

**올 한 해 스스로 많이 고민하고 성장하는 한 해가 되길 바랍니다! 🌟**
