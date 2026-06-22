---
pubDatetime: 2016-11-29
modDatetime: 2016-11-29
title: "CS229机器学习笔记(八)-SVM之软间隔"
slug: "cs229-machine-learning-notes-lecture-8-1"
tags:
  - "Machine Learning"
  - "CS229"
description: "课程信息: 主页 Youtube 相关阅读:"
---
课程信息:  [主页](http://cs229.stanford.edu) [Youtube](https://www.youtube.com/playlist?list=PLA89DCFA6ADACE599)
相关阅读:
1. [支持向量机系列-pluskid](http://blog.pluskid.org/?page_id=683)(强烈推荐)
2. [支持向量机(四)-JerryLead](http://www.cnblogs.com/jerrylead/archive/2011/03/18/1988415.html)(强烈推荐)
4. [斯坦福CS229机器学习课程笔记五：支持向量机 Support Vector Machines](http://logos.name/archives/304)
5. [核技法、软间隔分类器、SMO算法——斯坦福ML公开课笔记8](http://blog.csdn.net/stdcoutzyx/article/details/9798843)
6. [机器学习笔记](https://github.com/zlotus/notes-LSJU-machine-learning)

- - - - -
接上篇: [CS229机器学习笔记(七)-SVM之Kernels](/posts/cs229-machine-learning-notes-lecture-8/)
## 软间隔分类器
软间隔分类器(soft margin classifier)可以解决两种情况. 
前面我们都假定数据是线性可分的, 但实际上数据即使映射到了高维也不一定是线性可分. 这个时候就要对超平面进行一个调整, 即这里所说的软间隔. 
另一种情况是即使数据是线性可分的,  但数据中可能存在噪点. 而如果按照前面那种常规处理的话, 这些噪点会对我们的结果造成很大的影响.这个时候也是需要使用软间隔来尽可能减少噪点对我们的影响.
如下图所示, 如果数据是线性可分并且不存在噪点的话, 我们可以找到一个完美的分类超平面:
但是, 如果数据中出现了一个噪点并且仍然是线性可分, 如果我们还是按照之前的办法处理, 那么我们就会得到如下的分类超平面, 这明显是不合理的. 
现在我们对原来的优化做一个处理:
我们在限制条件中添加了一个非负的$\xi$, 这样我们就允许某些点的函数间隔小于一甚至是在对方的区域. 当然, 我们不能只在限制条件中加上$\xi$, 还要在优化目标中对$\xi$进行惩罚, 使得所有$\xi$的和尽可能小. 
有了这个优化目标后, 我们按照之前学的拉格朗日对偶的知识来求解.
我们发现, $(\alpha)$和原来唯一的区别就在于多了一个$\alpha_i\le C$这个限制条件. (这里需要注意的是$b^\ast$的公式也有变化, 后面再说)KKT对偶互补条件为:
现在唯一的问题就是如何解决$W(\alpha)$了, 相关的内容放在下一篇进行介绍.
