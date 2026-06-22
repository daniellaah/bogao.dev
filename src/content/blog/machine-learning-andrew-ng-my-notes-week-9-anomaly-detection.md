---
pubDatetime: 2016-06-20
modDatetime: 2016-06-20
title: "Coursera机器学习笔记(十五) - 异常检测"
slug: "machine-learning-andrew-ng-my-notes-week-9-anomaly-detection"
tags:
  - "Machine Learning"
  - "Notes"
  - "Coursera"
  - "MOOC"
description: "这篇笔记介绍异常检测的基本思路，包括概率建模、阈值判断以及在高维特征场景中的使用方式。"
---
- 课程地址：[Anomaly Detection](https://www.coursera.org/learn/machine-learning/home/week/9)
- 课程Wiki：[Anomaly Detection](https://share.coursera.org/wiki/index.php/ML:Anomaly_Detection)
- 课件：[PPT](https://d396qusza40orc.cloudfront.net/ml/docs/slides/Lecture15.pptx) [PDF](https://d396qusza40orc.cloudfront.net/ml/docs/slides/Lecture15.pdf)

- - - - -
## 一. 概率密度估计
### 1.1 异常检测
对于飞机引擎有特征$x_1$, $x_2$..., 数据集如下所示. 对于一个新的引擎, 我们希望知道它是否是存在异常, 例如下图所示, 有一个可能是正常的引擎, 有一个引擎可能是异常的. 
对于$x_{test}$, 若$p(x_{test})<\epsilon$, 则为异常；若$p(x_{test}) \ge \epsilon$, 则为非异常. 
下面是几个异常检测的应用, 1.监测用户异常行为2.工业制造（飞机引擎）3.监测工作异常的计算机
### 1.2 高斯分布
下图为高斯分布的图形及表达式. 
下面几个图形展示了$\mu$和$\sigma$对高斯分布图形的影响. 
我们假设一个数据集服从高斯分布, 那么$\mu$和$\sigma$可通过如下公式得出：$\mu=\frac{1}{m}\sum_{i=1}^mx^{(i)}$, $\sigma^2=\frac{1}{m}\sum_{i=1}^m(x^{(i)}-\mu)^2$. 
### 1.3 异常检测算法
对于n维的特征向量, 通过如下公式计算$p(x)$：
$$
\begin{align}
p(x) & =p(x_1;\mu_1,\sigma_1^2)p(x_2;\mu_2,\sigma_2^2)p(x_3;\mu_3,\sigma_3^2)...p(x_n;\mu_n,\sigma_n^2) \\\
 & = \Pi_{j=1}^np(x_j;\mu_j,\sigma_j^2)
\end{align}
$$
下图展示了异常检测算法的流程:
举例：
## 二. 开发异常检测系统
### 2.1 开发与评估
在开发学习算法的时候, 我们希望有一种评估这个算法的方式. 为了能够评价一个异常检测系统, 我们假设我们有一些含标签的数据(如果正常, 则$y=0$；如果异常$y=1$).
因为我们要通过训练集来做概率密度估计, 所以认定训练集都是非异常的样本.
下面举个例子. 假设我们有10000个正常的引擎, 20个异常的. 将10000个正常中的6000个作为训练集, 2000个作为交叉验证集, 2000个作为测试集; 再将一半异常的放入交叉验证集, 另一半放入测试集. 下图展示了这种分配数据集的方法, 还有一种方法如下图alternative所示, 不推荐这种方法.
下图展示了一些可以用来评估算法的方式, 前面已经讲过这些内容, 这里就不再赘述. 我们可以利用交叉验证集来选取一个合适的$\epsilon$.
### 2.2 异常检测 vs 监督学习
上一小节我们学习了异常检测算法, 它是一种无监督学习算法, 但是这个算法中的数据集似乎是有标签的("异常", "非异常"), 那么我们为什么不直接使用一种监督学习的方法呢? 这一节我们就来看看异常检测算法和监督学习算法的对比. 
一些异常检测与监督学习应用的例子:
### 2.3 特征选择
当描绘出特征的分布图的时候, 如果近似高斯分布就可以直接使用异常检测. 如果不是高斯分布, 则对特征进行某个数学变换也可以得到近似高斯分布. 如下图所示.   
某些情况下, 在评估异常检测系统的时候, 我们发现对于一个异常点x它的$p(x)$比较大, 这个时候我们就需要对这个点进行分析, 然后总结出一个新的特征 . 如下图所示, 一开始这个点的分布在下左图, 看上去像一个非异常点；分析并加入新的特征之后, 这个点的分布在下右图, 这个时候我们的异常检测系统就可以判断该点为异常点. 
下面举个例子, 我们想要监测计算机是否正常工作. 特征如下图所示. 假设CPU负载和网络流量成线性关系, 如果想要监测某台计算机是否卡在一个死循环中, 我们可以加入$x_5$或$x_6$这样的特征. 正常情况下, 这个特征的值应该保持不大不小, 若某台计算机进入了死循环, 那么它的CPU负载应该很大, 但是网络流量很小, 这个时候这个特征的值就会变的很大. 异常检测系统就很容易监测出这样的情况. 
## 三. Multivariate Gaussian Distribution (Optional)
### 3.1 Multivariate Gaussian Distribution
### 3.2 Anomaly Detection using the Multivariate Gaussian Distribution
