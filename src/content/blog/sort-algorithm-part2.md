---
pubDatetime: 2018-02-15
modDatetime: 2018-02-15
title: "排序算法Python实现(下)"
slug: "sort-algorithm-part2"
tags:
  - "排序"
description: "排序算法Python实现(下)"
---
文章概览:
1. 归并排序解释以及Python实现
2. 快速排序解释以及Python实现
2. 堆排序解释以及Python实现

- - - - -

## 归并排序
```python
from random import randint

def merge(nums, left, mid, right):
    tmp = [0] * (right - left + 1)
    i, j, k = left, mid+1, 0
    while i <= mid and j <=right:
        if nums[i] < nums[j]:
            tmp[k] = nums[i]
            i += 1
        else:
            tmp[k] = nums[j]
            j += 1
        k += 1
    while i <= mid:
        tmp[k] = nums[i]
        i, k = i+1, k+1
    while j <= right:
        tmp[k] = nums[j]
        j, k = j+1, k+1
    for i in range(len(tmp)):
        nums[left+i] = tmp[i]

def merge_sort(nums, left, right):
    if left == right:
        return
    mid = left + (right - left) // 2
    merge_sort(nums, left, mid)
    merge_sort(nums, mid+1, right)
    merge(nums, left, mid, right)

if __name__ == "__main__":
    nums = [randint(1,100) for _ in range(10)]
    print(nums)
    merge_sort(nums, 0, len(nums)-1)
    print (nums)

```
## 快速排序

## 堆排序
