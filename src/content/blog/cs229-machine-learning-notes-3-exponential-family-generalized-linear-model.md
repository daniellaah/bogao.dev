---
pubDatetime: 2016-11-19
modDatetime: 2016-11-19
title: "CS229机器学习笔记(三)-指数分布族, 广义线性模型"
slug: "cs229-machine-learning-notes-3-exponential-family-generalized-linear-model"
tags:
  - "Machine Learning"
description: "这篇笔记先介绍指数分布族，再继续梳理广义线性模型和 Softmax Regression 的基本形式与推导。"
---
课程信息:  [主页](http://cs229.stanford.edu) [Youtube](https://www.youtube.com/playlist?list=PLA89DCFA6ADACE599)

- - - - -

## 一. 指数分布族
在讲广义线性模型之前，我们需要先介绍一下什么是指数分布族(exponential family). 一类分布如果属于指数分布族，那么它就可以写成如下形式: 
$$
p(y;\eta)=b(y)exp(\eta^TT(y)-a(\eta))
$$
其中$\eta$叫做natrual parameter, $T(y)$叫做sufficient statistic, $a(\eta)$叫做log partition function. 当我们选定T,a,b的时候，我们就得到了参数为$\eta$的分布族，不同的$\eta$会得到(属于这个分布族的)不同的分布。
现在证明Bernoulli分布和Gaussian分布都是属于指数分布族。
## 二. Bernoulli Distribution
先来看一下伯努利分布：
$$
\begin{align}
p(y;\phi) & = \phi^y(1-\phi)^{1-y} \\\
& = exp(log(\phi^y(1-\phi)^{1-y}) \\\
& = exp(log(\phi^y)+log((1-\phi)^{1-y})) \\\
& = exp(ylog(\phi) + (1-y)log(1-\phi)) \\\
& = exp(ylog(\frac{\phi}{1-\phi})+log(1-\phi)) \\\
\end{align}
$$
其中，
$$
\eta=log(\frac{\phi}{1-\phi}).
$$
<span id="bernoulli"></span>

可推出，
$$
\phi=\frac{1}{1+e^{-\eta}}
$$
这里$\phi$和sigmoid函数长得是有多像！(考虑一下上一篇中我们做出的假设)
将它与指数分布族的形式对应起来得：
$$
T(y)=y,

a(\eta)=-log(1-\phi)=log(1+e^\eta),

b(y)=1.
$$
## 三. Gaussian Distribution
再来看一下高斯分布。还记得之前我们通过概率的角度来解释最小二乘吗？当时我们有一个结论是，$\sigma^2$的值不影响我们最终的代价函数。所以这里为了计算的方便，我们令$\sigma^2=1$.
$$
\begin{align}
p(y;\mu) & = \frac{1}{\sqrt{2\pi}}exp(-\frac{(y-\mu^2)}{2}) \\\
& = \frac{1}{\sqrt{2\pi}}exp(-\frac12y^2+y\mu-\frac12\mu^2) \\\
& = \frac{1}{\sqrt{2\pi}}exp(-\frac12y^2)exp(y\mu-\frac12\mu^2) \\\
\end{align}
$$
<span id="gaussian"></span>

将结果与指数分布族的形式对应得到：
$$
\eta=\mu,

T(y)=y,

b(y)=\frac{1}{\sqrt{2\pi}}exp(-\frac12y^2),

a(\eta)=\frac12\mu^2=\frac12\eta^2.
$$
事实上，除了伯努利分布和高斯分布，有很多分布都是属于指数分布族. 具体可见[张雨石的博客](http://blog.csdn.net/stdcoutzyx/article/details/9207047)指数分布族部分. 
## 四. 广义线性模型
在构造广义线性模型之前，我们需要对给定x的y的条件概率做出以下三个假设: 
1.$y|x;\theta\sim$指数分布族$(\eta)$. 给定$x$和$\theta$, y的分布服从参数为$\eta$的指数分布族中的某个分布, 
2.给定$x$, 我们的目标是预测$T(y)$的期望，即$E[T(y)|x]$,
3.$\eta$和$x$成线性关系, 即$\eta=\theta^Tx$.
下面我们看看如何通过这三个假设推导出最小二乘模型和logistic模型.
## 五. 最小二乘模型
推导过程如下:
$$
\begin{align}
h_\theta(x) & = E[y|x;\theta] \\\
& = \mu \\\
& = \eta \\\
& = \theta^Tx. 
\end{align}
$$
解释: 
1.第一个等号因为假设2,
2.第二个等号因为$y|x;\theta\sim N(\mu,\sigma^2)$，它的期望就是$\mu$,
3.第三个等号因为[上面](#gaussian)推导的高斯分布的指数分布族的形式,
4.第四个等号因为假设3.
## 六. Logistic模型
推导过程如下:
$$
\begin{align}
h_\theta(x) & = E[y|x;\theta] \\\
& = \phi \\\
& = \frac1{1+e^{-\eta}}\\\
& = \frac1{1+e^{-\theta^Tx}}. 
\end{align}
$$
解释: 
1.第一个等号因为假设2,
2.第二个等号因为$y|x;\theta\sim Bernoulli(\phi)$，它的期望就是$\phi$,
3.第三个等号因为[上面](#bernoulli)推导的伯努利分布的指数分布族的形式,
4.第四个等号因为假设3.
## 七. Softmax Regression
多项式分布也属于指数分布族，由他推导出的广义线性模型可以解决多分类的问题，它是logistic模型的一个扩展。
设$y\in \{1,2,...,k\}$, 参数为:$\phi_1,\phi_2,...,\phi_k$, $P(y=i)=\phi_i$.这样写的话，其实我们的参数是冗余的，因为所有概率的和应该等于1. 所以有$\phi_k = 1 - (\phi_1+\phi_2+...+\phi_{k-1})$.
为了使多项式分布能写成指数分布族的形式，我们定义$T(y)\in R^{k-1}$: 
这里我们再引入indicator function:
$$
1(True)=1,

1(False)=0
$$
由此可得到：
$$
(T(y))_i=1\{ y=i\}
$$
下面我们就可以证明多项式分布是属于指数分布族，以下是推导过程：
其中：
由:
可做如下推导：
即:
$$
\phi_k=\frac{1}{\sum_{i=1}^{k}e^{\eta_i}}
$$
将上式再带回到(7)中可得:
这个函数就叫做softmax函数. 
下面我们看如何推导出softmax regression:
首先我们有:
根据广义线性模型的三个假设，我们就得到了$h_\theta(x)$:
log likelihood如下:

参考:
1. [机器学习笔记-子实](https://github.com/zlotus/notes-LSJU-machine-learning)
2. [牛顿方法、指数分布族、广义线性模型—斯坦福ML公开课笔记4](http://blog.csdn.net/stdcoutzyx/article/details/9207047)
2. [斯坦福CS229机器学习课程笔记二：GLM广义线性模型与Logistic回归](http://logos.name/archives/187)
3. [斯坦福CS229机器学习课程笔记三：感知机、Softmax回归](http://logos.name/archives/236)
