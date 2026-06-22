---
pubDatetime: 2016-06-17
modDatetime: 2016-06-17
title: "Coursera机器学习笔记(十三) - 非监督学习"
slug: "machine-learning-andrew-ng-my-notes-week-8-unsupervised-learning"
tags:
  - "Machine Learning"
  - "Notes"
  - "Coursera"
  - "MOOC"
  - "Unsupervised Learning"
description: "在监督学习中, 我们的训练集包含标签, 如下图所示. 在无监督学习中, 训练集不含标签, 我们使用聚类算法来寻找数据集包含的特定结构. 如下图所示, 数据集可以分为两个不同的簇. 下图为聚类的一些应用"
---
![](http://7xrrje.com1.z0.glb.clouddn.com/screenshot_259.png)
- 课程地址:：[Unsupervised Learning](https://www.coursera.org/learn/machine-learning/home/week/8)
- 课程Wiki：[Unsupervised Learning](https://share.coursera.org/wiki/index.php/ML:Clustering)
- 课件：[PPT](https://d396qusza40orc.cloudfront.net/ml/docs/slides/Lecture13.pptx) [PDF](https://d396qusza40orc.cloudfront.net/ml/docs/slides/Lecture13.pdf)

- - - - -
## 一. 聚类
在监督学习中, 我们的训练集包含标签, 如下图所示. 
![](http://7xrrje.com1.z0.glb.clouddn.com/screenshot_260.png)
在无监督学习中, 训练集不含标签, 我们使用聚类算法来寻找数据集包含的特定结构. 如下图所示, 数据集可以分为两个不同的簇. 
![](http://7xrrje.com1.z0.glb.clouddn.com/screenshot_261.png)
下图为聚类的一些应用. 
![](http://7xrrje.com1.z0.glb.clouddn.com/screenshot_262.png)
## 二. K-均值算法
### 2.1 K-均值算法
这一节我们来介绍k-means算法, 如下图所示, 假设我们想要把下图中的无标签数据分为两个簇. 首先, 我们随机选取两个点作为cluster centroids, 然后计算出这些数据离这两个cluster centroids的距离, 它们离哪个cluster centroid近, 就将它们分配到哪个cluster centroid；（此时数据分为了两块, 我们将它们分别用红色和蓝色标记）我们将红色的cluster centroid移动到所有红色数据的均值的点, 将蓝色的cluster centroid移动到所有蓝色数据的均值的点. 最后重复上面两个步骤, 知道cluster centroid不能再移动为止. 
![](http://7xrrje.com1.z0.glb.clouddn.com/screenshot_263.png)
整个过程如下图所示：
![](http://7xrrje.com1.z0.glb.clouddn.com/clustering.gif)
下面是k-means算法的通用描述. 
输入为K和数据集, 注意这里不再需要添加$x_0=1$这一项. 
![](http://7xrrje.com1.z0.glb.clouddn.com/screenshot_265.png)
首先随机初始化K个 cluster centroid, 记作$\mu_K$. 
Cluster assignment: 遍历所有数据, 若第$i$个数据离第$k$个cluster centroid最近, 则记为：$c^{(i)}=k$. 
Move centroid: 将第$k$个簇的均值赋值给$\mu_k$. 
![](http://7xrrje.com1.z0.glb.clouddn.com/screenshot_266.png)
对于没有明显区分的数据我们也可以使用k-means算法. 
![](http://7xrrje.com1.z0.glb.clouddn.com/screenshot_267.png)
###  2.2 代价函数
![](http://7xrrje.com1.z0.glb.clouddn.com/screenshot_268.png)
![](http://7xrrje.com1.z0.glb.clouddn.com/screenshot_269.png)
### 2.3 随机初始化
下图说明了该如何随机地选取cluster centroid. 
![](http://7xrrje.com1.z0.glb.clouddn.com/screenshot_270.png)
随机初始化可能导致算法得到一个local optima, 如下图所示. 
![](http://7xrrje.com1.z0.glb.clouddn.com/screenshot_271.png)
为了解决上述问题, 我们需要随机初始化多次, 然后计算出每次$J$的值, 最后得到一个更好的最优解. 
![](http://7xrrje.com1.z0.glb.clouddn.com/screenshot_272.png)
### 2.4 K的选择
观察如下数据集, 它们应该分为几个簇呢？有的人会说两个, 也有的说四个. 这一节, 我们来讲该如何选择簇数. 
![](http://7xrrje.com1.z0.glb.clouddn.com/screenshot_273.png)
我们使用Elbow method, 即描绘出$J$关于K的图像, 然后找到"elbow"的位置, 这个位置对应的点就是应该选择的簇数. 如下左图所示. 但是, 我们经常会的到如下右图所示的样子, 它没有一个明显的"elbow", 这样选择就比较困难了. 
![](http://7xrrje.com1.z0.glb.clouddn.com/screenshot_274.png)
另一种选择K的方法, 就是根据我们特定的目标去选. 例如, 在给T恤标尺码的时候, 如果我们想要分成三个尺码S, M, L, 那么我们就应该选择K＝3；如果我们想要分成5个尺码XS, S, M, L, XL那么我们就应该选择K＝5. 
![](http://7xrrje.com1.z0.glb.clouddn.com/screenshot_275.png)
