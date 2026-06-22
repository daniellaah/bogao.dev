---
pubDatetime: 2016-11-28
modDatetime: 2016-11-28
title: "CS229机器学习笔记(七)-SVM之Kernels"
slug: "cs229-machine-learning-notes-lecture-8"
tags:
  - "Machine Learning"
  - "CS229"
description: "课程信息: 主页 Youtube 相关阅读:"
---
![](http://7xrrje.com1.z0.glb.clouddn.com/wazehlrp98s-jamison-mcandie.jpg)
课程信息:  [主页](http://cs229.stanford.edu) [Youtube](https://www.youtube.com/playlist?list=PLA89DCFA6ADACE599)
相关阅读:
1. [支持向量机系列-pluskid](http://blog.pluskid.org/?page_id=683)(强烈推荐)
2. [支持向量机(三)核函数-JerryLead](http://www.cnblogs.com/jerrylead/archive/2011/03/18/1988406.html)(强烈推荐)
4. [斯坦福CS229机器学习课程笔记五：支持向量机 Support Vector Machines](http://logos.name/archives/304)
5. [核技法、软间隔分类器、SMO算法——斯坦福ML公开课笔记8](http://blog.csdn.net/stdcoutzyx/article/details/9798843)
6. [机器学习笔记](https://github.com/zlotus/notes-LSJU-machine-learning)

- - - - -
接上篇: [CS229机器学习笔记(六)-SVM之拉格朗日对偶, 最优间隔分类器](/posts/cs229-machine-learning-notes-lecture-7/)

## Kernels
在我们讨论线性回归的时候, 提到过[polynomial regression](/posts/machine-learning-andrew-ng-my-notes-week-2-linear-regression-with-multiple-variables/). 假设$x$是房子的面积, 我们使用三个特征$x, x^2, x^3$来构造一个三次多项式. 这里有两个概念要区分一下. 这里房子的面积$x$叫做属性(attribute), 我们通过这个$x$映射得到的$x, x^2, x^3$叫做特征(feature). 我们使用$\phi$来表示这种从属性到特征的特征映射(feature mapping). 例如, 在这个例子中:
$$
\phi(x) = \begin{bmatrix}  x \\\ x^2 \\\ x^3 \end{bmatrix}
$$
那么在SVM中, 我们该如何使用这种特征映射呢? 很简单, 通过上一讲的知识, 我们应该知道只需要将所有出现$\langle x^{(i)}, x^{(j)}\rangle$替换为$\langle\phi(x^{(i)}), \phi(x^{(j)})\rangle$就可以了. 
![](http://7xrrje.com1.z0.glb.clouddn.com/screenshot_897.png)
看上去好像我们既在SVM中使用了特征映射, 又解决了数据在低维空间中线性不可分的情况. 但是, 这里有个问题. 如果我们通过特征映射得到的$\phi(x)$是一个很高维甚至是无穷维的, 那么计算$\langle\phi(x^{(i)}), \phi(x^{(j)})\rangle$就不是那么现实了. 这里我们就要引出一个叫kernels的概念.
假设$x, z\in \mathbb{R}^n$, $K(x,z)=(x^Tz)^2.$, 展开$K(x,z)$:
![](http://7xrrje.com1.z0.glb.clouddn.com/screenshot_755.png)
展开后我们发现, $K(x,z)$还可以写成$K(x,z)=\phi(x)^T\phi(z)$, 其中:
![](http://7xrrje.com1.z0.glb.clouddn.com/screenshot_756.png)
在这个例子中, 映射后特征的内积和原始特征的内积的平方是等价的. 也就是说, 我们只需要计算原始特征的内积再进行平方就可以了, 并不需要先得到映射后的特征再计算映射后特征的内积. 计算原始特征内积的时间复杂度为$\mathcal{O}(n)$, 而计算映射特征$\phi(x)$的时间复杂度为$\mathcal{O}(x^2)$.
我们再来看另一个kernels:
$$
\begin{align}
K(x,z) & =(x^Tz+c)^2 \\\
& = \sum_{i,j=1}^n(x_ix_j)(z_iz_j) + \sum_{i=1}^n(\sqrt{2c}x_i)(\sqrt{2c}x_j)+c^2.
\end{align}
$$
对应的映射函数$(n=3)$为:
![](http://7xrrje.com1.z0.glb.clouddn.com/screenshot_757.png)
更广泛的来说, 我们有:
$$
K(x,z)=(x^Tz+c)^d
$$
这个kernel将n维的特征映射为${ {n+d} \choose d }$维. 
以上是举几个kernel的例子, 如果我们有一个新的问题我们该如何构造一个kernel? 假设我们有映射后的特征向量$\phi(x)$和$\phi(z)$, kernel就是用来计算它们两之间的内积. 如果$\phi(x)$和$\phi(z)$相似的话, 即这两个向量的夹角很小, 那么这个内积就会很大; 相反地, 如果它们差别很大, 那么这个内积就会很小. 
所以, 我们可以这样想kernels, 当$x$和$z$相似时, $K(x,z)$很大. 反之, 当$x$和$z$不同时, $K(x,z)$很小. 
我们再来看一个kernel:
$$
K(x,z)=exp\left(-\frac{||x-z||^2}{2\sigma^2}\right).
$$
思考一下, 这个kernel应该挺符合上面的想法吧. 这个kernel长得像高斯分布, 我们一般叫他高斯kernel, 也可以叫Radial basis funtction kernel, 简称RBF核.
## kernels的有效性
上一节提到了一些核函数, 这里我们提一个问题, 我们该如何确定这个核函数是有效的, 也即:是否存在$\phi$, 使得$K(x,z)=\langle\phi(x)\phi(z)\rangle$?
假设我们有核K和m个训练样本$\{ x^{(1)},x^{(2)}, ...,x^{(m)}\}$, 定义一个$m\times m$的矩阵$K$, $K_{ij}=K(x^{(i)}, x^{(j)})$. 
如果$K$是一个有效的kernel, 那么一定有:
$$
K_{ij}=K(x^{(i)}, x^{(j)})=\phi(x^{(i)})^T\phi(x^{(j)})=\phi(x^{(j)})^T\phi(x^{(i)})=K(x^{(j)}, x^{(i)})=K_{ji}
$$
即$K$是对称阵.现我们用$\phi_k(x)$表示向量$\phi(x)$的第k个元素, 对任意的向量$z$都有:
![](http://7xrrje.com1.z0.glb.clouddn.com/screenshot_758.png)
从上面的证明我们可以得到, 如果$K$是一个有效的kernel, 那么对于在训练集上的核矩阵$K$一定是半正定的. 事实上, 这不仅仅是个必要条件, 它也是充分条件. 有效核也叫作Mercer Kernel. 
> Mercer 定理: 
> 
函数$K$是$\mathbb{R}^n\times\mathbb{R}^n\to\mathbb{R}$上的映射. 如果$K$是一个有效的(Mercer)Kernel, 那么当且仅当对于任意$\{ x^{(1)},...,x^{(m)}\}, (m<\infty)$, 相应的kernel matrix是半正定的.
