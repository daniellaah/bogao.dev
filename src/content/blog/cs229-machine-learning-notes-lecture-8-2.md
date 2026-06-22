---
pubDatetime: 2016-11-29
modDatetime: 2016-11-29
title: "CS229机器学习笔记(九)-SVM之SMO算法"
slug: "cs229-machine-learning-notes-lecture-8-2"
tags:
  - "Machine Learning"
  - "CS229"
description: "课程信息: 主页 Youtube 相关阅读:"
---
课程信息:  [主页](http://cs229.stanford.edu) [Youtube](https://www.youtube.com/playlist?list=PLA89DCFA6ADACE599)
相关阅读:
1. [支持向量机系列-pluskid](http://blog.pluskid.org/?page_id=683)(强烈推荐)
2. [支持向量机(四)-JerryLead](http://www.cnblogs.com/jerrylead/archive/2011/03/18/1988415.html)(强烈推荐)
3. [支持向量机(五)-JerryLead](http://www.cnblogs.com/jerrylead/archive/2011/03/18/1988419.html)(强烈推荐)
4. [斯坦福CS229机器学习课程笔记五：支持向量机 Support Vector Machines](http://logos.name/archives/304)
5. [核技法、软间隔分类器、SMO算法——斯坦福ML公开课笔记8](http://blog.csdn.net/stdcoutzyx/article/details/9798843)
6. [机器学习笔记](https://github.com/zlotus/notes-LSJU-machine-learning)

- - - - -
接上篇: [CS229机器学习笔记(七)-SVM之软间隔](/posts/cs229-machine-learning-notes-lecture-8-1/)

在将SMO之前, 我们先来看看什么是坐标上升法(coordinate ascent).
## 坐标上升
假设我们有如下的优化问题:
$$
\mathop{max}_\alpha W(\alpha_1, \alpha_2, ... , \alpha_m).
$$
先撇开SVM不谈, 这里的$W$是$\alpha_i$的一个函数. 我们前面已经看过了两种优化算法, 一种是梯度下降(gradient descent), 另一种是牛顿方法(Newton's method). 现在我们所要说的是第三种优化算法, 坐标上升法(coordinate ascent):
上面是该算法的过程, 在内循环中, 每次固定除了第i个$\alpha$, 即,将$W$看成只关于第$i$个$\alpha$的函数. 然后对第$i$个$\alpha$进行优化, 然后依次对下一个$\alpha$进行优化:
这里提一点, 优化$\alpha$的顺序是可以改变的, 取决于你觉得下一次优化哪一个$\alpha$会带来最大的进步. 
相对其他优化算法来讲, 坐标上升需要更多的迭代次数来收敛. 但它的优点就是在于内循环的计算非常简单.
## 序列最小优化算法
SVM终于接近尾声了...
前面有一个问题一直没有解决, 就是如何求解这个优化问题:
这一节的标题序列最小优化算法(Sequential minimal optimazation)就是用来解决这个优化问题的. 刚才讲的coordinate ascend现在自然要用到啦.
在刚才讲的coordinate ascend中, 我们每次固定除了某一个变量之外的所有变量, 将优化目标看成仅仅是这一个没有固定变量的函数, 再对该变量进行优化. 在SVM中, 好像也可以直接这么用. 但是别忘了, SVM的优化是有约束条件的:
$$
\sum_{i=1}^m\alpha_iy^{(i)}=0.
$$
有这个约束条件的存在, 我们就不可能改变其中一个而固定其他所有. 那该怎么办?
很简单, 在SVM中, 我们每次改变两个$\alpha$, 固定其他所有的. 这个算法就叫SMO(sequential minimal optimazation)算法, 其中minimal指的就是每次改变2个$\alpha$. 具体算法的过程如下:
1.选择两个变量$\alpha_i$和$\alpha_j$,
2.固定其他所有变量, 将$W(\alpha)$看成仅是关于$\alpha_i$和$\alpha_j$的函数对$W(\alpha)$进行优化
下面我们使用$\alpha_1$和$\alpha_2$做一个具体的例子来看看.
由$\sum_{i=1}^m\alpha_iy^{(i)}=0$, 我们可以得到:
$$
\alpha_1y^{(1)}+\alpha_2y^{(2)}=-\sum_{i=3}^m\alpha_iy^{(i)}.
$$
我们令:
$$
-\sum_{i=3}^m\alpha_iy^{(i)}=\zeta
$$
即:
$$
\alpha_1y^{(1)}+\alpha_2y^{(2)}=\zeta
$$
我们可以用下图画出$\alpha_1$和$\alpha_2$的约束(注意不要忘了$0\le\alpha_i\le C$):
由$\alpha_1y^{(1)}+\alpha_2y^{(2)}=\zeta$我们可以得到:
$$
\alpha_1 = \frac{\zeta-\alpha_2y^{(2)}}{y^{(1)}}.
$$
这个时候, $W$就可以写成: 
$$
W(\alpha)=W(\frac{\zeta-\alpha_2y^{(2)}}{y^{(1)}}, \alpha_2, ..., \alpha_m).
$$
前面也说了$W(\alpha)$是一个二次函数, 我们现在把$W$看成仅仅是关于$\alpha_2$的函数的话, $W$就变成了关于$\alpha_2$的一元二次函数, 这个时候求最值就很简单了.
