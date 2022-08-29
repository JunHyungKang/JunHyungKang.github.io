---
title:  "Kaggle API"
excerpt: "Kaggle API 사용방법 / official document 정리"
toc: true
toc_sticky: true

categories:
  - tech
tags:
  - Kaggle
  - API
  - Competition

last_modified_at: 2022-08-29T00:00:00-00:00
---

# Kaggle API
kaggle을 진행하면서 노트북 환경에서 복잡한 작업을 수행해야 하는 것에 불편함을 느꼈다. \
물론 GPU 지원이 좋기는 하지만 학습 이전에 코드 작성단계에서 local - pycharm 환경을 사용하는 것이 익숙하기 때문에 API를 사용하기로 하였다. \
아래의 글은 공식 API github의 document를 거의 그대로 한국어로만 바꿔서 정리해 놓았다.

## Intro
가장 널리 알려진 DS/ML competition 플랫폼인 [kaggle]<https://www.kaggle.com> 에서는 python3을 사용하는 official API를 제공한다\
* 참고로 1.5.0이전의 API 버전에서는 competition 결과 제출이 되지 않는다고 하니 아래의 명령어로 미리 버전을 확인해 보자
```shell
kaggle --version
```

* Version Upgrade
```shell
pip install kaggle --upgrade
```

## Installation
* pip를 지원하기 때문에 아래의 명령어로 간단히 설치 가능
```shell
pip install kaggle

pip install --user kaggle  # mac/linux에서 설치중 문제가 발생하는 경우
# sudo 권한으로 설치하면 나중에 permissions error가 발생한다고 하니 사용하지 말자
# python 2는 지원하지 않는다
# "kaggle: command not found" 오류 발생시 패키지가 설치된 위치를 확인해 보자
```

## API credentials
1. 본격적으로 API를 사용하기 위해서 kaggle에 로그인한 후 profile - Account - Create API Token를 진핸하여 kaggle.json 파일을 다운 받는다
2. 해당 파일을 ~/.kaggle 폴더안으로 옮겨준다\
* MAC의 경우 보통 user아래에 .kaggle폴더가 있는데, 없으면 만들어 주거나 아래와 같이 command를 넣으면 오류와 함께 생성된다
```shell
kaggle config path
```

## Commands
* 기본적인 명령어 틀
```shell
kaggle competitions {list, files, download, submit, submissions, leaderboard}
kaggle datasets {list, files, download, create, version, init}
kaggle kernels {list, init, push, pull, output, status}
kaggle config {view, set, unset}
```

### Competitions
```shell
# available한 competition 목록 확인
kaggle competitions list [-h] [--group GROUP] [--category CATEGORY] [--sort-by SORT_BY] [-p PAGE] [-s SEARCH] [-v]
# example_1: kaggle competitions list -s health
# example_2: kaggle competitions list --category gettingStarted

# competitions files 확인
kaggle competitions files [-h] [-v] [-q] [competition]
# example: kaggle competitions files favorita-grocery-sales-forecasting

# competition files 다운로드
kaggle competitions download [-h] [-f FILE_NAME] [-p PATH] [-w] [-o] [-q] [competition]
# example_1: kaggle competitions download favorita-grocery-sales-forecasting
# example_2: kaggle competitions download favorita-grocery-sales-forecasting -f test.csv.7z

# 결과 submit
kaggle competitions submit [-h] -f FILE_NAME -m MESSAGE [-q] [competition]
# example: kaggle competitions submit favorita-grocery-sales-forecasting -f sample_submission_favorita.csv.7z -m "My submission message"

# submit한 결과 확인
kaggle competitions submissions [-h] [-v] [-q] [competition]
# example: kaggle competitions submissions favorita-grocery-sales-forecasting

# 리더보드 확인
kaggle competitions leaderboard [-h] [-s] [-d] [-p PATH] [-v] [-q] [competition]
# example: kaggle competitions leaderboard favorita-grocery-sales-forecasting -s
```

### Datasets, Kernels, config
```shell
# 각 command에 대하여 help로 자세한 사항은 확인 필요
kaggle datasets [-h] {list, files, download, create, version, init, metadata, status}
kaggle kernels [-h] {list, init, push, pull, output, status}
kaggle config [-h] {view,set,unset}
```