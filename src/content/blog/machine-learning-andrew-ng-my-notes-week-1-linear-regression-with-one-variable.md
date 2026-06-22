---
pubDatetime: 2016-04-08
modDatetime: 2016-04-08
title: "Coursera机器学习笔记(二) - 单变量线性回归"
slug: "machine-learning-andrew-ng-my-notes-week-1-linear-regression-with-one-variable"
tags:
  - "Machine Learning"
  - "Notes"
  - "Coursera"
  - "MOOC"
  - "Linear Regression"
description: "这一节我们来学习单变量的线性回归模型, 首先了解基本概念"
---
![](http://7xrrje.com1.z0.glb.clouddn.com/screenshot_02.png)
- 课程地址：[Linear Regression with One Variable](https://www.coursera.org/learn/machine-learning/home/week/1)
- 课程Wiki：[Linear Regression with One Variable](https://share.coursera.org/wiki/index.php/ML:Linear_Regression_with_One_Variable)
- 课件：[PPT](https://d396qusza40orc.cloudfront.net/ml/docs/slides/Lecture2.pptx) [PDF](https://d396qusza40orc.cloudfront.net/ml/docs/slides/Lecture2.pdf)

- - - - -

## 一. 基本概念
这一节我们来学习单变量的线性回归模型, 首先了解基本概念. 
### 1.1 训练集
由训练样例(training example)组成的集合就是训练集(training set), 如下图所示, 其中$(x, y)$是一个训练样例, $(x^{(i)}, y^{(i)})$是第$i$个训练样例. 
   ![](http://7xrrje.com1.z0.glb.clouddn.com/screenshot_05.png?imageMogr/v2/thumbnail/!45p)
### 1.2 假设函数
使用某种学习算法对训练集的数据进行训练, 我们可以得到假设函数(Hypothesis Function), 如下图所示. 在房价的例子中，假设函数就是一个房价关于房子面积的函数。有了这个假设函数之后, 给定一个房子的面积我们就可以预测它的价格了.
![](http://7xrrje.com1.z0.glb.clouddn.com/screenshot_583.png?imageMogr/v2/thumbnail/!55p)
我们使用如下的形式表示假设函数, 为了方便$h_\theta(x)$也可以记作$h(x)$.
$$
{h_\theta(x)=\theta_0+\theta_1x}
$$
以上这个模型就叫做单变量的线性回归(Linear Regression with One Variable). (Linear regression with one variable = Univariate linear regression，univariate是one variable的装逼写法.) 
![](http://7xrrje.com1.z0.glb.clouddn.com/screenshot_584.png?imageMogr/v2/thumbnail/!55p)  

## 二. 代价函数
### 2.1 什么是代价函数
只要我们知道了假设函数, 我们就可以进行预测了. 关键是, 假设函数中有两个未知的量$\theta_0, \theta_1$. 当选择不同的$\theta_0$和$\theta_1$时, 我们模型的效果肯定是不一样的. 如下图所示, 列举了三种不同的$\theta_0$和$\theta_1$下的假设函数. 
![](http://7xrrje.com1.z0.glb.clouddn.com/screenshot_08.png)
现在的问题就是该如何选择这两个参数了. 我们的想法是选择某个
$\theta_0$和$\theta_1$，使得对于训练样例$(x,y)$，$h_\theta(x)$最"接近"$y$。越是接近, 代表这个假设函数越是准确, 这里我们选择均方误差来作为衡量标准, 即我们想要每个样例的估计值与真实值之间差的平方的均值最小。用公式表达为:

$$
{\mathop{minimize}\limits_{\theta_0,\theta_1} \frac{1}{2m}\sum_{i=0}^m\left(h_\theta(x^{(i)})-y^{(i)}\right)^2}
$$

(其中的$1/2$只是为了后面计算的方便)我们记:

$$
{J(\theta_0,\theta_1)=\frac{1}{2m}\sum_{i=0}^m\left(h_\theta(x^{(i)})-y^{(i)}\right)^2}
$$

这样就得到了我们的代价函数(cost function), 也就是我们的优化目标, 我们想要代价函数最小:
$$
\mathop{minimize}\limits_{\theta_0,\theta_1}J(\theta_0,\theta_1)
$$
![](http://7xrrje.com1.z0.glb.clouddn.com/screenshot_10.png?imageMogr/v2/thumbnail/!45p)

### 2.2 代价函数与假设函数
现在为了更方便地探究$h_\theta(x)$与$J(\theta_0,\theta_1)$的关系, 先令$\theta_0$等于0, 得到了简化后的假设函数，有假设函数的定义可知此时的假设函数是经过原点的直线. 相应地也也得到简化的代价函数。如图所示:
![](http://7xrrje.com1.z0.glb.clouddn.com/screenshot_11.png?imageMogr/v2/thumbnail/!45p)
简化之后，我们令$\theta_1$等于1, 就得到$h_\theta(x)=x$如下图左所示。图中三个红叉表示训练样例，通过代价函数的定义我们计算得出$J(1)=0$，对应下图右中的$(1,0)$坐标。
![](http://7xrrje.com1.z0.glb.clouddn.com/screenshot_12.png?imageMogr/v2/thumbnail/!45p)
重复上面的步骤，再令$\theta_1=0.5$，得到$h_\theta(x)$如下图左所示。通过计算得出$J(0.5)=0.58$，对应下图右中的$(0.5,0.58)$坐标。
![](http://7xrrje.com1.z0.glb.clouddn.com/screenshot_13.png?imageMogr/v2/thumbnail/!45p)
对于不同的$\theta_1$，对应着不同的假设函数$h_\theta(x)$，于是就有了不同的$J(\theta_1)$的值。将这些点连接起来就可以得到$J(\theta_1)$关于$\theta_1$的函数图像，如下图所示：
![](http://7xrrje.com1.z0.glb.clouddn.com/screenshot_14.png?imageMogr/v2/thumbnail/!45p) 
我们的目标就是找到一个$\theta$使得$J(\theta)$最小, 通过上面的描点作图的方式, 我们可以从图中看出, 当$\theta_1=1$的时候, $J(\theta)$取得最小值. 

### 2.3 代价函数与假设函数II  
在上一节中，我们令$\theta_0$等于0, 并且通过设置不同的$\theta_1$来描点作图得到$J(\theta_1)$的曲线。这一节我们不再令$\theta_0=0$, 而是同时设置$\theta_0$和$\theta_1$的值, 然后再绘出$J(\theta_0, \theta_1)$的图形. 因为此时有两个变量，很容易想到$J(\theta_1)$应该是一个曲面, 如下图所示:
![](http://7xrrje.com1.z0.glb.clouddn.com/screenshot_16.png?imageMogr/v2/thumbnail/!45p)
这个图是教授用matlab绘制的，由于3D图形不太方便我们研究，我们就使用二维的等高线(上图右上角教授写的contour plots/figures)，这样看上去比较清楚一些。如下图右，越靠近中心表示$J(\theta_0,\theta_1)$的值越小(对应3D图中越靠近最低点的位置)。下图左表示当$\theta_0=800$, $\theta_1=0.15$的时候对应的$h_\theta(x)$，通过$\theta_0$, $\theta_1$的值可以找到下图右中$J(\theta_0,\theta_1)$的值。
![](http://7xrrje.com1.z0.glb.clouddn.com/screenshot_17.png?imageMogr/v2/thumbnail/!45p)
类似地：
![](http://7xrrje.com1.z0.glb.clouddn.com/screenshot_18.png?imageMogr/v2/thumbnail/!45p)
![](http://7xrrje.com1.z0.glb.clouddn.com/screenshot_19.png?imageMogr/v2/thumbnail/!45p)
![](http://7xrrje.com1.z0.glb.clouddn.com/screenshot_20.png?imageMogr/v2/thumbnail/!45p)
我们不断尝试直到找到一个最佳的$h_\theta(x)$。是否有特定的算法能帮助我们找到最佳的$h_\theta(x)$呢? 下面我们就要介绍这个算法-梯度下降算法.

## 三. 梯度下降算法
### 3.1 梯度下降
[梯度下降算法](https://zh.wikipedia.org/wiki/%E6%A2%AF%E5%BA%A6%E4%B8%8B%E9%99%8D%E6%B3%95)是一种优化算法, 它可以帮助我们找到一个函数的局部极小值点. 它不仅仅可以用在线性回归模型中, 在机器学习许多其他的模型中也可以使用它. 对于我们现在研究的单变量线性回归来说, 我们想要使用梯度下降来找到最优的$\theta_0, \theta_1$. 它的思想是, 首先随机选择两个$\theta_0, \theta_1$(例如, $\theta_0=0, \theta_1=0$), 不断地改变它们的值使得$J(\theta)$变小, 最终找到$J(\theta)$的最小值点. 
![](http://7xrrje.com1.z0.glb.clouddn.com/screenshot_21.png?imageMogr/v2/thumbnail/!45p)
可以把梯度下降的过程想象成下山坡, 如果想要尽可能快的下坡, 应该每次都往坡度最大的方向下山.
![](http://7xrrje.com1.z0.glb.clouddn.com/screenshot_22.png?imageMogr/v2/thumbnail/!45p)
梯度下降算法得到的结果会受到初始状态的影响, 即当从不同的点开始时, 可能到达不同的局部极小值, 如下图:
![](http://7xrrje.com1.z0.glb.clouddn.com/screenshot_23.png?imageMogr/v2/thumbnail/!45p)
下面具体看一下算法的过程, 如下图所示, 其中$:=$表示赋值，$\alpha$叫做学习率用来控制下降的幅度，$\frac{\partial}{\partial\theta_j}J(\theta_0, \theta_1)$叫做梯度。这里一定要注意的是，算法每次是同时(simultaneously)改变$\theta_0$和$\theta_1$的值，如图下图所示。
![](http://7xrrje.com1.z0.glb.clouddn.com/screenshot_24.png?imageMogr/v2/thumbnail/!45p)

### 3.2 梯度和学习率
我们先来看看梯度下降算法的梯度是如何帮助我们找到最优解的. 为了研究问题的方便我们还是同样地令$\theta_0$等于0，假设一开始选取的$\theta_1$在最低点的右侧，此时的梯度(斜率)是一个正数。根据上面的算法更新$\theta_1$的时候，它的值会减小, 即靠近最低点。
![](http://7xrrje.com1.z0.glb.clouddn.com/screenshot_26.png?imageMogr/v2/thumbnail/!45p)
类似地假设一开始选取的$\theta_1$在最低点的左侧，此时的梯度是一个负数，根据上面的算法更新$\theta_1$的时候，它的值会增大，也会靠近最低点. 
![](http://7xrrje.com1.z0.glb.clouddn.com/screenshot_27.png?imageMogr/v2/thumbnail/!45p)
如果一开始选取的$\theta_1$恰好在最适位置，那么更新$\theta_1$时，它的值不会发生变化。
![](http://7xrrje.com1.z0.glb.clouddn.com/screenshot_29.png?imageMogr/v2/thumbnail/!45p)
学习率$\alpha$会影响梯度下降的幅度。如果$\alpha$太小, $\theta$的值每次会变化的很小，那么梯度下降就会非常慢；相反地，如果$\alpha$过大，$\theta$的值每次会变化会很大，有可能直接越过最低点，可能导致永远没法到达最低点。
![](http://7xrrje.com1.z0.glb.clouddn.com/screenshot_28.png?imageMogr/v2/thumbnail/!45p)
由于随着越来越接近最低点, 相应的梯度(绝对值)也会逐渐减小，所以每次下降程度就会越来越小, 我们并不需要减小$\alpha$的值来减小下降程度。
![](http://7xrrje.com1.z0.glb.clouddn.com/screenshot_31.png?imageMogr/v2/thumbnail/!45p)

### 3.3 计算梯度
根据定义, 梯度也就是代价函数对每个$\theta$的偏导:
![](http://7xrrje.com1.z0.glb.clouddn.com/screenshot_585.png?imageMogr/v2/thumbnail/!45p)
我们将$h_\theta(x^{(i)})=\theta_0+\theta_1x^{(i)}$带入到$J(\theta_0,\theta_1)$中，并且分别对$\theta_0$和$\theta_1$求导得:
![](http://7xrrje.com1.z0.glb.clouddn.com/screenshot_32.png?imageMogr/v2/thumbnail/!45p)
由此得到了完整的梯度下降算法:
![](http://7xrrje.com1.z0.glb.clouddn.com/screenshot_33.png?imageMogr/v2/thumbnail/!45p)
还记得这个图吗, 前面说了梯度下降算法得到的结果会受初始状态的影响, 即初始状态不同, 结果可能是不同的局部最低点.
![](http://7xrrje.com1.z0.glb.clouddn.com/screenshot_23.png?imageMogr/v2/thumbnail/!45p)
事实上，用于线性回归的代价函数总是一个凸函数(Convex Function)。这样的函数没有局部最优解，只有一个全局最优解。所以我们在使用梯度下降的时候，总会得到一个全局最优解。
![](http://7xrrje.com1.z0.glb.clouddn.com/screenshot_16.png?imageMogr/v2/thumbnail/!45p)
下面我们来看一下梯度下降的运行过程：
![](http://7xrrje.com1.z0.glb.clouddn.com/screenshot_586.png?imageMogr/v2/thumbnail/!45p)
![](http://7xrrje.com1.z0.glb.clouddn.com/screenshot_587.png?imageMogr/v2/thumbnail/!45p)
![](http://7xrrje.com1.z0.glb.clouddn.com/screenshot_588.png?imageMogr/v2/thumbnail/!45p)
![](http://7xrrje.com1.z0.glb.clouddn.com/screenshot_589.png?imageMogr/v2/thumbnail/!45p)
![](http://7xrrje.com1.z0.glb.clouddn.com/screenshot_590.png?imageMogr/v2/thumbnail/!45p)
![](http://7xrrje.com1.z0.glb.clouddn.com/screenshot_592.png?imageMogr/v2/thumbnail/!45p)
迭代多次后，我们得到了最优解。现在我们可以用最优解对应的假设函数来对房价进行预测了。例如一个1,250平方英尺的房子大概能卖到250k$，如下图所示：
![](http://7xrrje.com1.z0.glb.clouddn.com/screenshot_593.png?imageMogr/v2/thumbnail/!45p)
