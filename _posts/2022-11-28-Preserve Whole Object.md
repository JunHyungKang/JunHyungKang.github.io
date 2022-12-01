---
title:  "객체 통째로 넘기기"
excerpt: "Refactoring - 11.4"
toc: true
toc_sticky: true

categories:
  - books
tags:
  - refactoring
  - book
  
last_modified_at: 2022-11-28T00:00:00-00:00
---

* 리팩터링 2판 - 마틴 파울러 저 (한빛미디어)

# 객체 통째로 넘기기
* 레코드를 통째로 넘기면 변화에 대응하기 쉽다. (더 다양한 데이터를 사용하도록 바뀌어도 매개변수 목록은 수정할 필요가 없다)
* 매개변수 목록이 짧아져서 일반적으로는 함수 사용법을 이해하기 쉬워진다.
* 함수가 여러게라면 로직이 중복될 가능성이 커지는데, 이런 로직 중복을 없앨 수 있다.
* 주의: 레코드와 함수가 서로 다른 모듈에 속하여, 함수가 레코드 자체에 의존하기를 원치 않을 때는 수행하지 않는다.

```python
# As-is
low = aRoom.daysTempRange.low
high = aRoom.daysTempRange.high
if aPlan.withinRange(low, high):
    pass


# To-be
if aPlan.withinRange(aRoom.daysTempRAnge):
    pass
```

# 절차
1. 매개변수들을 원하는 형태로 받는 빈 함수를 만든다.
2. 새 함수의 본문에서는 원래 함수를 호출하도록 하며, 새 매개변수와 원래 함수의 매개변수를 매핑한다.
3. 정적 검사를 수행한다.
4. 모든 호출자가 새 함수를 사용하게 수정한다. (하나씩 수정하며 테스트)
5. 호출자를 모두 수정했다면 원래 함수를 인라인 한다.
6. 새 함수의 이름을 적절히 수정하고 모든 호출자에 반영한다.

```python
# AS-IS
class HeatingPlan:
    def __init__(self, temp_low, temp_high):
        self.temp_low = temp_low
        self.temp_high = temp_high
    
    def withinRange(self, bottom, top):
        return (bottom >= self.temp_low) and (top <= self.temp_high)

    
low = aRoom.daysTempRange.low
high = aRoom.daysTempRange.high
aPlan = HeatingPlan(temp_low, temp_high)
if not aPlan.withinRange(low, high):
    print('방 온도가 지정 범위를 벗어났습니다.')
```

```python
# Step 1
class HeatingPlan:
    def __init__(self, temp_low, temp_high):
        self.temp_low = temp_low
        self.temp_high = temp_high
    
    def withinRange(self, bottom, top):
        return (bottom >= self.temp_low) and (top <= self.temp_high)
    
    def xxNEWwithinRange(self, aNumberRange):  # 기존 method를 대체할 새로운 method를 만든다
        pass

        
low = aRoom.daysTempRange.low
high = aRoom.daysTempRange.high
aPlan = HeatingPlan(temp_low, temp_high)
if not aPlan.withinRange(low, high):
    print('방 온도가 지정 범위를 벗어났습니다.')
```

```python
# Step 2
class HeatingPlan:
    def __init__(self, temp_low, temp_high):
        self.temp_low = temp_low
        self.temp_high = temp_high
    
    def withinRange(self, bottom, top):
        return (bottom >= self.temp_low) and (top <= self.temp_high)
    
    def xxNEWwithinRange(self, aNumberRange):  
        return self.withinRange(aNumberRange.bottom, aNumberRange.top)  # 기존 method를 호출하는 코드로 채운다

        
low = aRoom.daysTempRange.low
high = aRoom.daysTempRange.high
aPlan = HeatingPlan(temp_low, temp_high)
if not aPlan.withinRange(low, high):
    print('방 온도가 지정 범위를 벗어났습니다.')
```

```python
# Step 4
class HeatingPlan:
    def __init__(self, temp_low, temp_high):
        self.temp_low = temp_low
        self.temp_high = temp_high
    
    def withinRange(self, bottom, top):
        return (bottom >= self.temp_low) and (top <= self.temp_high)
    
    def xxNEWwithinRange(self, aNumberRange):  
        return self.withinRange(aNumberRange.bottom, aNumberRange.top)

        
# low = aRoom.daysTempRange.low  # 필요없는 코드는 제거 한다
# high = aRoom.daysTempRange.high
aPlan = HeatingPlan(temp_low, temp_high)
if not aPlan.xxNEWwithinRange(aRoom.daysTempRange):  # 기존 함수를 호출하는 코드를 새 함수를 호출하도록 수정한다
    print('방 온도가 지정 범위를 벗어났습니다.')
```

```python
# Step 5
class HeatingPlan:
    def __init__(self, temp_low, temp_high):
        self.temp_low = temp_low
        self.temp_high = temp_high
    
    def withinRange(self, bottom, top):
        return (bottom >= self.temp_low) and (top <= self.temp_high)
    
    def xxNEWwithinRange(self, aNumberRange):  
        return (aNumberRange.low >= self.temp_low) and (aNumberRange.high <= self.temp_high)  # 원래 함수를 인라인 한다

        
aPlan = HeatingPlan(temp_low, temp_high)
if not aPlan.xxNEWwithinRange(aRoom.daysTempRange):
    print('방 온도가 지정 범위를 벗어났습니다.')
```

```python
# Step 5
class HeatingPlan:
    def __init__(self, temp_low, temp_high):
        self.temp_low = temp_low
        self.temp_high = temp_high
    
    def withinRange(self, aNumberRange):  # 새함수의 이름을 변경하고 호출자에 모두 반영한다  
        return (aNumberRange.low >= self.temp_low) and (aNumberRange.high <= self.temp_high)

        
aPlan = HeatingPlan(temp_low, temp_high)
if not aPlan.withinRange(aRoom.daysTempRange):
    print('방 온도가 지정 범위를 벗어났습니다.')
```


