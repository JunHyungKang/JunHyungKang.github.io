---
title:  "Few-Shot Pill Recognition"
teaser: "Few-Shot Pill Recognition 논문 정리"
tags:
  - pill
  - few-shot
  - recognition
  - CVPR
---

# Few-Shot Pill Recognition
github (모델 코드는 없음): https://github.com/suiyiling/Few-shot-pill-recognition
CURE data: https://drive.google.com/drive/folders/1dcqUaTSepplc4GAUC05mr9iReWVqaThN?usp=sharing
Demo video: https://www.youtube.com/watch?v=ueyGlRf-bag&feature=youtu.be

## Abstract
기존의 대부분 알약 분류 모델은 충분하지 않은 실제 조건의 데이터로 인해서 challenging한 *few-shot learning* 문제를 가지고 있다. \
특히 이런 제한된 데이터 상황에서는 많이 다루어지지 않은 조건의 어려운 샘플 알약의 경우에 분류하는 것이 더욱 어렵다 . \
이 논문에서는 이런 문제를 해결하기 위해서 1) CURE 라는 데이터 셋을 만들었고, 2) 더 나은 segmentation을 위해서 light-weight W2-net을 제안한며, 3) 새로운 two-stage 네트워크인 Multi-Stream (MS) 모델을 제안한다. \
이런 구조에서 Batch All 부분은 모든 sub-streams를 가지고 모든 샘플을 고려하고, Batch Hard 부분은 오직 첫 stage에서 어려웠던 샘플을 고려한다. \
이런 방법을 통해서 어렵고 복잡한 샘플에 대해서 더 집중하고 다른 도메인 정보를 효과적으로 사용할 수 있도록 한다. \
이 논문의 모델은 NIH 및 CURE 데이터 셋에서 SOTA 성능을 달성 하였다.

## Introduction



