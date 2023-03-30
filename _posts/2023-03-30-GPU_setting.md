---
title:  "딥러닝 용 GPU 환경 세팅
excerpt: "딥러닝 학습을 위한 gpu driver, cuda, cudnn 세팅"
toc: true
toc_sticky: true

categories:
  - tech
tags:
  - gpu
  - cuda
  - cudnn
  - environment

last_modified_at: 2023-03-30T00:00:00-00:00
---

# 1. 기존 환경 확인
## nvidia 버전 확인
```shell
apt --installed list | grep nvidia-driver
dpkg -l | grep -i nvidia
```

## cuda 버전 확인
```shell
nvcc -V
```

## cudnn 버전 확인
```shell
# cat /usr/local/cuda-11.0/include/cudnn_version.h | grep CUDNN_MAJOR -A 2
cat /usr/local/cuda-{installed version}/include/cudnn_version.h | grep CUDNN_MAJOR -A 2
```

# 2. 삭제
## 2-1. 기존 Nvidia 드라이버 삭제
```shell
sudo apt update
sudo apt upgrade

sudo apt remove nvidia-drvier-<설치된 버전>
sudo apt remove --purge nvidia-*
sudo apt-get remove --purge nvidia-*

sudo apt autoremove

sudo reboot now
```

## 2-2. 기존 Cuda 삭제
```shell
sudo apt-get --purge -y remove 'cuda*'
sudo apt-get --purge -y remove 'nvidia*'
sudo apt-get autoremove --purge cuda
```

## 2-3. 기존 Cudnn 삭제
```shell
# cudnn remove
sudo rm -rf /usr/local/cuda*
```

## 2-4. 기타
* path 확인
```shell
 sudo vi ~/.bashrc
 sudo vi ~/etc/profile
```
* nouveau 비활성화
```shell
 sudo bash -c "echo blacklist nouveau > /etc/modprobe.d/blacklist-nvidia-nouveau.conf"
 sudo bash -c "echo options nouveau modeset=0 >> /etc/modprobe.d/blacklist-nvidia-nouveau.conf"
```

```shell
cat /etc/modprobe.d/blacklist-nvidia-nouveau.conf
# output should be like below:
# blacklist nouveau
# options nouveau modeset=0

sudo reboot now
```

* 커널 업데이트
```shell
sudo update-initramfs -u
```

# 3. 설치
## 3-1. Nvidia 드라이버 설치
cuda에 맞는 드라이버 버전 확인: <https://docs.nvidia.com/deploy/cuda-compatibility/index.html>
```shell
ubuntu-drivers devices

# 자동설치
sudo ubuntu-drivers autoinstall
# 특정 드라이버를 원하는 경우
sudo apt install nvidia-driver-460

sudo reboot
```

* 설치된 드라이버 확인
```shell
nvidia-smi
# https://jeo96.tistory.com/entry/Ubuntu-2004-CUDA-%EC%9E%AC%EC%84%A4%EC%B9%98
# 여기서 나오는 CUDA Version은 설치된 CUDA Version이 아니고 설치 가능한 CUDA 최신 버전이 출력
```

## 3-2. CUDA 설치
* 원하는 버전의 cuda 설치 (nvidia-smi에서 나오는 max version의 cuda로 설치 진행하였음)
<https://www.tensorflow.org/install/source?hl=ko#gpu>
<https://developer.nvidia.com/cuda-toolkit-archive>
설치 진행중 그래픽 driver는 이미 설치한 상태이기 때문에 제외하고 설치한다.
 
* 설치가 끝난 후, cuda 관련 환경변수를 수정한다
```shell
sudo nano ~/etc/profile
source /etc/profile

sudo nano /etc/ld.so.conf
# include /usr/local/cuda/lib64
```
* cuda 설치가 잘 되었는지 확인한다
```shell
nvcc -V
```

# 4. cuDNN 설정
* local installation file을 다운
<https://developer.nvidia.com/rdp/cudnn-archive>
* 설치도 guide에 맞추어 진행한다
```shell
$ tar -xvf cudnn-linux-x86_64-8.x.x.x_cudaX.Y-archive.tar.xz
$ sudo cp cudnn-*-archive/include/* /usr/local/cuda/include 
# sudo cp cuda/include/* /usr/local/cuda/include 
$ sudo cp -P cudnn-*-archive/lib/libcudnn* /usr/local/cuda/lib64 
# sudo cp -P cuda/lib64/* /usr/local/cuda/lib64 
$ sudo chmod a+r /usr/local/cuda/include/cudnn*.h /usr/local/cuda/lib64/libcudnn*
```
* 설치 버전 확인
```shell
$ cat /usr/local/cuda-11.4/include/cudnn_version.h | grep CUDNN_MAJOR -A 2
$ cat /usr/local/cuda-11.0/include/cudnn_version.h | grep CUDNN_MAJOR -A 2
#cat /usr/local/cuda-10.1/include/cudnn_version.h | grep CUDNN_MAJOR -A 2
```
