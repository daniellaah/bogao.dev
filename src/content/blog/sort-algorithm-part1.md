---
pubDatetime: 2018-02-15
modDatetime: 2018-02-15
title: "排序算法Python实现(上)"
slug: "sort-algorithm-part1"
tags:
  - "排序"
description: "排序算法Python实现(上)"
---
![](http://7xrrje.com1.z0.glb.clouddn.com/luxury-silver-pen-with-a-business-diary-picjumbo-com.jpg)
文章概览:
1. 冒泡排序解释以及Python实现
2. 选择排序解释以及Python实现
2. 直接插入排序解释以及Python实现

- - - - -

## 冒泡排序
```python
from random import randint
# time complexity: O(n^2)
# 循环遍历数组, 相邻两个比较, 交换顺序
# 每遍历一次, 都会将'当前最大值'放到'当前最后'的位置
def bubble_sort(nums):
    N = len(nums)
    for i in range(N-1, 0, -1):
        for j in range(0, i):
            if nums[j] > nums[j+1]:
                nums[j], nums[j+1] = nums[j+1], nums[j]

if __name__ == "__main__":
    nums = [randint(0, 100) for _ in range(10)]
    print(nums)
    bubble_sort(nums)
    print(nums)

```
## 选择排序
```python
from random import randint
# time complexity: O(n^2)
# 循环遍历数组, 每次记录最小的数的索引, 与未排序的第一个数交换

def selection_sort(nums):
    if not nums or len(nums) == 1:
        return nums
    N = len(nums)
    for i in range(N-1):
        min_idx = i
        for j in range(i+1, N):
            if nums[j] < nums[min_idx]:
                min_idx = j
        nums[i], nums[min_idx] = nums[min_idx], nums[i]

if __name__ == "__main__":
    nums = [randint(0, 100) for _ in range(10)]
    print(nums)
    selection_sort(nums)
    print(nums)

```
## 直接插入排序
```python
from random import randint
# time complexity: O(n^2)
# 首先将第一个数看成已经排好的数组, 将第二个数按照顺序插入到这个数组中, 以此类推

def insertion_sort(nums):
    if not nums or len(nums) < 2:
        return
    N = len(nums)
    for i in range(N-1):
        j = i + 1
        while j > 0 and nums[j] < nums[j-1]:
            nums[j], nums[j-1] = nums[j-1], nums[j]
            j -= 1

if __name__ == "__main__":
    nums = [randint(0, 100) for _ in range(10)]
    print(nums)
    insertion_sort(nums)
    print(nums)

```
