---
pubDatetime: 2016-11-18
modDatetime: 2016-11-18
title: "CS229机器学习笔记(二) - Logistic回归, 牛顿方法"
slug: "cs229-machine-learning-notes-2-logistic-regression-newtons-method"
tags:
  - "Machine Learning"
description: "对数几率回归英文叫logistic regression，虽然它叫regression但它是用来解决分类问题的。有很多地方翻译成逻辑回归或者逻辑斯蒂回归。在周志华老师的《机器学习》中翻译成对数几率回归，这里我也使用这种翻译。对数几率回..."
---
![](http://7xrrje.com1.z0.glb.clouddn.com/creative-designer-photographer-workspace-picjumbo-com.jpg)
课程信息:  [主页](http://cs229.stanford.edu) [Youtube](https://www.youtube.com/playlist?list=PLA89DCFA6ADACE599)

- - - - -

## 一. 对数几率回归
对数几率回归英文叫logistic regression，虽然它叫regression但它是用来解决分类问题的。有很多地方翻译成逻辑回归或者逻辑斯蒂回归。在周志华老师的[《机器学习》](https://book.douban.com/subject/26708119/)中翻译成对数几率回归，这里我也使用这种翻译。对数几率回归的假设函数为：
![](http://7xrrje.com1.z0.glb.clouddn.com/screenshot_688.png)
其中：
<img src="http://7xrrje.com1.z0.glb.clouddn.com/screenshot_689.png" id="sigmoid">
叫做logistic函数或者sigmoid函数。它的函数图像如下：
![](http://7xrrje.com1.z0.glb.clouddn.com/screenshot_690.png)
那么对于对数几率回归我们应该使用什么样的策略来得到$\theta$(我们的代价函数应该是怎样的)?还是按照之前线性回归的思路，我们求出$\theta$的最大似然估计.在这之前我们先推导一下sigmoid函数的导数(后面要用到).
![](http://7xrrje.com1.z0.glb.clouddn.com/screenshot_691.png)
首先，我们做如下假设：
![](http://7xrrje.com1.z0.glb.clouddn.com/screenshot_693.png)
上面两个式子可以用下面一个式子表达：
![](http://7xrrje.com1.z0.glb.clouddn.com/screenshot_694.png)
假设所有的样本都是独立的，所以有：
![](http://7xrrje.com1.z0.glb.clouddn.com/screenshot_695.png)
这样我们就得到了似然函数，max似然函数等价于，先取个log，再max。
![](http://7xrrje.com1.z0.glb.clouddn.com/screenshot_696.png)
同样地，先不管求和符号，对log likelihood求导(这里就需要用到前面的sigmoid函数的求导)：
![](http://7xrrje.com1.z0.glb.clouddn.com/screenshot_697.png)
我们的更新规则是：
![](http://7xrrje.com1.z0.glb.clouddn.com/screenshot_699.png)
带入之后我们就得到了stocasitic gradient ascent(注意，这里是梯度上升，因为我们在求最大值)
![](http://7xrrje.com1.z0.glb.clouddn.com/screenshot_700.png)
这个式子是不是很熟悉？没错，这个和前面讲的最小二乘的规则看上去一模一样，唯一不同的是这里的$h_\theta(x{(i)})$不一样。其实这并不是巧合，下一篇我们就会讲到GLM广义线性模型。
## 二. 感知器学习算法
还记得什么是sigmoid函数吗？它长这样[Sigmoid Function](#sigmoid). 现在我们做如下改变：
![](http://7xrrje.com1.z0.glb.clouddn.com/screenshot_701.png)
让它的输出只能是0或1.更新规则还是如下：
![](http://7xrrje.com1.z0.glb.clouddn.com/screenshot_702.png)
这样我们就得到了感知器学习算法。现在先了解一下即可，后面讲到人工神经网络的时候，我们会详细地介绍。
## 三. 牛顿方法
回到刚才的logistic regression, 我们在$\max_{\theta}l(\theta)$的时候用的是梯度下降. 其实还有另一种方法求$\max_{\theta}l(\theta)$. 那就是Newton's Method. 它的思想是这样的, 我们需要求一个函数等于0时候的x的值:
![](http://7xrrje.com1.z0.glb.clouddn.com/screenshot_705.png)
首先随机选一个点，求出在改点切线，然后令切线等于0，得到新的x。
![](http://7xrrje.com1.z0.glb.clouddn.com/screenshot_705_1.png)
然后在重复前面的步骤进行迭代。
![](http://7xrrje.com1.z0.glb.clouddn.com/screenshot_706.png)
即更新规则为：
![](http://7xrrje.com1.z0.glb.clouddn.com/screenshot_707.png)
在对数几率回归中，我们是求似然函数的最大值，即导数为0的点。所以，我们把这里的$f(x)$替换为$l'(\theta)$，即得到了牛顿法更新规则：
![](http://7xrrje.com1.z0.glb.clouddn.com/screenshot_708.png)
若$\theta$为向量，则规则变为：
![](http://7xrrje.com1.z0.glb.clouddn.com/screenshot_709.png)
其中，H叫做Hessian矩阵：
![](http://7xrrje.com1.z0.glb.clouddn.com/screenshot_710.png)
牛顿方法通常要比BGD收敛的要快，但是牛顿方法每迭代一次需要消耗更多的计算资源，因为他需要计算Hessian矩阵的逆。所以当n不是很大时，总的来说还是牛顿方法要快一点。
关于牛顿法的更新规则，lecture slides里问了一个问题：
![](http://7xrrje.com1.z0.glb.clouddn.com/screenshot_711.png)
如果要求最小值的话，导函数应该是如下所示，此时应该是向右移动，不过此时的斜率是负的，所以更新规则并不需要改变。
![](http://7xrrje.com1.z0.glb.clouddn.com/newton'smethod2.jpg)

参考:
1. [机器学习笔记-子实](https://github.com/zlotus/notes-LSJU-machine-learning)
2. [牛顿方法、指数分布族、广义线性模型—斯坦福ML公开课笔记4](http://blog.csdn.net/stdcoutzyx/article/details/9207047)
2. [局部加权回归、逻辑斯蒂回归、感知器算法—斯坦福ML公开课笔记3](http://blog.csdn.net/stdcoutzyx/article/details/9113681)
3. [斯坦福CS229机器学习课程笔记二：GLM广义线性模型与Logistic回归](http://logos.name/archives/187)
