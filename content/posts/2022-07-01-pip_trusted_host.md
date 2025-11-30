---
title:  "Pytorch installation 문제 해결"
date: "2022-07-01"
teaser: "Pytorch 설치시에 발행하는 문제 해결 log"

  - tech
tags:
  - install
  - pytorch
  - problem_solving

---

# 1. SSLError
## Error log
```shell
Could not fetch URL https://download.pytorch.org/whl/torch_stable.html: There was a problem confirming the ssl certificate: HTTPSConnectionPool(host='download.pytorch.org', port=443): Max retries exceeded with url: /whl/torch_stable.html (Caused by SSLError(SSLCertVerificationError(1, '[SSL: CERTIFICATE_VERIFY_FAILED] certificate verify failed: self signed certificate in certificate chain (_ssl.c:1131)'))) - skipping
ERROR: Could not find a version that satisfies the requirement torch==1.10.1+cu111 (from versions: 1.4.0, 1.5.0, 1.5.1, 1.6.0, 1.7.0, 1.7.1, 1.8.0, 1.8.1, 1.9.0, 1.9.1, 1.10.0, 1.10.1, 1.10.2, 1.11.0, 1.12.0)
ERROR: No matching distribution found for torch==1.10.1+cu111
```
## 해결방안
* conda를 활용하여 installation 하는 경우 해당 에러가 발생하지 않는 것 같음
* pip를 활용하여 패키지를 설치하는 경우에는 pip installation command에서 아래와 같이 trusted-host option을 추가하여 certification 에러를 받지 않고 진행할 수 있음
예시
```shell
$ pip install --trusted-host pypi.org --trusted-host pytorch.org --trusted-host download.pytorch.org --trusted-host files.pypi.org --trusted-host files.pytorch.org torch==1.8.1+cpu torchvision==0.9.1+cpu torchaudio==0.8.1 -f https://download.pytorch.org/whl/torch_stable.html
```

pip install --trusted-host pypi.org --trusted-host pytorch.org --trusted-host download.pytorch.org --trusted-host files.pypi.org --trusted-host files.pytorch.org torch==1.10.1+cu111 torchvision==0.11.2+cu111 torchaudio==0.10.1 -f https://download.pytorch.org/whl/cu113/torch_stable.html

* 참고 (코드 중에 request 모듈에서 certificate관련 error가 발생하는 경우)
```python
import ssl
ssl._create_default_https_context = ssl._create_unverified_context
```