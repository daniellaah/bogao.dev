---
pubDatetime: 2016-04-11
modDatetime: 2016-04-11
title: "Coursera机器学习笔记(三) - 多变量线性回归"
slug: "machine-learning-andrew-ng-my-notes-week-2-linear-regression-with-multiple-variables"
tags:
  - "Machine Learning"
  - "Notes"
  - "Coursera"
  - "MOOC"
  - "Linear Regression"
description: "这篇笔记整理多变量线性回归、梯度下降、特征缩放以及正规方程在房价预测问题中的基本用法。"
---
![](http://7xrrje.com1.z0.glb.clouddn.com/screenshot_35.png)
- 课程地址：[Linear Regression with Multiple Variables](https://www.coursera.org/learn/machine-learning/lecture/6Nj1q/multiple-features)
- 课程Wiki：[Linear Regression with Multiple Variables](https://share.coursera.org/wiki/index.php/ML:Linear_Regression_with_Multiple_Variables)
- 课件：[PPT](https://d396qusza40orc.cloudfront.net/ml/docs/slides/Lecture4.pptx) [PDF](https://d396qusza40orc.cloudfront.net/ml/docs/slides/Lecture4.pdf)

- - - - -

## 一. 假设函数, 梯度下降
### 1.1 假设函数
在之前的单变量线性回归中, 我们的问题只涉及到了房子面积这一个特征:
![](http://7xrrje.com1.z0.glb.clouddn.com/screenshot_36.png?imageMogr/v2/thumbnail/!55p)
在实际问题中, 会有很多特征. 例如, 除了房子面积, 还有房子的卧室数量$x_2$, 房子的楼层数$x_3$, 房子建筑年龄$x_4$. 其中, $n$表示特征的数量, $m$表示训练样例的数量, $x^{(i)}$表示$i$个训练样例, $x_j^{(i)}$表示第$i$个训练样例的第$j$个特征. 
![](http://7xrrje.com1.z0.glb.clouddn.com/screenshot_37.png?imageMogr/v2/thumbnail/!55p)
在单变量线性回归中假设函数为${h_\theta(x)=\theta_0+\theta_1x}$类似地, 现在假设函数记作：${h_\theta(x)=\theta_0+\theta_1x_1+\theta_2x_2+...+\theta_nx_n}$可是每次这样写太麻烦了, 为了方便首先定义$x_0=1$(即$x_0^{(i)}=1$), 此时$h_\theta(x)$为：${h_\theta(x)=\theta_0x_0+\theta_1x_1+\theta_2x_2+...+\theta_nx_n}$再令：${\qquad\qquad\theta=\begin{bmatrix}\theta_0\\\ \theta_1\\\ \theta_2\\\\.\\\\.\\\\.\\\ \theta_n \end{bmatrix}\in \rm I\\!R^{n+1}\quad,\qquad\qquad}$ ${x=\begin{bmatrix}x_0\\\x_1\\\x_2\\\\.\\\\.\\\\.\\\x_n \end{bmatrix}\in \rm I\\!R^{n+1}}$  
![](http://7xrrje.com1.z0.glb.clouddn.com/screenshot_829.png)
这样就得到了假设函数的向量表示:${h_\theta(x)=\theta_0x_0+\theta_1x_1+\theta_2x_2+...+\theta_nx_n= \theta^Tx}$
### 1.2 梯度下降
多变量情况下的梯度下降其实没有区别, 只需要把对应的偏导数项换掉即可. 
![](http://7xrrje.com1.z0.glb.clouddn.com/screenshot_40.png?imageMogr/v2/thumbnail/!55p) 
## 二. 特征处理
### 2.1 特征缩放
如果每个特征的范围相差的很大, 梯度下降会很慢. 为了解决这个问题, 我们在梯度下降之前应该对数据做特征归缩放(Feature Scaling)处理, 从而将所有的特征的数量级都在一个差不多的范围之内, 以加快梯度下降的速度. 
假设现在我们有两个特征, 房子的面积和房间的数量. 如下图所示, 他们的范围相差的非常大. 对于这样的数据, 它的代价函数大概如下图左边, 梯度下降要经过很多很多次的迭代才能达到最优点. 如果我们对这两个特征按照右边给出的公式进行特征缩放, 那么此时的代价函数如下图右边所示, 相对于之前, 可以大大减少梯度下降的迭代次数.
![](http://7xrrje.com1.z0.glb.clouddn.com/screenshot_41.png?imageMogr/v2/thumbnail/!55p)
通常我们需要把特征都缩放到$[-1,1]$(附近)这个范围.
![](http://7xrrje.com1.z0.glb.clouddn.com/screenshot_595.png?imageMogr/v2/thumbnail/!55p)
### 2.2 均值归一化
还有一个特征处理的方法就是均值归一化(Mean normalization):
${x_i=\frac{x_i-\mu_i}{max-min}}$或者, 
$$
{x_i=\frac{x_i-\mu_i}{\sigma_i}}
$$
![](http://7xrrje.com1.z0.glb.clouddn.com/screenshot_42.png?imageMogr/v2/thumbnail/!55p)

## 三. 代价函数与学习率 
我们可以通过画出$\mathop{min}\limits_{\theta}J(\theta)$与迭代次数数的关系图来观察梯度下降的运行. 如下图所示, 横坐标是迭代次数, 纵坐标是代价函数的值. 如果梯度算法正常运行的话, 代价函数的图像大概的形状如下图所示. 
![](http://7xrrje.com1.z0.glb.clouddn.com/screenshot_596.png?imageMogr/v2/thumbnail/!55p)
还有一种叫自动收敛测试的方法, 即每次迭代之后观察$J(\theta)$的值, 如果迭代之后下降的值小于$\epsilon$(例如$\epsilon=10^{-3}$)就判定为收敛. 不过准确地选择阈值$\epsilon$是非常困难的, 通常还是使用画图的方法. 
![](http://7xrrje.com1.z0.glb.clouddn.com/screenshot_597.png?imageMogr/v2/thumbnail/!55p)
如果出现了下面的两种情况, 这个时候应该选择更小的$\alpha$. 注意: 1.如果$\alpha$足够小, 那么$J(\theta)$在每次迭代之后都会减小. 2.但是如果太小, 梯度下降会进行的非常缓慢. 
![](http://7xrrje.com1.z0.glb.clouddn.com/screenshot_44.png?imageMogr/v2/thumbnail/!55p)
可以使用下面几个值进行尝试.
![](http://7xrrje.com1.z0.glb.clouddn.com/screenshot_45.png?imageMogr/v2/thumbnail/!55p)

## 四. 特征选择与多项式回归
假设预测房屋价格, 选取房屋的长和宽作为变量, 得到如下的假设函数：
$$
h(\theta)=\theta_0+\theta_1\times frontage+\theta_1\times depth
$$
当然, 我们觉得真正决定房屋价格应该是与房屋的面积有关. 这时候我们也可以重新选择我们的特征$x=frontage\times depth$, 此时的假设函数为：
$$
h(\theta)=\theta_0+\theta_1x
$$
通过这种特征的选择, 我们可能得到一个更好的模型. 
![](http://7xrrje.com1.z0.glb.clouddn.com/screenshot_46.png?imageMogr/v2/thumbnail/!55p)
和这个密切相关的一个概念就是多项式回归(Polynomial Regression). 假设有下图所示的关于房屋价格的数据集, 我们有多种模型去拟合(下图右所示). 第一个模型是一个二次函数, 但是二次函数是一个抛物线, 这里不符合(因为房价不会随着房子面积的增加二减小)；所以我们选择三次函数的模型, 想要使用该模型去拟合. 那么我们该如何将这个模型运用在我们的数据上呢？我们可以将房屋的面积作为第一个特征, 面积的平方作为第二个特征, 面积的立方作为第三个特征, 如下图左下角所示. (这里需要注意的是, $x_0,x_1,x_2$的范围差别会非常大, 所以一定要进行特征缩放处理）
<img id="polynomialregression" src="http://7xrrje.com1.z0.glb.clouddn.com/screenshot_47.png?imageMogr/v2/thumbnail/!55p"/>
除了三次函数模型, 这里也可以选择平方根函数模型, 如下图所示. 
![](http://7xrrje.com1.z0.glb.clouddn.com/screenshot_48.png?imageMogr/v2/thumbnail/!55p)
  
## 五. 正规方程
### 5.1 正规方程
之前我们一直是用的梯度下降求解最优值. 它的缺点就是需要进行很多次迭代才能得到全局最优解. 有没有更好的方法呢? 我们先来看一个最简单的例子, 假设现在的代价函数为$J(\theta)=a\theta^2+b\theta+c$, $\theta$是一个实数. 怎样得到最优解? 很简单, 只要令它的导数为0就可以了. 
![](http://7xrrje.com1.z0.glb.clouddn.com/screenshot_56.png?imageMogr/v2/thumbnail/!55p)
事实上, 代价函数不会像例子那样简单, $\theta$也不是一个实数而是一个$n+1$维的向量. 这样, 我们分别对每个$\theta$求偏导, 再令偏导等于0, 既可以计算出左右的$\theta$了. 但看上去还是很繁琐, 所以下面我们介绍一种向量化的求解方法. 
首先, 在数据集前加上一列$x_0$, 值都为1；然后将所有的变量都放入矩阵$X$中(包括加上的$x_0$)；再将输出值放入向量$y$中. 最后通过公式$\theta=(X^TX)^{-1}X^Ty$, 就可以算出$\theta$的值. 
![](http://7xrrje.com1.z0.glb.clouddn.com/screenshot_57.png?imageMogr/v2/thumbnail/!55p)
下图是一个更通用的表达方式：
![](http://7xrrje.com1.z0.glb.clouddn.com/screenshot_58.png?imageMogr/v2/thumbnail/!55p)
在Octave中, 可用如下命令计算:
  ```matlab
  pinv(x'*x)*x'*y
  ```
这个公式叫做正规方程, 使用这种方法还有一个好处就是不需要进行特征缩放处理. 

### 5.2 梯度下降与正规方程的比较
下图是梯度下降(Gradient Descent)和正规方程(Normal Equation)两种方法优缺点的比较：

|梯度下降|正规方程|
| :---: | :---: |
|需要选择学习率$\alpha$|不需要选择学习率$\alpha$|
|需要很多次迭代|不需要迭代|
|当有大量特征时, 也能正常工作|需要计算$(X^TX)^{-1}$ ($O(n^3)$, n非常大时, 计算非常慢) |
![](http://7xrrje.com1.z0.glb.clouddn.com/screenshot_59.png?imageMogr/v2/thumbnail/!55p)
  
### 5.3 正规方程不可逆的情况
使用正规方程还有一个问题就是$X^TX$可能存在不可逆的情况. 这个时候, 可能是因为我们使用了冗余的特征, 还有一个原因是我们使用了太多的特征(特征的数量超过了样本的数量). 对于这种情况我们可以删掉一些特征或者使用正则化(正则化在后面的课中讲).
![](http://7xrrje.com1.z0.glb.clouddn.com/screenshot_830.png)
