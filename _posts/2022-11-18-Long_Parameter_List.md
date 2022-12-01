---
title:  "매개변수를 질의 함수로 바꾸기"
excerpt: "Refactoring - 11.5"
toc: true
toc_sticky: true

categories:
  - books
tags:
  - refactoring
  - book
  
last_modified_at: 2022-11-18T00:00:00-00:00
---

* 리팩터링 2판 - 마틴 파울러 저 (한빛미디어)

# 매개변수를 질의 함수로 바꾸기
* 매개변수 목록의 중복은 피하는 게 좋으며, 짧을수록 이해하기 쉬움.

```python
# As-is
def availableVacation(anEmployee, grade):
    pass
availableVacation(anEmployee, anEmployee.grade)


# To-be
def availableVacation(anEmployee):
    grade = anEmployee.grade
    pass
availableVacation(anEmployee)
```

* 단, 매개변수를 제거하면 피호출 함수에 원치 않는 의존성이 생기는 경우에는 수행하지 않음.
* 함수가 항상 참조 투명 (referential transparency)해야 한다 - 함수에 똑같은 값을 건네 호출하면 항상 똑같이 동작해야 한다.
* 매개변수를 없애는 대신 가변 전역 변수를 이용하는 일은 하면 안 된다.

# 절차
1. 필요하다면 대상 매개변수의 값을 계산하는 코드를 별도 함수로 추출 해놓는다.
2. 함수 본문에서 대상 매개변수로의 참조를 모두 찾아서 그 매개변수의 값을 만들어주는 표현식을 참조하도록 바꾼다. 하나 수정할 때마다 테스트한다.
3. 함수 선언 바꾸기로 대상 매개변수를 없앤다.

```python
# AS-IS
class Order:
    def finalPrice(self):
        basePrice = self.quantity * self.itemPrice
        if self.quantity > 100:
            discountLevel = 2
        else:
            discountLevel = 1
        return self.discountedPrice(basePrice, discountLevel)

    def discountedPrice(self, basePrice, discountLevel):
        if discountLevel == 1:
            return basePrice * 0.95
        elif discountLevel == 2:
            return basePrice * 0.9
```

```python
# Step 1
class Order:
    def finalPrice(self):
        basePrice = self.quantity * self.itemPrice
        return self.discountedPrice(basePrice, self.discountLevel)  # discountLevel --> self.discountLevel
    
    def discountedPrice(self, basePrice, discountLevel):
        if discountLevel == 1:
            return basePrice * 0.95
        elif discountLevel == 2:
            return basePrice * 0.9

    def discountlevel(self):  # 함수 추출 (임시 변수를 질의 함수로 바꾸기)
        return 2 if self.quantity > 100 else 1
```

```python
# Step 2
class Order:
    def finalPrice(self):
        basePrice = self.quantity * self.itemPrice
        return self.discountedPrice(basePrice, self.discountLevel)
   
    def discountedPrice(self, basePrice, discountLevel):
        if self.discountLevel == 1:  # 매개변수 참조 --> 함수 호출
            return basePrice * 0.95
        elif self.discountLevel == 2:  # 매개변수 참조 --> 함수 호출
            return basePrice * 0.9

    def discountlevel(self):
        return 2 if self.quantity > 100 else 1
```

```python
# Step 3
class Order:
    def finalPrice(self):
        basePrice = self.quantity * self.itemPrice
        return self.discountedPrice(basePrice)  # 함수 선언 바꾸기

    def discountlevel(self):
        return 2 if self.quantity > 100 else 1
    
    def discountedPrice(self, basePrice):  # 함수 선언 바꾸기
        if self.discountLevel == 1:
            return basePrice * 0.95
        elif self.discountLevel == 2:
            return basePrice * 0.9
```
