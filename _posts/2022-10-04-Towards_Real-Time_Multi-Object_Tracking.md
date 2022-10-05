---
title:  "논문 리뷰: Towards Real-Time Multi-Object Tracking"
excerpt: "Wang, Zhongdao, et al. 'Towards real-time multi-object tracking.' European Conference on Computer Vision. Springer, Cham, 2020."
toc: true
toc_sticky: true

categories:
  - papers
tags:
  - object tracking
  - MOT

last_modified_at: 2022-10-04T00:00:00-00:00
---

# Towards Real-Time Multi-Object Tracking
([1. Abstract](#abstract)) \
([2. Introduction](#introduction)) \
([3. Joint Learning of Detection and Embedding](#joint-learning-of-detection-and-embedding)) \
([4. Experiments](#experiments)) \
([5. Conclusion](#conclusion)) 

## Abstract
Modern MOT (multiple object tracking) system은 대부분 'trakcing-by-detection' 패러다임을 따르고 있다. \
이는 곧 detection 모델이 target localization을 하고 난 이후, appearance embedding 모델이 data association을 하는 방식이다. \
이러한 방법은 real-time MOT system 구축시에 efficiency 문제가 있기 때문에, 해당 논문에서는 target detection과 appearance embedding을 하나의 공유 모델로 학습하는 방법을 제안한다.\
추가적으로, 저자는 간단하고 빠른 association 방법을 추가로 제안하여 computation cost를 크게 줄이는 동시에 SOTA 모델과 comparable한 성능을 달성하였다.
또한 코드도 [github](https://github.com/Zhongdao/Towards-Realtime-MOT)에 공개 하였다. 

## Introduction
기존의 모델은 detector와 embedding (re-ID) 모델이 각각 필요하다. 논문에서는 이러한 방법을 Separate Detection and Embedding (SDE) 방법이라 부른다. \
이를 해결하기 위한 feasible한 idea는 detector와 embedding 모델을 하나의 네트워크로 integrate하는 것이다. \
하지만 보통 two-stage detector를 이용하여 low-level feature을 공유하는 이 방법은 two-stage design에 기반하는 근본적인 속도의 한계와 target 숫자가 늘어날 수록 두번째 stage의 숙도가 SDE방법과 마찬가지로 늘어난다는 한계가 있다.\
반면 저자는 single-shot deep network를 이용하여 jointly learns the detector and embedding model (JDE)를 제안한다. \
다시 말하자면, JDE는 하나의 single network에서 detection 결과와 탐지된 detection boxes에 해당하는 appearance embedding을 동시에 출력한다. \
아래 그림은 관련해서 SDE, two-stage, 그리고 JDE의 전반적인 구조를 나타낸다. 
![Figure1](/assets/images/221004/221004_1.png)
실험 결과상으로 Faster R-CNN + QAN embedding 모델 대비 3배 이상의 FPS를 기록하였다. (MOTA 성능은 유사한 수준)

정리해서 이 논문의 contributions는 다음과 같다.
1) SOTA SDE 모델들과 유사한 성능을 내면서, real-time에 가까운 속도를 낼 수 있는 JDE 모델을 제안함. 
2) 이 JDE learning framework를 만들기 위해서 다양한 관점에 분석 및 실험을 함. (이게 contribution 인가??;;)  
3) 그 외에도 실험 성능 관련 저자가 contribution이라고 적어둔 것들이 있으나, 모두 1에 포함되는 내용으로 생략함. 

## Joint Learning of Detection and Embedding
### Problem Settings
JDE 모델은 아래 두가지 objectives를 만족해야 한다. 
1) 각 frame에 나타나는 k개의 bounding box를 가능한 close하게 예측 
2) distance metric (euclidean 또는 cosine)을 통해 같은 id를 가진 연속된 frame의 객체는 다른 id를 가진 객체에 비해서 더 작은 distance 값을 가짐

### Architecture Overview
여러가지 크기의 target에 대한 탐지 성능을 높이기 위해서 Feature Pyramid Network (FPN)을 사용한다. 
* 입력되는 비디오 frame은 feature map을 각각 세가지 scale (1/32, 1/16, 1/8)로 얻기 위해서 backbone network를 통과한다. 
* 더 작은 scale의 feature map은 up-sampled 된 후에 다음 scale의 feature map과 skip connection을 이용해서 fuse한다.
* prediction head는 모두 세가지 scale에서 얻어지고, 각 head는 여러가지 stacked된 convolutional layer로 구성되어 dense prediction map을 출력한다.
* 최종 output의 경우 $$(6A + D) \times H \times W$$의 크기를 가진다. (A: number of anchor, D: dimension of the embedding) 
* 이 출력된 dense prediction map output은 아래와 같이 task에 따라서 세가지로 나뉜다
  * bbox classification $$(2A \times H \times W)$$
  * bbox regression $$(4S \times H \times W)$$
  * embedding map $$(D \times H \times W)$$
위에서 설명한 archtecture는 아래 그림에 대략적으로 나타난다.
![Figure2](/assets/images/221004/221004_2.png)

### Learning to Detect
detection 부분은 standard RPN과 유사하지만 아래의 두가지 차이가 있다. 
1) pedestrian target에 맞추어 ratio, scale, numbers등을 redesign하였다. (anchor의 aspect ratio을 1:3으로 하고 each scale마다 anchor 개수를 4개로 하였으며, anchor range를 11에서 512까지로 했다.) 
2) foreground/background assignment를 위해서 각각 두가지 IOU threshold값을 설정한다. 

(저자가 말한 위의 두가지는 모델 튜닝정도의 작업이지 RPN과 구조적으로 크게 다르다고 말할 수 있는 부분인지는 잘 모르겠다.)
그렇기 때문에 detection model의 loss function은 foreground/background classification loss (cross-entropy)와 bounding box regression loss (smooth L1)로 formulate 된다.

### Learning Appearance Embeddings
appearance embeddings를 학습하기 위해서 metric learning 개념을 이용한다. \
metric learning에서 많이 사용하는 triplet loss를 사용하여 negative sample과의 거리를 최대화하고 positive sample과의 거리를 최소화 하도록 한다. 
<center><img src="/assets/images/221004/221004_3.png" height="50"></center> 

하지만 이런 triplet loss에는 몇기지 문제가 있는데, 하나는 학습 데이터에서 huge sampling space를 필요로 한다는 것이다. \
여기서는 이 문제를 mini-batch에서 모든 negative sample과 hardest positive smaple을 사용해서 계산하고 이를 sum하는 방법으로 해결하려고 한다. 
<center><img src="/assets/images/221004/221004_4.png" height="50"></center>

또다른 문제는 triplet loss가 학습이 느리고 안정적이지 못하다는 것이다. \
이 부분은 triplet loss의 smooth upper bound를 optimize하는 방법을 통해서 해결하려고 한다. 
<center><img src="/assets/images/221004/221004_5.png" height="50"></center>

위에서 말한 smooth upper bound of triplet loss는 아래와 같이 다시 쓸 수 있고, 이 수식은 cross-entropy loss와 유사한 모양이 된다. 
<center><img src="/assets/images/221004/221004_6.png" height="50"></center> 
<center><img src="/assets/images/221004/221004_7.png" height="50"></center>

하지만 cross-entropy와 smooth upper bound of triplet loss는 차이가 있다. \
첫번째는 cross-entropy loss는 smooth upper bound of triplet loss가 embeddings를 directly 이용하는 것과 다르게 학습가능한 class-wise weight를 사용한다는 점이다. \
두번째는 smooth upper bound of triplet loss가 sampled negative instances에서 anchor instance를 추출하는 것과는 다르게, cross-entropy loss는 embedding space의 모든 negative classes에서 anchor instasnce를 추출한다는 점이다.\
논문에서는 세가지 loss (cross-entropy, smooth upper bound of triplet loss, triplet loss)를 실험적으로 분석하여 cross-entropy loss를 embedding learning에 사용하기로 한다. \
즉, 정리하면 box가 foreground로 label되면 해당하는 embedding vector가 dense embedding map으로 추출되고, 이 추출된 embeddings는 공유되는 fully-connnetected layer를 통해서 class-wise logit을 출력한다. 이 과정에서 위에서 말한 cross-entropy loss가 적용된다.\
이 과정에서 여러 scales에서 추출된 embeddings가 같은 공간을 공유하게 되기 때문에, association across scale이 feasible하게 되는 것이다.

### Automatic Loss Balancing
JDE의 prediction head는 multi-task learning problem으로 모델링 될 수 있다. \
간단히 생각하면 joint objective는 모든 scale과 component의 weighted linear sum of losses으로 계산 할 수 있다.\
Optimal한 loss weights를 찾기 위해서, 저자는 논문에서 automatic learning scheme를 제안한다. (task-independent uncertainty를 사용한 것이라고 하는데 다른 논문 참고 필요함) \
(이 논문의 설명만 봤을때는 다른 연구에서 이미 제안한 내용을 가져다가 쓴 것 뿐인데, 왜 이 부분이 contribution으로 들어갔던 건지 이해되지 않는다,,)

### Online Association
이 논문에서 association algorithm이 주요한 부분은 아니지만, 저자는 기존의 SORT대비 더 간단한 association 방법을 제안한다. 
1) tracklet appearance를 처음으로 관측되는 appearance embedding으로 initialize 한다.
2) 들어오는 frame과 pair-wise motion affinity matrix와 appearance affinity matrix를 계산한다.
   (appearance affinity는 cosine similarity를, motion affinity는 Mahalanobis distance를 사용한다.)
3) Hungarian algorithm with cost matrix를 사용하여 linear assignment problem을 푼다.
4) 모든 matched tracklet의 motion state를 Kalman filter를 사용해서 업데이트하고, momentum term을 활용해서 appearance state도 업데이트 한다.

## Experiments
### Datasets and Evaluation Metrics
작은 실험 data로 인해 생기는 bias를 줄이기 위해서 public dataset 총 6개를 합쳐서 사용하였다.
* ETH, CityPersons, CalTech, MOT-16, CUHK-SYSU, PRW dataset

detection accuracy는 AP@0.5를 사용하였고, embeddings의 discriminative ability는 1:N retrieval 실험을 통해서 0.1 false accept rate에서의 true positive rate (TPR@FAR=0.1)를 사용하였다. \
tracking performance는 CLEAR metric중 MOTA를 사용하였다.

### Implementation Details
DarkNet-53을 backone network로 사용하였고, SGD optimizer에서 30에폭 학습하여 사용했다. \
initial learning rate는 $$10^{-2}$$를 사용하였고, 여러 data augmentation (ex. random rotation, random scale, color jittering)이 사용되었다. \
input 해상도는 $$1088 \times 608$$을 사용하였다.\
(FPN을 사용했다고 했었는데, darknet-53이 여러 scacle feature가 fuse되는지 확인 필요)

### Experimental Results
논문에서 설명한 구조에 맞추어 embedding loss중 어떤 것을 사용했을때 성능이 좋았는지, loss weighting 전략은 무엇을 사용하는게 좋았는지 등을 실험결과로 보여준다. \
크게 중요한 내용은 아니기 때문에 공간을 사용해 정리하지는 않는다. \
![Figure8](/assets/images/221004/221004_8.png)

## Conclusion
이 논문에서 저자는 JDE, 즉 target detection과 appearnace feature를 하나의 공유된 모델에서 학습하는 system을 소개했다. \
이는 runtime의 큰 단축을 달성하였고, 거의 real-time 속도에서 MOT system이 수행될 수 있도록 하였다. \
그 와중에 속도뿐 아니라 기존의 online SOTA 모델들과 비교하였을때에도 성능면에서 크게 떨어지지 않는 것을 실험상에서 증명하였다. 

## 개인적으로 추가 정리/확인/공부 할 내용
* 공개 Code 확인
* 실험에서 비교한 QAN embedding 방법 (Yu, Fengwei, et al. "Poi: Multiple object tracking with high performance detection and appearance feature." European Conference on Computer Vision. Springer, Cham, 2016.)
* auto loss balancing에서 사용한 task-dependent uncertainty 관련 (Kendall, Alex, Yarin Gal, and Roberto Cipolla. "Multi-task learning using uncertainty to weigh losses for scene geometry and semantics." Proceedings of the IEEE conference on computer vision and pattern recognition. 2018.)
* CLEAR metrics (Bernardin, Keni, and Rainer Stiefelhagen. "Evaluating multiple object tracking performance: the clear mot metrics." EURASIP Journal on Image and Video Processing 2008 (2008): 1-10.)
* smooth upper bound of the triplet loss (Sohn, Kihyuk. "Improved deep metric learning with multi-class n-pair loss objective." Advances in neural information processing systems 29 (2016).)
* speculate: 1) form a theory or conjecture about a subject without firm evidence. 2)  invest in stocks, property, or other ventures in the hope of gain but with the risk of loss.
* SORT algorithm (Bewley, Alex, et al. "Simple online and realtime tracking." 2016 IEEE international conference on image processing (ICIP). IEEE, 2016.)








