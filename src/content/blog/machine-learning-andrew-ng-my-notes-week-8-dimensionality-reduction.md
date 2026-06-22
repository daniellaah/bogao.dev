---
pubDatetime: 2017-01-01
modDatetime: 2017-01-01
title: "Coursera机器学习笔记(十四) - 数据降维"
slug: "machine-learning-andrew-ng-my-notes-week-8-dimensionality-reduction"
tags:
  - "Machine Learning"
  - "Notes"
  - "Coursera"
  - "MOOC"
description: "这篇笔记介绍降维的直觉、PCA 的基本做法，以及为什么降维能帮助压缩数据和提升学习效率。"
---
![](http://7xrrje.com1.z0.glb.clouddn.com/screenshot_276.png)
- 课程地址：[Dimensionality Reduction](https://www.coursera.org/learn/machine-learning/home/week/8)
- 课程Wiki：[wiki](https://share.coursera.org/wiki/index.php/ML:Dimensionality_Reduction)
- 课件：[PPT](https://d396qusza40orc.cloudfront.net/ml/docs/slides/Lecture14.pptx) [PDF](https://d396qusza40orc.cloudfront.net/ml/docs/slides/Lecture14.pdf)

- - - - -

## 一. 数据降维
对于如下图所示的二维特征, 我们可以找到一条直线, 将所有的点投射到这条直线上, 这样就将二维的数据降到了一维, 得到一个新的特征$z_1$. 降维不仅可以让我们节省空间, 更重要的是可以让学习算法运行的更快. 
![](http://7xrrje.com1.z0.glb.clouddn.com/screenshot_278.png)
同样的, 可以将三维数据降到二维数据. 
![](http://7xrrje.com1.z0.glb.clouddn.com/screenshot_279.png)
降维也可以更好地可视化数据. 如下图的例子, 这里一共有6个特征, 该如何更好地展示这些数据？
![](http://7xrrje.com1.z0.glb.clouddn.com/screenshot_280.png)
上面的数据不利于我们对数据进行可视化, 但是通过降维之后, 我们得到如下的数据, 
![](http://7xrrje.com1.z0.glb.clouddn.com/screenshot_281.png)
这样就可以轻松地描绘出这些数据了. 
![](http://7xrrje.com1.z0.glb.clouddn.com/screenshot_282.png)
## 二. PCA
### 2.1 什么是PCA
PCA(主成分分析, Principal components analysis)是用来对数据降维的非监督学习算法. 假设我们有如下图所示的数据, 我们希望将数据降到一维, 那么PCA是如何找到那条合适的直线？
![](http://7xrrje.com1.z0.glb.clouddn.com/screenshot_300.png)
也许下面红色的线比较适合, 因为每个点投影到这条直线的距离都非常小. 
![](http://7xrrje.com1.z0.glb.clouddn.com/screenshot_301.png)
相反地, 每个点投影到下图中的粉色线的距离都非常大. 
![](http://7xrrje.com1.z0.glb.clouddn.com/screenshot_302.png)
PCA就是找到一条直线, 使得每个样本到这条直线的投影距离(或者叫投射误差)最小.
![](http://7xrrje.com1.z0.glb.clouddn.com/screenshot_284.png)
通过上面的内容也许会让我们想到线性会对, 但PCA和线性回归是完全不同的两个算法. 在线性回归中(下左图), 我们想要的是能够拟合数据的一条直线, 最小化的是两点之间$y$的差；而在PCA中我们最小化的是点到直线的距离(注意下右图中点垂直于线的距离). 并且, 在线性回归中, 有一个标签$y$；而在PCA中所有的都是特征. 
![](http://7xrrje.com1.z0.glb.clouddn.com/screenshot_285.png)  
![](http://7xrrje.com1.z0.glb.clouddn.com/screenshot_286.png)
### 2.2  PCA算法
在使用PCA之前, 我们需要对数据进行feature scaling/mean normalization处理. 
![](http://7xrrje.com1.z0.glb.clouddn.com/screenshot_287.png)
在PCA中, 我们需要计算的就是向量$u$和新的特征$z$.   
![](http://7xrrje.com1.z0.glb.clouddn.com/screenshot_288.png)
首先我们需要计算出矩阵$\Sigma$, 然后使用奇异值分解(sigular value decomposition)来计算$[U, S, V]$. 我们需要的就是$n \times n$的矩阵$U$, 如果我们需要将数据从n维降到k维, 取U的前k列, 记为$U_{reduce}$. 
![](http://7xrrje.com1.z0.glb.clouddn.com/screenshot_289.png)
最后通过如下的方法得到$z$. 
![](http://7xrrje.com1.z0.glb.clouddn.com/screenshot_290.png)
下图是对PCA的总结. 
![](http://7xrrje.com1.z0.glb.clouddn.com/screenshot_291.png)
## 三. 使用PCA
### 3.1 恢复原数据
数据降维候, 我们可以通过$X_{approx}^{(1)}=U_{reduce}.z^{(1)}$来的得到原始数据的近似值. 
  ![](http://7xrrje.com1.z0.glb.clouddn.com/screenshot_292.png)
### 3.2 选择合适的维度
那么该如何选择k的值？一般选择一个最小的k并且满足下图中的公式. 
![](http://7xrrje.com1.z0.glb.clouddn.com/screenshot_293.png)
我们可以使用下左图中的算法来选择k的值, 但是这样做效率太低；更好的选择是使用下右图中的方法, 在调用一次SVD之后, 我们只需要找到一个最小的k并且满足$\frac{\sum_{i=1}^kS_{ii}}{\sum_{i=1}^nS_{ii}} ge 0.99$即可. 
![](http://7xrrje.com1.z0.glb.clouddn.com/screenshot_294.png)
即：
![](http://7xrrje.com1.z0.glb.clouddn.com/screenshot_295.png)
### 3.3 PCA总结
![](http://7xrrje.com1.z0.glb.clouddn.com/screenshot_296.png)
![](http://7xrrje.com1.z0.glb.clouddn.com/screenshot_297.png)
注意, 不要使用PCA来解决过拟合的问题. 
![](http://7xrrje.com1.z0.glb.clouddn.com/screenshot_298.png)
在使用PCA之前应该考虑先使用原始数据, 如果使用原始数据不能达到效果, 再考虑使用PCA. 
![](http://7xrrje.com1.z0.glb.clouddn.com/screenshot_299.png)
