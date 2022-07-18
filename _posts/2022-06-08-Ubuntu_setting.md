---
title:  "딥러닝 용 Ubuntu 세팅 "
excerpt: "딥러닝 학습을 위한 ubuntu, cuda, cudnn, torch, tensorflow 세팅"

categories:
  - tech
tags:
  - ubuntu
  - cuda
  - cudnn
  - environment

last_modified_at: 2022-06-08T00:00:00-00:00
---

# 1. Ubuntu 재설치
## booting disk 만들기
Ubuntu: <https://ubuntu.com/tutorials/create-a-usb-stick-on-ubuntu#1-overview>   
MAC: <https://ubuntu.com/tutorials/create-a-usb-stick-on-macos#1-overview>
* ~~아래에서는 ubuntu 22.04 LTS Desktop 을 설치한 기준으로 작성함~~
* 현재 시점에서 tensorflow는 cuda 11.2를, pytorch는 11.3을 지원하지만 공통되는 가장 max. cuda 버전인 11.0을 목표로 한다. 
따라서 cuda 11.0에서 지원하는 max. ubuntu desktop 버전 20.04 기준으로 진행
* HDD 데이터 손실을 방지하기 위하여 HDD는 모두 연결하지 않은 상태에서 설치 진행함

# 2.  기본 설정
## 2-1. SSH 설치
```shell
$ sudo apt update
$ sudo apt install openssh-server
```
## 2-2. SSH hotkey 관련 오류
```shell
blah blah blah ~~~
Host key verification failed.
```
이전에 생성된 Key가 충돌하는 경우에 나타나는 오류로
```shell
$ ssh-keygen -R {ip}
```
로 해결할수 있다

## 2-3. 그래픽 드라이버 설치
* 기본 설치 
```shell
$ sudo apt update
$ sudo apt install -y build-essential
$ sudo apt-get install -y freeglut3-dev build-essential libx11-dev libxmu-dev libxi-dev libgl1-mesa-glx libglu1-mesa libglu1-mesa-dev libglfw3-dev libgles2-mesa-dev
$ sudo apt-get install -y libfreeimage3 libfreeimage-dev
```
* (추가) 재부팅시 그래픽 드라이버 타임아웃 오류가 발생함. Nouveau와 충돌이 의심되어 해당 프로세스 추가함
```shell
$ lsmod | grep nouveau
$ sudo apt-get remove nvidia* && sudo apt autoremove
$ sudo apt-get install dkms build-essential linux-headers-generic
$ sudo vi /etc/modprobe.d/blacklist.conf
```
여기에서 아래 내용을 추가한다
```vi
blacklist nouveau
options nouveau modeset=0
```
* 저장후 확인
```shell
$ sudo update-initramfs -u
$ lsmod | grep nouveau
```

* 추천 드라이버 확인 및 설치
```shell
$ ubuntu-drivers devices
$ sudo ubuntu-drivers autoinstall
$ sudo reboot
```
(드라이버 확인시에 뜨는 WARNING:_pkg_get_support nvidia-driver-510-server: package has invalid Support PBheader, cannot determine support level
에 대해서는 아직 원인 및 해결 확인하지 못함)

* 설치된 드라이버 확인
```shell
$ nvidia-smi
```

# 3. CUDA 설정
* 원하는 버전의 cuda 설치를 위해서 기존에 cuda가 설치된 경우 삭제
```shell
$ sudo rm -rf /usr/local/cuda*
```
* 원하는 버전의 cuda 설치
<https://developer.nvidia.com/cuda-toolkit-archive>
* cuda 11.0.3 설치 예시 
```shell
$ wget https://developer.download.nvidia.com/compute/cuda/11.0.3/local_installers/cuda_11.0.3_450.51.06_linux.run
$ sudo sh cuda_11.0.3_450.51.06_linux.run
```

* ~~cuda 11.2의 경우 max supported GCC version이 10이기 때문에, 버전을 맞춰 준다~~
```shell
$ sudo apt-get install gcc-10
$ sudo apt install g++-10
$ sudo update-alternatives --install /usr/bin/gcc gcc /usr/bin/gcc-10 10
$ sudo update-alternatives --install /usr/bin/g++ g++ /usr/bin/g++-10 10
```
설치 진행중 그래픽 driver는 이미 설치한 상태이기 때문에 제외하고 설치한다.
* 
* 설치가 끝난 후, cuda 관련 환경변수를 설정한다
```shell
$ sudo sh -c "echo 'export PATH=$PATH:/usr/local/cuda-11.0/bin' >> /etc/profile"
$ sudo sh -c "echo 'export LD_LIBRARY_PATH=$LD_LIBRARY_PATH:/usr/local/cuda-11.0/lib64' >> /etc/profile"
$ sudo sh -c "echo 'export CUDADIR=/usr/local/cuda-11.0' >> /etc/profile"
$ source /etc/profile
```
* cuda 설치가 잘 되었는지 확인한다
```shell
$ nvcc -V
```

# 4. cuDNN 설정
* local installation file을 다운 ~~(여기서는 cuda 11.2에 맞는 v8.4.0을 기준)~~
<https://developer.nvidia.com/rdp/cudnn-archive>
* 설치도 guide에 맞추어 진행한다
```shell
$ tar -xvf cudnn-linux-x86_64-8.x.x.x_cudaX.Y-archive.tar.xz
$ sudo cp cudnn-*-archive/include/* /usr/local/cuda/include 
$ sudo cp -P cudnn-*-archive/lib/libcudnn* /usr/local/cuda/lib64 
$ sudo chmod a+r /usr/local/cuda/include/cudnn*.h /usr/local/cuda/lib64/libcudnn*
```
* 설치 버전 확인
```shell
$ cat /usr/local/cuda-11.0/include/cudnn_version.h | grep CUDNN_MAJOR -A 2
```

# 5. Anaconda 설치
* 설치파일 다운로드
<https://www.anaconda.com/products/distribution>
* 설치
```shell
$ bash Anaconda3-2022.05-Linux-x86_64.sh
```
* 설치 후 쉘 반영
```shell
$ source ~/.bashrc
```

# 참고. HDD 마운트
* HDD 확인
```shell
$ sudo fdisk -l
```
* UUID 확인
```shell
$ sudo blkid
```

* UUID가 없는? 파티션이 없는 HDD에 대하여 파티션 생성 및 포맷
```shell
$ sudo fdisk /dev/sd*
$ sudo mkfs.ext4 /dev/sd*1
```

* 자동 마운트를 위한 설정
```shell
$ sudo vi /etc/fstab
```
여기에 이런 내용으로 확인한 UUID 추가 (UUID=** /data ext4 defaults 0 0)

* 저장 후 마운트 및 확인
```shell
$ sudo mount -a
$ df -h
```

# 참고
<https://nirsa.tistory.com/332>
<https://gooopy.tistory.com/134>
<https://docs.nvidia.com/deeplearning/cudnn/install-guide/index.html>