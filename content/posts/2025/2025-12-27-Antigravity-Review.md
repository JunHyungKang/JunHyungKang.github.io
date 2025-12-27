---
title: "Antigravity 사용 후기: 출시부터 지금까지"
date: "2025-12-27"
teaser: "Antigravity 출시 후 지금까지 사용해본 후기를 공유합니다. 장점, 단점, 그리고 앞으로의 기대까지 정리해봤습니다."
tags:
  - Review
  - Antigravity
  - AI Agent
  - Coding Assistant
  - Cursor
  - Claude Code
---

## 들어가며

Antigravity가 출시된 이후부터 지금까지 꾸준히 사용해오고 있습니다. 오늘은 그동안 이 도구를 사용하며 느꼈던 점들을 솔직하게 풀어보려 합니다.

특히 오늘 **CS146S: The Modern Software Developer** 강의 내용을 훑어보다가 깊은 인상을 받아, 그 내용과 함께 제 생각을 정리해보고 싶었습니다. (이 글에 사용된 이미지의 대부분은 해당 강의 슬라이드 출처임을 밝힙니다.)

![Good News](/images/antigravity-review/software_evolution.png)

![Software 1.0 2.0 3.0](/images/antigravity-review/software_1_2_3.png)

소프트웨어 개발의 패러다임이 Software 1.0에서 2.0, 그리고 3.0으로 넘어가고 있다는 이야기가 많습니다. 저 또한 이러한 변화의 흐름 속에서 AI 코딩 도구들이 어떻게 발전하고 있는지 관심 있게 지켜보고 있습니다.

저는 Antigravity가 아무래도 Google의 Gemini에 최적화되어 있을 가능성이 크다고 판단하여, 주로 **Gemini 3.0 Pro** 모델을 위주로 사용했습니다.

테스트는 주로 다음과 같은 저의 사이드 프로젝트들을 통해 진행했습니다.
*   [Free Utils App](https://www.free-utils.app/)
*   [개인 블로그](https://junhyungkang.github.io/)
*   [곳감(Gotgam)](https://gotgam.vercel.app/)
*   [1형당뇨 환자를 위한 MCP Server](https://github.com/JunHyungKang/t1d-mcp)
*   그 외 다수

---

## 장점

### 1. 매력적인 가격 (무료!)

가장 피부로 와닿는 장점은 역시 **가격**입니다. 현재 무료로 사용할 수 있다는 점이 정말 큽니다.
Gemini 모델 기준으로 주말에 사이드 프로젝트를 진행하며 꽤 하드하게 사용했음에도 불구하고, 아직 **Rate Limit**에 걸린 경험이 없습니다.

물론 저는 **Google AI Pro** 구독자라서 일반 사용자보다 조금 더 넉넉한 할당량을 가지고 있을 수 있습니다. 하지만 이전에 Gemini CLI 도구도 무료로 제공했던 전례를 생각하면, Google이 개발자 생태계 확장을 위해 꽤 공격적인 정책을 펼치고 있는 것 같습니다.

### 2. 다양한 모델 선택지

구글 제품이라 Gemini만 강제할 줄 알았는데, 의외로 **Claude** 모델(Opus 4.5까지)도 사용할 수 있습니다. 이는 "우리 모델도 충분히 경쟁력 있다"는 구글의 자신감일까요?

다만 Claude의 경우, Gemini보다는 Limit이 조금 더 타이트하게 느껴졌습니다. Opus 4.5 기준으로 1시간 넘게 집중적으로 코딩하다 보면 제한이 걸리곤 했습니다. 하지만 다행인 점은, Claude가 멈춰도 Gemini는 여전히 쌩쌩하게 돌아가서 작업 흐름이 끊기지 않았습니다.

### 3. Sync 코딩의 편안함

![Sync vs Async](/images/antigravity-review/sync_vs_async_quadrant.png)

저는 아직 CLI 기반의 완전한 비동기(Async) 코딩 도구보다는, **Cursor**처럼 호흡(Term)이 짧은 **IDE 기반의 코딩 도구**를 선호하는 편입니다. Gemini CLI가 처음 나왔을 때 잠시 써보다가 결국 안 쓰게 된 이유도 너무 긴 호흡 때문이었죠.

Antigravity는 저 같은 성향의 개발자에게 **IDE 기반이면서도 적당히 긴 호흡을 가진 코딩 에이전트**라는 훌륭한 대안이 되어주었습니다. 완전한 실시간도, 완전한 비동기도 아닌 그 중간 어디쯤에서 밸런스를 잘 잡고 있는 느낌입니다. (물론 이 애매함이 뒤에서 언급할 단점이 되기도 합니다.)

### 4. Workflow 기능

아직 깊게 파보지는 못했지만, MCP(Model Context Protocol)와 별개로 제공되는 **Workflow** 기능이 꽤 인상적입니다. Claude의 'Skills'와 비슷한 역할을 할 것으로 기대됩니다.

자주 반복되는 테스트 코드 작성이나, 커밋-푸시-PR 같은 정해진 시퀀스(Sequential Action), 혹은 도메인 지식이 많이 필요한 복잡한 작업들을 미리 정의해두고 사용하면 생산성이 크게 오를 것 같습니다. 아직 본격적으로 활용해보진 못했지만, 잠재력만으로도 충분히 장점으로 꼽을 만합니다.

![Workflow Future](/images/antigravity-review/workflow_future.png)

---

## 단점

### 1. 영어로 출력되는 추론 토큰 (Language Barrier)

제가 설정을 잘못한 것일 수도 있겠지만, Rules나 프롬프트에 분명히 "한글로 진행해줘"라고 가이드를 했음에도 불구하고 **중간 추론 과정(Reasoning)**이 영어로 나오는 경우가 많습니다. (특히 Gemini 사용할 때)

Sync 방식으로 에이전트와 실시간으로 호흡하며 코딩하는 제 입장에서는, 에이전트의 생각 과정을 따라가고 싶은데 **영어-한국어** 사이에서 오는 인지 부하 때문에 순간적으로 버퍼링이 걸리거나 멍해지는 순간들이 있었습니다. 매끄러운 사고의 흐름을 방해하는 요소입니다.

### 2. 애매한 자율성 (Semi-Async의 딜레마)

![Semi Async](/images/antigravity-review/semi_async_awkward.png)

제가 Cursor를 좋아하는 이유는 코딩 호흡이 짧고, 에이전트의 자율성이 제가 통제 가능한 수준으로 약하기 때문에 실시간 협업(Pair Programming)하는 느낌이 들기 때문입니다. 반대로 극단적인 효율을 추구하며 Planning과 Testing에만 집중하는 개발자라면 아예 여러 에이전트를 Async로 돌리는 방식을 선호하겠죠.

Antigravity는 이 둘 사이에서 다소 **애매한 포지션**에 있는 느낌입니다.

*   **불완전한 Multi-Agent:** 완전한 비동기 코딩(Vide Coding 느낌)을 위해 여러 에이전트를 동시에 돌려봤을 때는 서비스 자체가 좀 불안정했습니다. 초창기라 그럴 수 있지만, 맥락 없이 끊기거나 무한 로딩(Hang)에 걸리는 경우가 종종 있었습니다.
*   **과도한 자율성:** 반대로 Agent Mode를 끄고 일반 IDE의 Code Assistant처럼 쓰자니 Cursor보다 자율성이 너무 과하게 느껴집니다. Cursor처럼 명시적으로 Ask, Planning, Agent 모드를 선택할 수 있는 게 아니라, 그냥 'Planning이냐 아니냐' 정도의 옵션밖에 없습니다.
*   **확인 없는 폭주:** 어떤 Action들은 몇 번 시도해보고 안 되면 사용자에게 확인을 받아야 하는데, 그냥 혼자 챗바퀴 돌듯 무한 루프에 빠져서 잘못된 시도를 계속하는 경우가 보였습니다. 결국 강제로 멈추고 개입해야 했습니다.

---

## 결론: 그래도 기대가 되는 이유

*"결국 끝까지 가면 구글이 다 이겨"* 라는 말이 있죠. Antigravity를 쓰면서 문득 그 말이 떠올랐습니다.

지금 제가 단점으로 꼽은 부분들은 서비스 초기 단계의 시행착오거나, 모델 성능이 발전함에 따라 자연스럽게 해결될 수 있는 문제들로 보입니다. 오히려 구글이 그리고 있는 방향성 자체는 맞다는 생각이 듭니다. 문득 Rich Sutton의 **[The Bitter Lesson](http://www.incompleteideas.net/IncIdeas/BitterLesson.html)** 이 떠오르기도 하네요.

저 또한 이제는 Cursor 같은 Sync 방식에만 머무르지 않고, **Claude Code**나 **Antigravity** 같은 도구를 활용해 **Multi Code Agent를 Async로 운용하고 관리하는 방식**에 익숙해져야 할 때가 온 것 같습니다.

![History of Software Teams](/images/antigravity-review/history_of_software_teams.png)

나의 든든한 사이드 프로젝트 메이트, **Antigravity**의 발전을 응원합니다! 화이팅!
