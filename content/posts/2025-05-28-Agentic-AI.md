---
title: "Agentic AI 개념 정리: 에이전트와 워크플로우의 스펙트럼"
date: "2025-05-28"
teaser: "Agent, Workflow, Agentic AI의 개념을 정리하고, AI 엔지니어링 관점에서의 의의와 실제 적용 전략을 다룹니다."
tags:
  - Agent
  - Agentic AI
  - Workflow
  - LLM
  - AI Engineering
---

## 1. 들어가며

안녕하세요. SK AX의 소리지르는비버 입니다. LLM 기반 서비스를 만들다 보니 Agent 개념을 묻는 질문이 많았습니다.
아래 LangChain 블로그를 참고해 **Agent·Workflow·Agentic AI** 개념을 정리하고, 이 분야 AI 엔지니어링이 갖는 의의를 제 관점에서 정리했습니다.

* [how to think about agent frameworks](https://blog.langchain.dev/how-to-think-about-agent-frameworks/)

### 대상 독자

* Agent, Workflow, LLM Chain, Agentic AI의 개념이 헷갈렸던 분

### **자주 받은 질문**

> 아래 질문에 모두 답할 수 있다면, 이 글을 더 이상 읽지 않으셔도 됩니다.

* Agent란 정확히 무엇인가요?
    * 단순한 LLM inference와의 차이는 무엇인가요?
    * LLM inference를 여러 개 연결하면 Agent라고 할 수 있나요?
* 복잡한 흐름(flow)이 없으면 Agent가 아닌가요?
* Agent Framework은 왜 쓰나요? 서비스에 의존성만 높아지는 거 아닌가요?


## 2. Agent? Agentic AI?

### 🔍 주요 조직에서 말하는 Agent란?

| 출처 | 정의 요약 | 출처 |
| --- | ----- | --- |
| **OpenAI** | Agent는 당신을 대신해 스스로 작업을 수행하는 시스템 | [A practical guide to building agents](https://cdn.openai.com/business-guides-and-resources/a-practical-guide-to-building-agents.pdf) |
| **Anthropic** | Agent: LLM이 자율적으로 프로세스를 조정하고 도구 사용을 결정하며 작업을 수행하는 시스템.<br>Workflow: LLM과 도구가 사전에 정의된 코드 경로를 따라 오케스트레이션되는 시스템.<br>둘을 합친 모든 변형을 **Agentic System**이라 부름. | [Building effective agents](https://www.anthropic.com/engineering/building-effective-agents?ref=blog.langchain.dev) |
| **Google** | 자신이 가진 도구를 활용해 목표를 달성하려는 애플리케이션.<br>자율적이며 목표가 주어지면 인간 개입 없이 행동 가능.<br>능동적으로(proactive) 다음 행동을 스스로 추론. | [Agents (white paper)](https://www.kaggle.com/whitepaper-agents?utm_source=pytorchkr&ref=pytorchkr) |
| **LangChain** | LLM을 사용해 애플리케이션의 제어 흐름을 결정하는 시스템 | [What is an agent?](https://blog.langchain.dev/what-is-an-agent/) |
| **NVIDIA** | LLM을 활용해 문제를 **추론 → 계획 → 실행**하는 시스템 | NVIDIA Tech Blog |
| **Microsoft** | 언어 모델 위에 얹혀 정보를 관찰·수집하고, 입력을 제공하며, 함께 실행 계획을 수립하거나 독자적으로 행동하는 계층 | [Microsoft Source](https://news.microsoft.com/source/features/ai/ai-agents-what-they-are-and-how-theyll-change-the-way-we-work/) |

> 이 문서에서는 기술적으로 명확한 기준을 제시하는 **Anthropic의 정의**를 중심으로 설명합니다.

### **🧠 Agentic System이란?**

* **Agentic System**: *Agent*와 *Workflow*가 결합된 구조
    * **Agent**: 자율적으로 프로세스를 조정하고, 도구를 활용해 능동적으로 작업을 수행하는 시스템
    * **Workflow**: LLM과 도구가 사전에 정의된 흐름에 따라 동작하는 시스템
* 위의 기준으로 다시 아래의 그림을 보면, 각 단계의 자율성 수준을 Workflow와 Agent로 나눌 수 있습니다.
* 그림 출처: [https://blog.langchain.dev/what-is-a-cognitive-architecture](https://blog.langchain.dev/what-is-a-cognitive-architecture)

![LangChain Cognitive Architecture](/images/agentic-ai-1.jpg)

    * **Lv3**: 경로가 고정되어 있어 **Workflow**에 해당
    * **Lv6**: 다음 단계 자체를 AI가 결정하므로 명확한 **Agent**
    * **Lv4~5**: 일부 경로를 선택할 수 있지만, 정의된 경로 내에서만 작동하므로 애매함?

### **🌗 에이전트적인 정도란?**

* 이처럼 명확한 Workflow와 명확한 Agent 사이에는 명확히 구분되지 않는 회색 지대가 존재하며, 이를 ‘Agentic 정도’의 스펙트럼으로 이해하자는 접근도 제안되고 있습니다.

    > 나는 특정 시스템을 에이전트로 볼 것인지 아닌지를 **이분법적으로** 결정하기보다는, **에이전트적인(agentic) 정도**를 기준으로 생각하는 것이 더 유용할 것이라고 생각했다.
    > “에이전트(agent)“라는 명사가 특정 범주를 한정하는 반면, “에이전트적(agentic)“이라는 형용사는 다양한 시스템을 유연하게 포함할 수 있도록 해준다.
    > 단 한 번 프롬프팅하는 방식은 명확히 에이전트가 아니며, 반면 **고수준의 지시를 받고 계획을 세우며 도구를 활용하고 반복적인 처리를 수행하는 자율 에이전트**는 명백히 에이전트라고 할 수 있다.
    > 이 사이에는 **회색 지대(gray zone)**가 존재한다.
    > — *Andrew Ng*

### **✏️ 개인적인 경험에서 본 회색 지대**

* 과거 개발 과정에서 도메인 지식을 활용해 사전에 정의된 경로를 따르는 Workflow를 구현한 적이 있습니다.
    하지만 Agent 프레임워크를 사용했다는 이유만으로 해당 모듈을 “Agent”로 분류했는데, 지금 돌이켜보면 구조적으로는 Workflow에 더 가까웠고,
    이로 인해 팀 내 커뮤니케이션에 혼선을 줬을 가능성도 있다고 생각합니다.
* 이처럼 Workflow와 Agent 사이에는 경계가 모호한 경우가 많기 때문에, 내부적으로 용어 정의와 분류 기준을 협의 후 유연하게 판단하는 것이 현실적인 접근이라 생각합니다.


## 3. Agent vs Workflow

* Agent가 Workflow보다 더 우월하다는 의미는 아닙니다. 두 방식은 각각의 장단점이 있으며, 상황에 따라 적합한 접근 방식이 달라집니다.

    | **항목** | **Workflow** | **Agent** |
    | --- | -------- | ----- |
    | 주도권 | 개발자가 설계 | LLM이 일부 결정 |
    | 제어 흐름 | 결정론적(deterministic) | 비결정론적, 자율성 있음 |
    | 장점 | 단순함, 예측 가능, 빠름, 비용 효율 | 유연성, 문제 해결 범위 넓음 |
    | 단점 | 복잡한 문제 해결에 한계 | 예측 불가능, 신뢰성 확보 어려움 |
* (그림 출처: [https://blog.langchain.dev/how-to-think-about-agent-frameworks/](https://blog.langchain.dev/how-to-think-about-agent-frameworks/))

![Agent vs Workflow](/images/agentic-ai-2.jpg)

    * Workflow는 더 단순하고, 신뢰할 수 있으며, 비용도 적게 들고, 빠르고, 성능도 좋습니다.
    * Agent 프로토타입을 만드는 건 쉽지만, 실제 서비스를 위한 안정적 Agent를 구축하는 건 매우 어렵습니다.
<br>
* 최신 LLM의 성능이 크게 향상되면서, 세부 작업 단계를 일일이 설계하기보다는 모델에게 의사결정을 위임하려는 시도가 늘고 있습니다.
    이에 따라 ‘최적화된 에이전트 내부 로직’ 자체보다는, 외부 도구·다른 에이전트와의 연동을 표준화한 상위 오케스트레이션 기술(예: MCP, A2A)이 주목받고 있습니다.
<br>
* 다만 실제 비즈니스 현장에서는 재현성·비용·지연 시간이 핵심이므로, 복잡한 프로세스를 전적으로 모델에게 맡기기보다는 사람이 설계한 결정론적 Workflow를 선호하는 경우가 여전히 많습니다.
    따라서 현시점에서는 **워크플로우 기반의 뼈대 위에, 일부 단계만 에이전트로 대체하는 하이브리드 방식**이 가장 현실적인 선택지입니다.
<br>
* 그림 출처: AlphaCodium 논문 ([https://arxiv.org/pdf/2401.08500](https://arxiv.org/pdf/2401.08500)) - 모델에 맡기기보다, 도메인 지식을 활용해 최적화된 워크플로우를 사전에 설계

![AlphaCodium Workflow](/images/agentic-ai-3.jpg)

### **✅ 요약**

* Agent와 Workflow는 명확히 나뉘지 않으며, Agentic 시스템의 스펙트럼에서 위치를 판단해야 합니다.
* 정의에 집착하기보다는, 서비스 목적과 구현 방식에 따라 유연하게 해석하는 것이 실용적입니다.
* 다만 최근에는 모델자체의 성능향상으로, 더 Agentic한 방식의 기술이 주목받고 있습니다.


## **4. Agent Framework의 가치**

* **Agent Framework의 핵심 가치는, 엔지니어 간에 공통된 구축 방식을 제공함으로써 온보딩과 유지보수를 더 쉽게 만든다는 점**입니다.
    특히 팀 규모가 커지거나 기능이 복잡해질수록 이런 공통 구조는 생산성과 일관성을 크게 높여줍니다.
* LangChain 중심의 시각이 일부 반영되어 있을 수는 있지만, 다양한 Agent Framework를 비교하고 싶다면 아래 자료를 참고해볼 수 있습니다.
    * [https://docs.google.com/spreadsheets/d/1B37VxTBuGLeTSPVWtz7UMsCdtXrqV5hCjWkbHN8tfAo/edit?ref=blog.langchain.dev&gid=0#gid=0](https://docs.google.com/spreadsheets/d/1B37VxTBuGLeTSPVWtz7UMsCdtXrqV5hCjWkbHN8tfAo/edit?ref=blog.langchain.dev&gid=0#gid=0)

### **❓ 그런데 정말 프레임워크가 꼭~ 정말로 필요할까요?**

이 글에서 많은 부분을 참고한 LangChain 블로그에서는 이 질문에 간단히 답합니다:

> **당신의 애플리케이션이 위 기능들을 모두 필요로 하지 않거나,직접 구현하길 원한다면**, 프레임워크 없이도 가능할 수 있습니다.


## **5. 모델 바깥의 AI Engineering**

### **🔸 “결국 모델이 좋아져야 하는 거 아닌가요?”**

자주 듣는 질문입니다. 하지만 이 말이 서비스의 구조 설계나 시스템 구성 작업이 **덜 중요하다**는 뜻은 아닙니다.
물론 **모델의 성능이 올라갈수록**, 단순한 도구 호출만으로도 꽤 많은 작업을 수행할 수 있게 될 것입니다.
실제로 순수 **에이전트를 옹호하는 입장**에서는 이렇게 말하곤 합니다:

> “지금은 부족해도, 언젠가는 가능해진다. 결국엔 도구만 잘 호출하면 된다.”

하지만 현실적인 질문은 이겁니다:

* “단순한 도구 호출만으로 충분한 애플리케이션이 과연 얼마나 될까?”
* ”단순한 도구 호출만으로 충분한 수준의 모델이 언제쯤 가능해질까?”

***

### **🔸 대부분의 현실은 고유하고 복잡합니다**

* 아시는 것 처럼 비즈니스 상황에서 우리가 다루는 대부분의 문제는 **보편적인 작업**이 아닙니다.
    * 특히 **기업 내부의 업무는 고유하고 복잡한 요구사항**을 담고 있는 경우가 많으며, 기존 모델이 그 작업을 **직접 학습하지 않은 상태**에서 사용될 때가 많습니다.
<br>
* 이럴 때 선택지는 크게 두 가지입니다:
    1. **모델 중심 접근**:
        데이터를 수집하고, 파인튜닝이나 RL을 통해 모델을 학습시키는 방법
    2. **구조 중심 접근**:
        **모델 바깥의 흐름과 구조를 설계하여 문제를 해결**하는 방법
<br>
* 저는 두 번째 방식, 즉 모델을 직접 수정하지 않고도 시스템적으로 문제를 해결하는 접근을 주로 택하고 있습니다.
    * **정보의 흐름을 설계하고**,
    * **적절한 도구와 LLM을 연결하며**,
    * **신뢰 가능한 방식으로 전체 시스템을 구현**합니다.
<br>
* 앞으로 LLM 성능이 지금보다 훨씬 강화되면, 세부 워크플로를 일일이 설계하는 비중은 줄어들 수 있습니다.
    그러나 그럴수록 ReAct, Plan-and-Execute 같은 **범용 에이전트 패턴**과 MCP·A2A와 같은 **고수준 오케스트레이션 프로토콜**을 얼마나 잘 활용하느냐가 전략적 차별화 포인트가 될 가능성이 큽니다.
    결국 저수준 구현의 부담은 줄어드는 대신, 견고하고 범용적인 에이전트 구조를 설계·운용하는 역량이 오히려 더 중요해질 것이라는 것이 제 개인적인 전망입니다.

***

### **🔸 그리고 여전히 워크플로우 기반이 더 실용적인 경우도 있습니다. (이미 말했던 것 처럼,,)**

* 현실적으로, **모델의 성능이 아무리 높아져도**, **모든 작업에 에이전트 구조가 최적**인 것은 아닙니다.
* **일부 애플리케이션에서는 워크플로우 기반이 더 단순하고, 더 싸고, 더 빠르고, 더 효과적일 수 있습니다.**
* 특히 반복적이고 예측 가능한 흐름이 중요한 경우에는 워크플로우 기반이 여전히 강력한 선택지입니다.

👉 따라서 대부분의 실제 시스템은 **워크플로우와 에이전트를 조합한 Agentic System의 형태**로 구현될 가능성이 높습니다.

## **6. 마무리하며**

이 글에서는 다음과 같은 내용을 정리했습니다:

* **Agent**, **Workflow**, **Agentic System**의 개념과 차이
* Agent Framework의 실용적 가치와 도입 시 고려사항
* **모델의 성능 향상과는 별개로**, 구조 설계와 흐름 설계가 갖는 지속적인 중요성

궁극적으로, 좋은 시스템은 좋은 모델만으로 만들어지지 않습니다.
정보의 흐름을 설계하고, 도구를 연결하고, 신뢰 가능한 방식으로 운영하는 구조적 역량이 앞으로의 AI Engineering에서 더욱 중요한 역할을 하게 될 것입니다.

> “좋은 에이전트는 좋은 모델 위에서 동작합니다.
> 하지만 좋은 시스템은 좋은 흐름과 설계 위에서 만들어집니다.”


## 🔗 주요 참고 자료 링크

* [https://blog.langchain.dev/how-to-think-about-agent-frameworks/](https://blog.langchain.dev/how-to-think-about-agent-frameworks/)
* [https://cdn.openai.com/business-guides-and-resources/a-practical-guide-to-building-agents.pdf?ref=blog.langchain.dev](https://cdn.openai.com/business-guides-and-resources/a-practical-guide-to-building-agents.pdf?ref=blog.langchain.dev)
* [https://www.anthropic.com/engineering/building-effective-agents?ref=blog.langchain.dev](https://www.anthropic.com/engineering/building-effective-agents?ref=blog.langchain.dev)
* [https://arxiv.org/pdf/2505.10468](https://arxiv.org/pdf/2505.10468)
