---
title:  "Mastering Atari, Go, Chess and Shogi by Planning with a Learned Model"
excerpt: "Muzero by Deepmind"
toc: true
toc_sticky: true

categories:
  - papers
tags:
  - paper
  - reinforcement learning

last_modified_at: 2019-12-22T09:00:00-00:00
---
<https://arxiv.org/abs/1911.08265>

## Abstract & Introduction 요약
MuZero는 deepmind에서 2019년에 새롭게 선보인 알고리즘입니다.

**주요 사항:**
* 기존에 AlphaGo나 AlphaZero와 다르게 도메인의 rule를 모르는 상태에서도 learned model를 통한 planning으로 학습 가능
* 기존의 model based RL은 Atari같이 visually rich한 도메인에서는 성능을 제대로 보이지 못하였고, model free RL은 체스나 바둑같은 정교한 planning을 요구하는 도메인에서는 성능을 제대로 보이지 못함.
* MuZero는 simulator 없이 hidden state로 부터 policy, value, reward를 실제 observation와 match하도록 훈련을 시킴으로서 두 도메인 모두에서 뛰어난 성능을 보임

**논문을 보면서 추가 학습 및 보중이 필요한 사항:**
* lookahead search에 기반한 planning 알고리즘이란?
* checkers?
* end-to-end 학습?
* trajectory?

---

## Abstract

계획 능력을 갖춘 에이전트를 구축하는 것은 오랫동안 인공 지능을 추구하는 주요 과제 중 하나였습니다.

Tree- based planning 방법은 체스, 바둑과 같이 완벽한 시뮬레이터가 있는 도전적인 domain들에서 큰 성공을 거두었습니다.

하지만 현실에서 enviroment는 자주 복잡하고 알 수 없습니다.

이번 연구에서 학습된 모델과 tree-based search의 조합으로 만든 Muzero 알고리즘이 visually 복잡한 도메인에서 **어떠한 기본 지식도 갖추지 않을 상태**에서 놀라운 능력을 달성함을 보여줍니다.

MuZero는 반복적으로 적용될 때 보상(reward), 행동 선택 정책(action selection policy) 및 가치 함수(value function)와 같이 계획(planning)과 가장 직접적으로 관련된 수량(quantities)을 예측하는 모델을 배웠습니다.

57개의 Atari games로 평가했을때, 이 새로운 알고리즘은 새로운 SOTA를 달성했습니다.

바둑, 체스, 장기에서 게임 룰에 대한 지식없이 그런 게임 룰를 제공받은 AlphaZero 알고리즘와 겨루었을때 더 높은 퍼포먼스를 보여줍니다.

## 1 Introduction
lookahead search에 기반한 planning 알고리즘(?)은 AI 분야에서 큰 성공을 거두었습니다.

checkers(?), 체스, 바둑, 그리고 포커에서 사람 챔피언은 패배하였고, planning 알고리즘은 물류에서 화학적 합성에 이르기까지 실제 현실에 큰 영향을 끼쳤습니다.

그러나 이러한 계획 알고리즘은 모두 게임 규칙 또는 정확한 시뮬레이터와 같은 환경 역학에 대한 지식에 의존하여 로봇 공학, 산업 제어 또는 지능 보조와 같은 실제 영역에 직접 적용 할 수 없습니다.

RL (Model-based Reinforcement Learning)은 먼저 환경 을 학습한 다음 학습된 모델과 관련하여 계획(planning)함으로써 이 문제를 해결하는 것을 목표로 합니다.

일반적으로 이러한 모델은 실제 환경 상태나 전체 observation 순서를 재구성하는 데 중점을 둡니다.

하지만 이전의 연구들은 visually rich한 도메인 (such as Atari 2600 games)에서 SOTA와 멀리 떨어져 있습니다.
대신 가장 성공적인 방법들은 model-free RL이다. (이것들은 optimal policy 와/또는 value function을 환경과 상호작용에서 직접적으로 예측합니다)

하지만 model-free 알고리즘은 체스나 바둑처럼 정확하고 정교한 미리보기를 요구로 하는 도메인에서 SOTA에서 많이 떨어져 있습니다.

이 논문에서는 체스, 장기, 바둑과 같이 **정확한 planning task의 퍼포먼스를 유지하면서도 visually 복잡한 도메인 집합인 Atari 2600에서 SOTA를 달성한 model based RL인 MuZero**를 소개합니다.

MuZero는 AlphaZero의 강력한 검색 및 검색 기반 정책 반복 알고리즘을 기반으로하지만 학습 모델을 교육 절차에 통합 합니다.

또한 MuZero는 AlphaZero를 싱글 에이전트 도메인과 중간 step에서의 non-zero reward를 포함한 더 넓은 환경으로 확장합니다.

알고리즘의 주요 아이디어 (그림 1에 요약)는 계획과 직접 관련된 미래의 측면을 예측하는 것입니다.

모델은 관측치 (예 : 바둑판 또는 Atari 화면 이미지)를 입력으로 받아 hidden state로 전달합니다.

그러면 hidden state는 이전의 hidden state와 가설상 다음 action을 수신하는 recurrent 프로세스에 의해 반복적으로 업데이트됩니다.

매 step마다 모델은 정책 (예 : 게임 이동), 가치 기능 (예 : 예상 우승자) 및 즉각적인 보상 (예 : 이동으로 득점 한 점수)을 예측합니다.

이 모델은 search로 generated된 발전된 policy과 value의 예측이 observed reward와 match될 수 있도록, 이 세가지 중요한 quantities를 정확하게 예측하게끔 end-to-end로 학습됩니다.

hidden state에는 원래 observation을 재구성하는 데 필요한 모든 정보를을 캡처하는것에 직접적인 제한이나 요구사항이 없고, 이것이 model이 유지 관리하고 예측하는 데 필요한 정보의 양을 대폭 줄입니다.
또한 hidden state가 환경의 알려지지 않은 실제 상태와 일치하도록 요구하지도 않습니다. 그리고 state semantics에 대한 다른 제약도 없습니다.

대신, hidden state는 현재와 미래의 가치와 정책을 예측하는 데 어떤 식 으로든 상태를 자유롭게 표현할 수 있습니다.

직관적으로 에이전트는 내부적으로 가장 정확한 계획으로 이어지는 규칙 또는 역학을 발명 할 수 있습니다.

![Figure1](/assets/images/191222_MuZero_1.PNG)

Figure 1:
(A) **MuZero가 model을 plan하기 위해 어떻게 사용하는지 보여줍니다.** model은 representation, dynamics, 그리고 prediction의 세가지 연결된 components로 구성됩니다. (주어진 이전의 hidden state s^k-1^과 후보 action a^k^, dynamics function g가 만드는 즉각적인 reward r^k^, 그리고 새로운 hidden state s^k^)
Policy P^k^와 value function v^k^는 hidden state s^k^로 부터 prediction function f를 사용해서 계산됩니다.
최초의 hidden state s^0^는 지난 observations (바둑판이나 Atri 화면)으로 부터 얻어져서 representation function h에 입력됩니다.
(B) **MuZero가 환경에서 어떻게 행동하는지를 보여줍니다.** (A)에서 설명된 것 처럼 MCTS가 매 timestep마다 수행됩니다. action a~t+1~는 root 노드에서 매 action에 visit count에 proportional 되는 search policy $\pi$~t~에서 sampling 됩니다. 환경은 action를 받고 새로운 observation o~t+1~과 reward u~t+1~을 생성합니다. 에피소드의 마지막에서는 trajectory data가 replay buffer에 저장됩니다.
(C) **MuZero가 model을 어떻게 훈련시키는지 보여줍니다.** trajectory는 replay buffer에서 sampled 됩니다. 최초의 step에서 representation function h는 과거의 observation o~1~, ..., o~t~를 선택된 trajectory로부터 input으로 받습니다. model은 이후에 K steps 만큼 반복적으로 진행됩니다. 매 k step마다 dynamics function g는 이전의 step 에서 hidden state s^k-1^와 실제 action a~t+k~를 입력으로 받습니다. representation, dynamics, 그리고 prediction function의 parameters는 세가지 quantities를 예측하기 위해서 backpropagation-through-time으로 end-to-end로 결합되서 훈련됩니다. (세가지 quantities: policy P^k^ $\approx \pi$~t+k~, value function v^k^  $\approx$ z~t+k~, 그리고 sample return z~t+k~에서의 reward r~t+k~ $\approx$ u~t+k~: 보드 게임에서는 final reward이고 Atari에서는 n-step return)
