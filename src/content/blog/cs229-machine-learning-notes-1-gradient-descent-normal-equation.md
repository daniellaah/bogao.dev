---
pubDatetime: 2016-11-17
modDatetime: 2016-11-17
title: "CS229机器学习笔记(一) - 梯度下降, 正规方程, 局部加权"
slug: "cs229-machine-learning-notes-1-gradient-descent-normal-equation"
tags:
  - "Machine Learning"
description: "先下载了第一个Lecture Notes，对应第一个到第四个视频.由于已经有前面Coursera上Machine Learning的基础，所以在这里会省略一部分内容"
---
![](http://7xrrje.com1.z0.glb.clouddn.com/luxury-silver-pen-with-a-business-diary-picjumbo-com.jpg)
课程信息:  [主页](http://cs229.stanford.edu) [Youtube](https://www.youtube.com/playlist?list=PLA89DCFA6ADACE599)

- - - - -
先下载了第一个[Lecture Notes](http://cs229.stanford.edu/notes/cs229-notes1.pdf)，对应第一个到第四个视频.由于已经有前面Coursera上Machine Learning的基础，所以在这里会省略一部分内容.
## 一. LMS 算法
在线性回归中，我们的代价函数为$J(\theta)=1/2\sum_{i=1}^m(h_\theta(x^{(i)})-y^{(i)})^2$，然后使用梯度下降算法来找到$\theta$，$\theta_j:=\theta_j-\alpha\frac{\partial}{\partial\theta_j}J(\theta)$.现在我们就要解出等式右边的偏导项.首先假设我们只有一个训练样本，这样我们就可以忽略求和符号。
$$
\begin{align}
\frac{\partial}{\partial\theta_j}J(\theta) & = \frac{\partial}{\partial\theta_j}\frac12(h_\theta(x)-y)^2 \\\
& = (h_\theta(x)-y)\frac{\partial}{\partial\theta_j}(h_\theta(x)-y) \\\
& = (h_\theta(x)-y)\frac{\partial}{\partial\theta_j}(\sum_{i=0}^{n}\theta_ix_i-y) \\\
& = (h_\theta(x)-y)x_j
\end{align}
$$
这样我们就得到了$\theta$的更新规则：
![](http://7xrrje.com1.z0.glb.clouddn.com/screenshot_665.png)
这个规则就叫做LMS(Least Mean Squares)update Rule，也叫Widrow-Hoff learning rule. 
上面是假设我们只有一个样本时的情况，当我们有很多样本时，我们可以对上述规则进行两种修改.第一种叫做BGD(Batch Gradient Descent)，第二种叫做SGD(Stochastic Gradient Descent).
## 二. Batch Gradient Descent
BGD每"走一步"都会考虑到所有的样本：
![](http://7xrrje.com1.z0.glb.clouddn.com/screenshot_666.png)
需要注意的是，通常来说梯度下降可能会得到一个局部最优解，但是对于我们现在考虑的线性回归来说，BGD总是会收敛到全局最优解(因为代价函数是一个凸函数)，当然了，前提是学习率$\alpha$不能太大。
## 三. Stochastic Gradient Descent
在SGD(SGD也叫作incremental gradient descent)中，我们每次只考虑一个训练样本：
![](http://7xrrje.com1.z0.glb.clouddn.com/screenshot_667.png)
在BGD中，因为我们每次需要考虑所有的样本，所以当数据量很大时，我们每走一步都要进行大量的运算，而SGD不会。所以，在实践中，如果训练集很大，我们会优先选择SGD。
## 四. 正规方程
在梯度下降中，我们是不断迭代更新来得到最优解。我们有另一种方法可以一次性求出最优解。
首先介绍一些符号，我们用$X$来表示训练样本：
![](http://7xrrje.com1.z0.glb.clouddn.com/screenshot_668.png)
用$\vec{y}$表示目标值：
![](http://7xrrje.com1.z0.glb.clouddn.com/screenshot_669.png)
用向量表示的代价函数如下：
![](http://7xrrje.com1.z0.glb.clouddn.com/screenshot_713.png)
正规方程的推导如下：
![](http://7xrrje.com1.z0.glb.clouddn.com/screenshot_672.png)
然后得到：
![](http://7xrrje.com1.z0.glb.clouddn.com/screenshot_673.png)
这里我跳过了很多步骤，因为lecture notes里面写的很详细，还有矩阵的求导以及一些性质等等。或者也可以学习一下[这篇博客](http://blog.csdn.net/stdcoutzyx/article/details/9101621)。
这里想强调一下，Andrew在上课的时候说了，光看没用，你看着别人推导每一步你都觉得很合理，自己一定要盖住答案推导一遍，包括一些直接给的性质最好能自己证明一下。所以，既然选择学这门课，所有的内容一定要自己推导一遍！自己推导一遍！自己推导一遍！
好了，下面给出矩阵的一些性质以及部分性质的证明来解决上面正规方程中的一些疑惑(在Coursera课程中，正规方程的结果是直接给出的)
性质1:   $trAB = trBA$
证明(写Mathjax公式太费时间了，所以索性直接手写一遍扫描上来。如果有写错的或者写得不清楚的地方，欢迎在下面留言)：
![](http://7xrrje.com1.z0.glb.clouddn.com/matrix_trace_1-1.jpg)
由性质1可以得到:
![](http://7xrrje.com1.z0.glb.clouddn.com/screenshot_674.png)
性质2:   $trA = trA^T$
性质3:   $tr(A+B) = tr(B+A)$
性质4:   $tr(aA) = a(trA)$
性质2-4都很容易能看出。下面给出一些有关矩阵求导的一些性质：
性质5:   $\nabla_A trAB = B^T$
性质6:   $\nabla_{A^T} f(A) = (\nabla_Af(A))^T$
性质7:   $\nabla_A trABA^TC = CAB + C^TAB^T$
性质8:   $\nabla_A |A| = |A|(A^{-1})^T$
下面给出性质5的证明：
在性质1的证明中，我们得到：
![](http://7xrrje.com1.z0.glb.clouddn.com/screenshot_676.png)
所以，![](http://7xrrje.com1.z0.glb.clouddn.com/matrix_trace_derivative_4.jpg)
性质6比较容易看出，下面是性质7的证明，其中主要用到的就是性质2和乘法求导法则：
![](http://7xrrje.com1.z0.glb.clouddn.com/matrix_trace_7.jpg)
上面的性质搞定之后，是时候自己推导一波正规方程了：
![](http://7xrrje.com1.z0.glb.clouddn.com/normal_equation.jpg)
拓展阅读: [掰开揉碎推导Normal Equation](https://zhuanlan.zhihu.com/p/22757336), 强烈推荐！
## 五. 最小二乘法的概率解释
前面我们已经知道了，我们的代价函数为：
$$
J(\theta) = \frac12(h_\theta(x)-y)^2
$$
为什么要这样定义代价函数，有没有什么依据呢？这一节我们就从概率的角度来解释这个问题.
假设目标变量遵循以下等式：
![](http://7xrrje.com1.z0.glb.clouddn.com/screenshot_678.png)
其中$\epsilon^{(i)}$是一个误差项，并且独立同分布(IID, idependently and identically distributed)于均值为0方差为$\sigma$的高斯分布，即，$\epsilon^{(i)}\sim\mathcal{N}(0, \sigma^2)$:
![](http://7xrrje.com1.z0.glb.clouddn.com/screenshot_679.png)
于是，
![](http://7xrrje.com1.z0.glb.clouddn.com/screenshot_680.png)
上式代表了参数为$\theta$，在给定$x^{(i)}$的条件下，$y^{(i)}$的概率分布.用向量的形式表示为$p(\vec{y}|X;\theta)$.当我们把上式看成是$\theta$的函数时，它就成了似然函数：
![](http://7xrrje.com1.z0.glb.clouddn.com/screenshot_681.png)
之前我们假设误差项是独立的，所以有：
![](http://7xrrje.com1.z0.glb.clouddn.com/screenshot_682.png)
现在我们有了关于$y^{(i)}$，$x^{(i)}$的概率模型，那么我们该如何选择参数$\theta$?根据极大似然估计，我们应该选择让似然函数最大的那个$\theta$，即$max L(\theta)$. 等价于$max l(\theta)$.
![](http://7xrrje.com1.z0.glb.clouddn.com/screenshot_683.png)
也就是min下面这一项：
![](http://7xrrje.com1.z0.glb.clouddn.com/screenshot_684.png)
这样，我们就得到了之前的代价函数。也就是说，在我们的假设下，最小方差回归就是要找到$\theta$的最大似然估计.这里需要注意一下，我们最终选择$\theta$不受$\sigma$的影响.
## 六. 局部加权线性回归
如下图，最左边我们使用的是$y=\theta_0+\theta_1x$去拟合数据得到的结合。类似的第二个是使用$y=\theta_0+\theta_1x+\theta_2x^2$，最右边使用$y=\sum_{j=0}^5\theta_jx^j$拟合数据。看上去像是增加越多的特征，拟合的越好。但这其中就有欠拟合和过拟合的问题。所以特征的选择对于学习算法来说非常重要.
![](http://7xrrje.com1.z0.glb.clouddn.com/screenshot_718.png)
这一节主要简要的讨论一下LWR(Locally weighted linear regression)，它可以让特征的选择不是那么重要(前提是有足够大的训练集).
前面讲的现行回归是一种参数方法，计算出$\theta$之后，只要将新的数据带入即可进行预测。而局部加权线性回归(Locally weighted linear regression)，是一种非参数的方法。在每次预测一个值的时候，都需要重新计算代价函数，它的代价函数为：
![](http://7xrrje.com1.z0.glb.clouddn.com/screenshot_686.png)
其中，$w^{(i)}$为权重，要预测的点为$x^{i}$，离该点距离越远的数据的权重越小，反之越大：
![](http://7xrrje.com1.z0.glb.clouddn.com/screenshot_687.png)
$\tau$叫做bandwidth，它控制着数据的权重下降的速度，$\tau$越小权重下降的速度越快。

参考:
1. [机器学习笔记-子实](https://github.com/zlotus/notes-LSJU-machine-learning)
2. [线性规划、梯度下降、正规方程组——斯坦福ML公开课笔记1-2](http://blog.csdn.net/stdcoutzyx/article/details/9101621)
2. [局部加权回归、逻辑斯蒂回归、感知器算法—斯坦福ML公开课笔记3](http://blog.csdn.net/stdcoutzyx/article/details/9113681)
3. [斯坦福CS229机器学习课程笔记一：线性回归与梯度下降算法](http://logos.name/archives/148)
