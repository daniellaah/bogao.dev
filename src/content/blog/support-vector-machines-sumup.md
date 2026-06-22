---
pubDatetime: 2017-03-20
modDatetime: 2017-03-20
title: "支持向量机总结(上)"
slug: "support-vector-machines-sumup"
tags:
  - "Machine Learning"
description: "支持向量机是一种二类分类模型. 它的基本模型是定义在特征空间上的间隔最大的线性分类器. 间隔最大使它有别与感知机, 核技巧使它成为实质上的非线性分类器. 统计学习方法有三要素, 对于支持向量机来说, 学习策略就是间隔最大化, 而优化方..."
---
![](http://7xrrje.com1.z0.glb.clouddn.com/lo_llbs1rs0-jan-senderek.jpg?imageMogr2/thumbnail/!50p)

支持向量机是一种二类分类模型. 它的基本模型是定义在特征空间上的间隔最大的线性分类器. 间隔最大使它有别与感知机, 核技巧使它成为实质上的非线性分类器. 统计学习方法有三要素, 对于支持向量机来说, 学习策略就是间隔最大化, 而优化方法就是求解凸二次规划的最优算法.  
支持向量机学习方法包含构建由简至繁的模型: 线性可分支持向量机, 线性支持向量机, 非线性支持向量机.

|数据|策略|结果|
|:-:|:-:|:-:|
|线性可分|硬间隔最大化|线性可分支持向量机/硬间隔支持向量机|
|近似线性可分|软间隔最大化|线性支持向量机/软间隔支持向量机|
|线性不可分|软间隔最大化|非线性支持向量机|
核函数表示将输入从输入空间映射到特征空间得到的特征向量之间的内积. 通过核函数, 可以从输入空间学习非线性支持向量机, 其等价于在特征空间中学习线性支持向量机. 这样的方法称为核技巧.

- - - - -

## 一. 线性可分支持向量机与硬间隔最大化
如下图所示的线性可分分类问题, 在感知机的策略是误分类最小化来求得分离超平面, 通过这个策略可以得到无穷多个解. 例如下图三个解都有可能是感知机得到的结果, 直观上看上去前两个得到的分类超平面都离样本点比较近, 第三个分类超平面离正负样本都比较远. 我们会觉得第三个分类超平面是比较好的, 因为离超平面越远就认为他被分类正确的确信程度越高. 那么有没有办法可以直接找到像第三个分类超平面那样的分类器? 当然有, 这就是线性可分支持向量机.
在支持向量机的世界里, 这个距离叫做间隔, 而对于线性可分问题, 间隔又叫做硬间隔. 不同于感知机, 支持向量机的策略就是要使这个硬间隔最大化, 通过这种策略学习到的分类超平面是唯一的. ((截图来自[林轩田-机器学习技法-Youtube](https://youtu.be/8hak0XngnV0?t=2m56s)))
![](http://7xrrje.com1.z0.glb.clouddn.com/screenshot_746.png)
上面我们提到过, 一个点距离分离超平面的远近可以表示分类预测的确信程度. 在超平面$w\cdot x + b=0$确定的情况, $|w\cdot x + b|$能够相对地表示$x$距离超平面的远近. 而$w\cdot x+b$的符号与类标记$y$的符号是否一致能够表示分类是否正确. 
所以可用向量$y(w\cdot x+b)$来表示分类的正确性及确信度, 这就是函数间隔. 但是对$w,b$成比例地改变可以对函数间隔进行任意的缩放(并不影响超平面本身), 所以需要几何间隔$\gamma_i=y_i\left(\frac{w}{\Vert w\Vert}\cdot x+ \frac{b}{\Vert w\Vert}\right)$. 对于一个数据集的函数间隔和几何间隔分别定义为所有样本对超平面的函数间隔和几何间隔的最小值. 几何间隔与函数间隔的关系为: 
$$
\gamma_{i}=\frac{\hat{\gamma}_{i}}{\Vert w\Vert}.
$$
间隔最大化的直观解释是: 对训练数据集找到几何间隔最大的超平面意味着以充分大的确信度对训练数据进行分类, 也就是说, 不仅将正负实例点分开, 而且对最难分的实例点(离超平面最近的点)也有足够大的确信度将它们分开. 这样的超平面应该对未知的新实例有很好的分类预测能力.
下面就开始推导如何用约束优化问题来表示如何求一个几何间隔最大分离超平面. 
首先, 我们想要几何间隔最大:
$$
\begin{align}
\max_{w,b} &\quad \gamma \\\
s.t. &\quad y_{i}(\frac{w}{\Vert w\Vert}\cdot x_i+ \frac{b}{\Vert w\Vert})\ge\gamma, \quad i=1,2,...,N \\\
\end{align}
$$
利用几何间隔和函数间隔的关系, 我们可以将上式改写为:
$$
\begin{align}
\max_{w,b} &\quad \frac{\hat{\gamma}}{\Vert w\Vert} \\\
s.t. &\quad y_{i}({w}\cdot x_i+ {b})\ge\\hat{\gamma}, \quad i=1,2,...,N \\\
\end{align}
$$
前面我们也提到了, 可以在不改变分类超平面本身的情况下对函数间隔进行缩放,  那么这里可以直接令$\hat{\gamma}=1$, 并且最大化$\frac{1}{\Vert w\Vert}$和最小化$\frac12\Vert w\Vert^2$是等价的. 如此, 我们得到了最终的优化问题:
$$
\begin{align}
\min_{w,b} &\quad {\frac12}||w||^2  \\\
s.t. &\quad y_{i}(w\cdot x_{i}+b)-1\ge =0
\end{align}
$$
为了求解上述最优化问题, 我们将它作为原始最优化问题, 应用拉格朗日对偶性, 通过求解对偶问题得到原始问题的最优解. 这样做有两个优点, 一是对偶问题往往更容易求解; 二是自然引入核函数, 进而推广到非线性分类问题.
首先建立拉格朗日函数. 对每一个不等式约束引进拉格朗日乘子$\alpha_i\ge 0, i=1,2,...,N$, 约束为:
$$
-y_{i}(w^Tx_{i}+b)+1\le0.
$$
得到拉格朗日函数:
$$
\mathcal{L}(w,b,\alpha)=\frac12\Vert w \Vert^2 - \sum_{i=1}^N\alpha_i\left[y_{i}(w\cdot x_{i}+b)-1\right]
$$
根据拉格朗日对偶性, 原始问题的对偶问题是极大极小问题:
$$
\max_{\alpha}\min_{w,b}\mathcal{L}(w,b,\alpha)
$$
所以, 为了得到对偶问题的解, 需要先求$\mathcal{L}(w,b,\alpha)$对$w,b$的极小, 再求对$\alpha$的极大.
首先, 求$\mathcal{L}(w,b,\alpha)$关于$w,b$的最小值. 令偏导为0:
$$
\begin{aligned}
\frac{\partial\mathcal{L}}{\partial w}=w-\sum_{i=1}^n\alpha_iy_{i}x_{i}=0, \\
\frac{\partial\mathcal{L}}{\partial b}=0-\sum_{i=1}^n\alpha_iy_{i}=0.
\end{aligned}
$$
可得:
$$
\begin{aligned}
w=\sum_{i=1}^n\alpha_iy_{i}x_{i}, \\
\sum_{i=1}^m\alpha_iy_{i}=0.
\end{aligned}
$$
再将求得的$w$带回$\mathcal{L}(w,b,\alpha)$可得到$\mathop\min_{w,b}\mathcal{L}(w,b,\alpha)$:
$$
\begin{align}
& \mathop\min_{w,b}\mathcal{L}(w,b,\alpha)  \\\ 
& =\frac12(\sum_i^n\alpha_iy_ix_i)(\sum_j^n\alpha_jy_jx_j) - (\sum_i^n\alpha_iy_ix_i)(\sum_j^n\alpha_jy_jx_j)+(\sum_i^n\alpha_iy_ib) + \sum_i^n\alpha_i \\\
& = -\frac12(\sum_i^n\alpha_iy_ix_i)(\sum_j^n\alpha_jy_jx_j) + b\sum_i^n\alpha_iy_i + \sum_i^n\alpha_i \\\
& = \sum_i^n\alpha_i  - \frac12\sum_i^n\sum_j^n\alpha_i\alpha_jy_iy_jx_i^Tx_j \\\
& = \sum_i^n\alpha_i  - \frac12\sum_i^n\sum_j^n\alpha_i\alpha_jy_iy_j\langle x_i,x_j\rangle
\end{align}
$$
有了$\mathop\min_{w,b}\mathcal{L}(w,b,\alpha)$, 我们便可进行极大操作, 即:
$$
\begin{align}
\max_{\alpha} & \quad W(\alpha)=\sum_i^n\alpha_i  - \frac12\sum_i^n\sum_j^n\alpha_i\alpha_jy_iy_j\langle x_i,x_j\rangle \\\
\text{s.t.} & \quad \alpha_i\ge 0, i=1,...,n \\\
& \quad \sum_{i=1}^n\alpha_iy_i=0
\end{align}
$$
这就是我们最终的优化目标, 这样线性可分支持向量机就只剩下如何求解这个最优化问题了.
## 二. 线性支持向量机与软间隔最大化
