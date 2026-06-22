---
pubDatetime: 2016-04-28
modDatetime: 2016-04-28
title: "Coursera机器学习笔记(六) - 正则化"
slug: "machine-learning-andrew-ng-my-notes-week-3-regularization"
tags:
  - "Machine Learning"
  - "Notes"
  - "Coursera"
  - "MOOC"
description: "如下图所示, 使用三种不同的多项式作为假设函数对数据进行拟合, 从左一和右一分别为过拟合和欠拟合. 对率回归: 解决过拟合问题大致分为两种, 一种是减少特征的数量, 可以人工选择一些比较重要的特征留下, 也可以使用模型选择算法(Mod..."
---
![](http://7xrrje.com1.z0.glb.clouddn.com/screenshot_100.png)
- 课程地址：[Regularization](https://www.coursera.org/learn/machine-learning/home/week/3)
- 课程Wiki：[Regularization](https://share.coursera.org/wiki/index.php/ML:Regularization)
- 课件：[PPT](https://d396qusza40orc.cloudfront.net/ml/docs/slides/Lecture7.pptx) [PDF](https://d396qusza40orc.cloudfront.net/ml/docs/slides/Lecture7.pdf)

- - - - -
## 一. 过拟合
如下图所示, 使用三种不同的多项式作为假设函数对数据进行拟合, 从左一和右一分别为过拟合和欠拟合.
![](http://7xrrje.com1.z0.glb.clouddn.com/screenshot_101.png)
对率回归:
![](http://7xrrje.com1.z0.glb.clouddn.com/screenshot_102.png)
解决过拟合问题大致分为两种, 一种是减少特征的数量, 可以人工选择一些比较重要的特征留下, 也可以使用模型选择算法(Model selection algorithm,后面的课程会介绍)；另一种就是正则化(Regularization).
![](http://7xrrje.com1.z0.glb.clouddn.com/screenshot_103.png)
## 二. 正则化
如图所示的两个假设函数, 其中第二个为过拟合. 那么该如何改变代价函数能够让最中的假设函数不过拟合? 对比两个假设函数我们可以看到, 它们的区别就在于第二个多了两个高阶项. 也就是说, 我们不希望出现后面两个高阶项, 即希望$\theta_3$, $\theta_4$越小越好. 
![](http://7xrrje.com1.z0.glb.clouddn.com/screenshot_831.png)
通过上面的想法, 我们把$\theta_3$, $\theta_4$放到代价函数里, 并且加上很大的权重(1000):
$$
J(\theta)=\frac{1}{2m}\sum_{i=1}^m(h_\theta(x^{(i)})-y^{(i)} )^2+1000\theta_3^2+1000\theta_4^2
$$
现在如果要最小化代价函数, 那么最后两项也必须得最小. 这个时候, 就有$\theta_3\approx0$, $\theta_4\approx0$. 从而这个四次多项式就变成了一个二次多项式, 解决了过拟合的问题. 
![](http://7xrrje.com1.z0.glb.clouddn.com/screenshot_104.png)
对于正则化的一般思路是, 减少特征的数量, 降低模型的复杂度. 所以我们要对每个参数进行惩罚, 从而得到'更简单'的并且可以防止过拟合的模型. 但是在实际问题中我们很难判断哪些特征比较重要, 所以对每一个参数(除了第一个)参数进行惩罚, 将代价函数改为:
$$
J(\theta)=\frac{1}{2m}\left[\sum_{i=1}^m(h_\theta(x^{(i)})-y^{(i)} )^2+\lambda\sum_{i=1}^n\theta_j^2\right]
$$
其中, $\lambda\sum_{i=1}^n\theta_j^2$叫做正则化项(Regularization Term), $\lambda$叫做正则化参数(Regularization Parameter). $\lambda$的作用就是在"更好地拟合数据"和"防止过拟合"之间权衡. 
![](http://7xrrje.com1.z0.glb.clouddn.com/screenshot_105.png)
如过$\lambda$过大的话, 就会导致$\theta_1$、$\theta_2$、$\theta_3$...近似于0, 这样我们的假设函数就为：$h_\theta(x)=\theta_0$. 这时就变成了欠拟合(Underfit). 所以需要选择一个合适的$\lambda$. 后面的课程会讲到自动选择合适的$\lambda$的方法. 
![](http://7xrrje.com1.z0.glb.clouddn.com/screenshot_108.png)
## 三. 正则化线性回归
通过正则化之后的$J(\theta)$我们可以得到对应的梯度下降算法, 如下图所示. 因为我们不对$\theta_0$进行惩罚, 所以将$\theta_0$的规则单独写出来, 其余的参数更新规则如下图第三行公式. 公式前半部分$1-\alpha\frac{\lambda}{m}$是一个比1小一点点的数(教授举了个例子大概是0.99), 而公式的后半部分和没有进行正则化的梯度下降的公式的后半部分是完全一样的. 所以区别就在于前半部分会将$\theta_j$缩小(因为乘了一个小于1的数). 
![](http://7xrrje.com1.z0.glb.clouddn.com/screenshot_112.png)
同样, 在正规方程中, 我们只需要在公式中加上一部分如下图所示. 
![](http://7xrrje.com1.z0.glb.clouddn.com/screenshot_110.png)
即:
$$
\theta=(X^TX+\lambda\begin{bmatrix} 0&0&0&0&...&0\\\ 0&1&0&0&...&0\\\ 0&0&1&0&...&0\\\ 0&0&0&1&...&0\\\ 0&0&0&0&...&0 \\\ 0&0&0&0&...&1 \end{bmatrix})^{-1}X^Ty
$$
并且对于正则化后的正规方程, 只要$\lambda>0$, 括号里的那一项总是可逆的:
![](http://7xrrje.com1.z0.glb.clouddn.com/screenshot_832.png)
## 四. 正则化对率回归
类似地, 正则化逻辑回归中的代价函数和梯度下降如下图所示. 
![](http://7xrrje.com1.z0.glb.clouddn.com/screenshot_114.png)
![](http://7xrrje.com1.z0.glb.clouddn.com/screenshot_111.png)
下图是使用正则化的高级优化算法, 只需要在计算jVal时在后面加上一个正则化项以及在梯度后面减去一个$\frac{\lambda}{m}\theta_j$. 
![](http://7xrrje.com1.z0.glb.clouddn.com/screenshot_113.png)
