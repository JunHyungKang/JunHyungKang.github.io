---
title: "DSPy: 프롬프트 엔지니어링의 새로운 패러다임"
date: "2024-06-10"
teaser: "기존의 하드코딩된 프롬프트 엔지니어링에서 벗어나, 선언적이고 스스로 최적화하는 DSPy 프레임워크를 소개합니다."
tags:
  - DSPy
  - LLM
  - Prompt Engineering
  - Python
---

안녕하세요 저는 SK C&C에서 생성형 AI관련 업무를 하고 있는데요,
이번 글을 통해 전통적인 수작업 프롬프트 엔지니어링과 다른 접근 방식을 시도하고 있는 **DSPy**에 대해서 알아보려고 합니다.

## 왜 DSPy 인가

DSPy를 들어보셨나요?
최근 LLM에 관심이 늘어나면서, LangChain, LlamaIndex 등과 같이 여러 가지 툴킷과 연동된 사전 정의된 체인이나 에이전트 형식을 사용하기 쉽게 제공하는 프레임워크가 많이 사용되고 있습니다.

이런 사전 정의된 체인 또는 에이전트의 경우, 한 번의 in/out으로 끝나는 것이 아니라 내부적으로 한 번 이상의 LLM을 호출하는 방식으로 점점 복잡해지고 있습니다.

이 경우 대략적으로 아래와 같은 단계들을 통해 파이프라인을 최적화하게 됩니다.

1. 문제를 여러 개의 단계로 나눔
2. 각각의 단계에서 설정한 작업이 잘 돌아가도록 프롬프트 엔지니어링 수행
3. 각각 최적화된 작업이 함께 돌아가도 성능이 잘 나오는지 확인하고 조정
4. (선택사항) 가능한 경우 각 단계를 미세 조정하기 위한 합성 데이터를 생성하고, 모델을 미세 조정

위와 같은 방식은 파이프라인의 구조를 바꾸거나 데이터 도메인을 변경할 때마다 모든 프롬프트 또는 모델을 변경해야 하는 번거로운 불편이 있습니다.

실제로 저도 LangChain 프레임워크를 자주 사용하고 있는데요.
이전 단계의 LLM 체인 결과가 달라지면 이후 단계의 LLM 체인이 갑자기 잘 작동하지 않거나,
따로 테스트했을 때 문제없이 잘 작동하던 에이전트에 몇 가지 도구를 추가하면 설계했던 추론 경로대로 작동하지 않는 문제를 자주 접하고 있습니다.
이럴 때마다 최적화된 프롬프트로 다시 수정하는 일이 굉장히 번거롭게 느껴져서,
일반화 성능을 높이는 방향으로 프롬프트를 수정하다 보면 어느새 엄청나게 지저분해진 프롬프트를 보게 됩니다.

![LangChain이나 LlamaIndex에서 사전 정의된 작업을 위해 사용하는 프롬프트의 단어 및 문자 크기](/images/dspy-1.jpg)

위 표에서도 우리가 많이 사용하는 프레임워크에서 특정 작업을 위해 사용하는 프롬프트의 크기가 굉장히 큰 것을 볼 수 있습니다.
(특히 이런 프레임워크에 사전 정의된 프롬프트는 영문이기 때문에, 체감되는 비효율성은 더 큰 편입니다.)
즉, trial and error 방식으로 사전에 수작업으로 작성된 프롬프트를 사용하기 때문에 보편적이지만,
성능이나 효율성 측면에서는 최선이 아닐뿐더러, 확장성 측면에서는 한계가 있습니다.

그렇기 때문에 DSPy는 기존의 하드코딩된 'Prompt Templates' 방식에서 벗어나 좀 더 체계적인 접근 방식을 취하고자 합니다.

## 그럼 DSPy란 무엇인가

그럼 DSPy는 무엇일까요?
먼저 DSPy는 **D**eclarative **S**elf-improving Language **P**rograms, p**y**thonically를 뜻한다고 합니다 [2].
즉, 파이썬 스타일로 작성된 선언적이고 스스로 개선되는 기능을 갖춘 자연어 처리 프로그램을 의미합니다.
이 프레임워크에서는 LLM 파이프라인이 무엇을 할 것인지를 명확히 선언하면, 내부적으로 스스로 학습하고 최적화하여 성능을 향상시키는 기능이 있습니다.

이런 목적을 달성하기 위해 DSPy는 signatures, modules, teleprompters라는 3가지 요소로 구성되어 있습니다.

## Signatures

Signatures는 Natural Language Signatures로 함수의 자연어 타입 선언을 의미합니다.
즉, 어떻게 프롬프트되어야 하는지가 아니라, 무엇을 해야 하는지를 알려주는 선언적 명세입니다.
이 Signatures는 입력 필드와 출력 필드의 튜플로 구성됩니다. 아래의 예시를 보면 이해하기 쉽습니다.

(langchain이나 llamaIndex에서 사전 정의된 task를 위해 사용하는 prompt의 word 및 character 사이즈 [1])

```python
# 출처: [1]
qa = dspy.Predict("question -> answer")
qa(question="Where is Guarani spoken?")
# Out: Prediction(answer=’Guarani is spoken mainly in South America.’)
```

(RAG 환경에서 시각적인 비교. 출처: [3])

![RAG 구성에서 시각적인 비교](/images/dspy-2.jpg)

## Modules

위에서 설명한 Signatures를 사용하려면 Predict 모듈을 인스턴스화하여 선언한 것처럼 모듈을 선언해야 합니다.
DSPy에 내장된 모듈들은 널리 알려진 프롬프트 기술들을 모듈식으로 변환하여 Signatures를 사용할 수 있도록 지원합니다
(예: ChainOfThought, ProgramOfThought, MultiChainComparison, ReAct 등). 아래는 ChainOfThought와 RAG의 단순화된 구현입니다.

```python
# 출처: [1]
class ChainOfThought(dspy.Module):
    def __init__(self, signature):
        # Modify signature from ‘*inputs -> *outputs‘ to ‘*inputs -> rationale, *outputs‘.
        rationale_field = dspy.OutputField(prefix="Reasoning: Let’s think step by step.")
        signature = dspy.Signature(signature).prepend_output_field(rationale_field)
        
        # Declare a sub-module with the modified signature.
        self.predict = dspy.Predict(signature)
    
    def forward(self, **kwargs):
        # Just forward the inputs to the sub-module.
        return self.predict(**kwargs)
```

```python
class RAG(dspy.Module):
    def __init__(self, num_passages=3):
        # ‘Retrieve‘는 사용자의 기본 검색 설정을 사용합니다.
        self.retrieve = dspy.Retrieve(k=num_passages)
        # ‘ChainOfThought‘는 검색 및 질문을 받아 답변을 생성하는 서명을 가집니다.
        self.generate_answer = dspy.ChainOfThought("context, question -> answer")
    
    def forward(self, question):
        context = self.retrieve(question).passages
        
        return self.generate_answer(context=context, question=question)
```

## Teleprompters (Optimizers)

공식 다큐먼트나 GitHub 공지에 따르면 Teleprompters를 Optimizers로 이름을 변경한다고 합니다.
저도 이 용어가 더 와닿는 것 같아서 이후부터는 Optimizers라는 용어를 대신 사용하도록 하겠습니다.
Optimizers는 DSPy 프로그램의 매개변수(예: 프롬프트 또는 모델 가중치)를 조정하여 사전에 지정한 메트릭에 맞는 성능을 최대화하는 알고리즘입니다.

일반적인 심층 신경망 모델을 학습할 때와 마찬가지로, Optimizers를 통해 최적화하기 위해서는 메트릭과 데이터가 필요합니다.
현재 사용할 수 있는 Optimizers는 Automatic Few-Shot Learning, Automatic Instruction Optimization, Automatic Finetuning으로 분류되어
각각 최적화된 few-shot 생성 및 선택, 프롬프트 지시문 최적화, LLM 미세 조정을 수행하거나 여러 가지를 앙상블하여 사용할 수 있습니다.

공식 문서에서는 데이터 셋의 크기에 따라 다음과 같이 사용을 권장합니다:

* 데이터가 적은 경우 (예: 10개)는 BootstrapFewShot (Automatic Few-Shot Learning)
* 데이터가 약간 더 많은 경우 (예: 50개)는 BootstrapFewShotWithRandomSearch (Automatic Few-Shot Learning)
* 데이터가 많은 경우 (예: 300개 이상)는 MIPRO (Automatic Instruction Optimization)
* 7B 이상의 LM을 사용하고 효율적인 프로그램이 필요한 경우 BootstrapFinetune (Automatic Finetuning)

아래는 Optimizers의 예시입니다.

```python
# 출처: https://dspy-docs.vercel.app/docs/building-blocks/optimizers
from dspy.teleprompt import BootstrapFewShotWithRandomSearch

# Set up the optimizer: we want to "bootstrap" (i.e., self-generate) 8-shot examples of your program's steps.
# The optimizer will repeat this 10 times (plus some initial attempts) before selecting its best attempt on the devset.
config = dict(max_bootstrapped_demos=4, max_labeled_demos=4, num_candidate_programs=10, num_threads=4)

teleprompter = BootstrapFewShotWithRandomSearch(metric=YOUR_METRIC_HERE, **config)
optimized_program = teleprompter.compile(YOUR_PROGRAM_HERE, trainset=YOUR_TRAINSET_HERE)
```

## 번외: LangChain, LlamaIndex와의 비교

DSPy를 공개한 연구를 진행한 저자의 의견으로는 주요한 차이는 아래와 같습니다.

* DSPy: 새로운 LM 계산 그래프를 구축하기 위한 프롬프트 엔지니어링의 근본적인 문제를 해결하는 것을 목적으로 합니다.
* LangChain & LlamaIndex: 일반적으로 인기 있고 재사용 가능한 파이프라인(예: 특정 에이전트 및 특정 검색 파이프라인)과
    도구(예: 다양한 데이터베이스 연결 및 에이전트를 위한 장기 및 단기 메모리 구현)의 구현을 필요로 하는 애플리케이션 개발자를 돕는 것을 목적으로 합니다.

예를 들어, DSPy가 발표되던 시점의 LangChain 라이브러리에서는 1000자를 초과하는 문자열 50개를 발견했다고 합니다.
실제로도 LangChain에 익숙하신 분들도 아시겠지만, LangChain 코드베이스의 많은 부분은 프롬프트 템플릿과 엔지니어링된 프롬프트에 할애되어 있습니다.
반면, DSPy는 이러한 프롬프트를 자동으로 부트스트랩하는 구조화된 프레임워크를 제공하는 데 집중하고 있습니다.
(따라서 DSPy를 공개하던 시점에는 어떠한 작업에 대해서도 단일 수작업 프롬프트 데모를 포함하지 않는다고 합니다.)
[(참고: 최근 Langchian 프레임워크에도 DSPy Integration이  되었습니다!)](https://python.langchain.com/v0.1/docs/integrations/providers/dspy/)

## 마치며

DSPy는 이미 기존에 PyTorch와 같은 딥러닝 프레임워크에 익숙하시다면 금방 편하게 사용하실 수 있을 것이라고 생각합니다.
레이어 등을 구성하고 최적화기(SGD, Adam 등)를 통해 신경망의 파라미터를 학습하는 개념도 쉽게 받아들일 수 있을 것입니다.

단순한 파이프라인보다는 여러 단계로 수행되어야 하고, 구성 요소들이 서로의 성능에 영향을 미치는 경우 DSPy가 해답이 될 수 있다고 생각합니다.
특히, 어느 정도 정성적인 평가가 중요했던 프롬프트 엔지니어링에 비해, 메트릭스를 고안하는 것이 중요하긴 하지만
사전 설정한 메트릭스에 정량적으로 최적화된 파이프라인을 컴파일을 통해 얻을 수 있다는 점은 매우 유용하다고 생각됩니다.

더불어, 저에게 가장 매력적이었던 부분은 도메인 데이터나 일부 서비스 파이프라인 구조에 변경이 생기면(예: 도구가 추가되거나, RAG를 추가 구성하는 경우)
해당 부분을 수정하고 다시 컴파일만 돌리면 번거로운 수작업을 하지 않아도 된다는 점입니다.

다음에는 DSPy를 통해 실제 간단한 서비스를 구현하고, 일반적으로 많이 사용하는 LLM 프레임워크와 결과를 비교하는 내용을 공유할까 합니다.
물론, 그때까지 더 흥미로운 내용이 생긴다면 그 내용을 우선적으로 다룰 예정입니다.

읽어주셔서 감사합니다!

## 출처

[1] Khattab, Omar, et al. "Dspy: Compiling declarative language model calls into self-improving pipelines." arXiv preprint arXiv:2310.03714 (2023).
[2] What does DSPy stand for? - [GitHub](https://github.com/stanfordnlp/dspy?tab=readme-ov-file#5a-dspy-vs-thin-wrappers-for-prompts-openai-api-minichain-basic-templating:~:text=What%20does%20DSPy%20stand%20for%3F)
[3] https://towardsdatascience.com/intro-to-dspy-goodbye-prompting-hello-programming-4ca1c6ce3eb9
