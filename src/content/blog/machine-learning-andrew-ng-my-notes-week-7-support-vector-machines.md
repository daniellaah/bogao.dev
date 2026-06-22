---
pubDatetime: 2016-05-26
modDatetime: 2016-05-26
title: "Coursera机器学习笔记(十二) - SVM"
slug: "machine-learning-andrew-ng-my-notes-week-7-support-vector-machines"
tags:
  - "Machine Learning"
  - "Notes"
  - "Coursera"
  - "MOOC"
  - "SVM"
description: "这篇笔记从 logistic regression 过渡到 SVM，整理了目标函数、间隔直觉和核函数的基本概念。"
---
![](http://7xrrje.com1.z0.glb.clouddn.com/screenshot_217.png)

- 课程地址：[Support Vector Machines](https://www.coursera.org/learn/machine-learning/home/week/7)
- 课程Wiki：[Support Vector Machines](https://share.coursera.org/wiki/index.php/ML:Support_Vector_Machines_(SVMs))
- 课件：[PPT](https://d396qusza40orc.cloudfront.net/ml/docs/slides/Lecture12.pptx) [PDF](https://d396qusza40orc.cloudfront.net/ml/docs/slides/Lecture12.pdf)

- - - - -

## 一. 支持向量机
### 1.1 代价函数
我们先来回顾一下logistic regression, 如下图所示. 
![](http://7xrrje.com1.z0.glb.clouddn.com/screenshot_218.png)
在logistic regression中, $Cost\left(h_\theta(x),y\right)=-ylog(h_\theta(x))-(1-y)log(1-h_\theta(x))$, 我们将$h_\theta(x)=\frac{1}{1+e^{-\theta^Tx}}$代入得如下图所示的式子, 当$y=1$的时候, 式子的后半部分为0；当$y=0$的时候, 式子的前半部分为0. 
当$y=1$的时候, 我们可以将式子的前半部分看成关于z的函数, 并将它描绘出来, 如下图左下细线所示. 如果我们将这个图形稍改变一下变成蓝色线的样子, 这个就是SVM的cost term. 
当$y=0$的时候, 类似, 如图右下所示. 我们把左边的叫做$Cost_1(z)$, 右边的叫做$Cost_0(z)$
![](http://7xrrje.com1.z0.glb.clouddn.com/screenshot_219.png)
下面我们看一下, SVM中的cost function是什么样的. 如下图所示, 我们将logistic regression中的两个部分用$Cost_1(z)$和$Cost_1(z)$替换, 并且去掉$1 \over m$常数项. 
![](http://7xrrje.com1.z0.glb.clouddn.com/screenshot_222.png)
最后再去掉$\lambda$并加上常数项$C$, 这样我们就得到了SVM的cost function：$\mathop{min}\limits_{\theta} C\sum_{i=1}^m \begin{bmatrix} y^{(i)}cost_1(\theta^Tx^{(i)})+(1-y^{(i)})cost_0(\theta^Tx^{(i)})\end{bmatrix} + \frac{1}{2}\sum_{i=1}^n\theta_j^2$  
![](http://7xrrje.com1.z0.glb.clouddn.com/screenshot_223.png)
### 1.2 最大间隔
在SVM中, 当y＝1的时候, 我们希望$\theta^Tx\ge1$而不是$\theta^Tx\ge0$；当y＝0的时候, 我们希望$\theta^Tx\le-1$而不是$\theta^Tx<0$. 
![](http://7xrrje.com1.z0.glb.clouddn.com/screenshot_224.png)
现在假设C是一个非常大的数例如$100,000$, 我们看看SVM会有什么结果. 在C非常大的情况下, 我们想要最小化代价函数, 那么就得有第一项为0. 而想要第一项为0, 我们需要保证当y＝1的时候$\theta^Tx\ge1$或者当y＝0的时候$\theta^Tx\le-1$. 在此约束下, 我们的优化问题就变成了
$$
\mathop{min}\limits_{\theta}\frac{1}{2}\sum_{i=1}^n\theta_j^2 \quad s.t.
\begin{cases}
\theta^Tx\ge1 \quad \text{if} \quad y^{(i)}=1\\\
\theta^Tx\le-1 \quad \text{if} \quad y^{(i)}=0
\end{cases}
$$
![](http://7xrrje.com1.z0.glb.clouddn.com/screenshot_225.png)
在解决上述优化问题时(暂时先不考虑如何解决的), 我们会发现, SVM会选择一个具有最大间隔的decision boundary如下图中的黑线所示, 而不是绿线或者粉线. 
![](http://7xrrje.com1.z0.glb.clouddn.com/screenshot_228.png)
当C非常大的时候, SVM容易收到异常点的影响. 如下图所示, 对于该数据集, SVM会得到黑色线所示的decision boundary. 
![](http://7xrrje.com1.z0.glb.clouddn.com/screenshot_230.png)  
但是当出现异常点的时候, decision boundary会变成下图所示的粉色线. 但是如果C不是非常大的话, 在有异常点的情况下我们还是会得到大概黑色线所示的decision boundary. 
![](http://7xrrje.com1.z0.glb.clouddn.com/screenshot_229.png)  
如果数据集不是线性可分的, 如下图所示, SVM也可以恰当的将它们分开. 
![](http://7xrrje.com1.z0.glb.clouddn.com/screenshot_231.png) 
### 1.3 数学意义
这节主要讲为什么当C非常大时SVM会有最大margin的decision boundary的数学证明. 具体内容见视频. 
![](http://7xrrje.com1.z0.glb.clouddn.com/screenshot_232.png) 
![](http://7xrrje.com1.z0.glb.clouddn.com/screenshot_233.png) 
![](http://7xrrje.com1.z0.glb.clouddn.com/screenshot_235.png) 
## 二. 核函数
假设我们有一个如下图所示训练集, 我们希望拟合一个非线性的决策边界. 我们可以构造如下的一个多项式, 然后我们使用$f$来代替多项式中的特征变量, 如下图蓝色字所示. 这时候的问题是, 我们不知道这些特征变量是否是适合的特征变量. 那么有没有更好的选择呢？
![](http://7xrrje.com1.z0.glb.clouddn.com/screenshot_236.png)
这里有构造$f_1$, $f_2$, $f_3$的方法. 如下图所示, 我们现人工地选择三个不同的点, 用$l^{(1)}$, $l^{(2)}$, $l^{(3)}$来表示. 给定x, 我们如下图所示定义$f_1$, $f_2$, $f_3$. 
![](http://7xrrje.com1.z0.glb.clouddn.com/screenshot_237.png)
我们以$l_1$为例, 如下图所示, 当$x$离$l_1$很近很近的时候$f_1\approx1$；当$x$离$l_1$较远的时候$f_1\approx0$. 
![](http://7xrrje.com1.z0.glb.clouddn.com/screenshot_247.png)
我们把$f_1$看成是关于$x$的函数, 这样描绘出$f_1$的图形如下图所示. 当$\sigma$的值发生变化时, $f_1$的图形有规律的变化. 
![](http://7xrrje.com1.z0.glb.clouddn.com/screenshot_239.png)
假设我们现在已经训练出$\theta_0=-0.5$, $\theta_1=1$, $\theta_2=1$, $\theta_3=0$. 当x在$l^{(1)}$附近时, 计算可知应该预测$y=1$, 如下图所示. 
![](http://7xrrje.com1.z0.glb.clouddn.com/screenshot_248.png)
当x离的都比较远的时候（如下图所示）, 计算可知应该预测$y=0$. 当x在$l^{(2)}$附近时, 计算可知应该预测$y=1$. 
![](http://7xrrje.com1.z0.glb.clouddn.com/screenshot_249.png)
当x在$l^{(1)}$或$l^{(2)}$附近时, 都应该预测$y=1$. 决策边界如下图所示：
![](http://7xrrje.com1.z0.glb.clouddn.com/screenshot_250.png)
那么应该如何选取$l$？
![](http://7xrrje.com1.z0.glb.clouddn.com/screenshot_241.png)
假设给定m个训练样例, 我们直接将这些点作为$l^{(1)}$, $l^{(2)}$, ... , $l^{(m)}$. 
给定一个训练样例$x^{(i)}$, 我们需要计算出所有的$f_1^{(i)}$, $f_2^{(i)}$, ... , $f_m^{(i)}$. 
![](http://7xrrje.com1.z0.glb.clouddn.com/screenshot_242.png)
最后我们通过如下训练来得到最优的$\theta$. 
![](http://7xrrje.com1.z0.glb.clouddn.com/screenshot_243.png)
关于$C$和$\sigma$的值对于bias和variance的影响如下图所示. 
![](http://7xrrje.com1.z0.glb.clouddn.com/screenshot_244.png)
## 三. 使用SVM
当我们使用SVM软件包的时候我们需要选择合适的参数. 
![](http://7xrrje.com1.z0.glb.clouddn.com/screenshot_251.png)  
需要注意的是, 在使用Gaussian核函数之前需要进行feature scaling. 
![](http://7xrrje.com1.z0.glb.clouddn.com/screenshot_253.png)  
其他的核函数. 
![](http://7xrrje.com1.z0.glb.clouddn.com/screenshot_254.png)  
多种分类的情况. 
![](http://7xrrje.com1.z0.glb.clouddn.com/screenshot_255.png)  
logistic regression和SVM适用情况对比.
![](http://7xrrje.com1.z0.glb.clouddn.com/screenshot_257.png)
