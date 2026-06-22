---
pubDatetime: 2016-11-21
modDatetime: 2016-11-21
title: "CS229机器学习笔记(五)-SVM之函数间隔, 几何间隔"
slug: "cs229-machine-learning-notes-lecture-6"
tags:
  - "Machine Learning"
  - "CS229"
description: "课程信息: 主页 Youtube 参考资料: 《统计学习方法》 参考阅读:"
---
![](http://7xrrje.com1.z0.glb.clouddn.com/photo-1414115880398-afebc3d95efc.jpg)
课程信息:  [主页](http://cs229.stanford.edu) [Youtube](https://www.youtube.com/playlist?list=PLA89DCFA6ADACE599)
参考资料: [《统计学习方法》](https://book.douban.com/subject/10590856/)
参考阅读:
1. [支持向量机系列-pluskid](http://blog.pluskid.org/?page_id=683)
2. [支持向量机SVM（一）](http://www.cnblogs.com/jerrylead/archive/2011/03/13/1982639.html)
3. [斯坦福CS229机器学习课程笔记五：支持向量机 Support Vector Machines](http://logos.name/archives/304)
4. [NB多项式模型、神经网络、SVM初步—斯坦福ML公开课笔记6](http://blog.csdn.net/stdcoutzyx/article/details/9722701)
5. [机器学习笔记](https://github.com/zlotus/notes-LSJU-machine-learning)

- - - - -
## 一. 从Logistic Regression到SVM
## 1.1 想法
在logistic regression中, sigmoid函数图像如下: 
![](http://7xrrje.com1.z0.glb.clouddn.com/screenshot_690.png)
它的输出$h_\theta(x)$是$p(y=1|x)$. 在logistic中, 我们通过计算$\theta^Tx$来预测新的数据: 
$$
\begin{aligned}
\text{predict} \quad  "1" \quad \text{iff} \quad \theta^Tx\ge0, \\
\text{predict} \quad  "0"  \quad  \text{iff}  \quad  \theta^Tx<0.
\end{aligned}
$$
其中iff代表当且仅当. 若$\theta^Tx$越大, 则$h_\theta(x)=p(y=1|x;w,b)$越大, 即我们非常"确信"它的标签为"1". 所以: 
$$
\begin{aligned}
\text{If} \quad \theta^Tx\gg0,\quad \text{very "confident" that} \quad y=1, \\
\text{If} \quad \theta^Tx\ll0,\quad \text{very "confident" that} \quad y=0.
\end{aligned}
$$
如果在我们的训练集中, 对于所有的预测结果为"1"的样本都有$\theta^Tx\gg0$, 对于所有的预测结果为"0"的样本都有$\theta^Tx\ll0$, 那便是极好的. 用数学语言表达为: 
$$
\begin{aligned}
\text{if} \quad \forall i \quad \text{s.t.} \quad y^{(i)}=1, \text{have} \quad \theta^Tx\gg0, \\
\text{if}  \quad \forall i  \quad\text{s.t.}  \quad y^{(i)}=0, \text{have} \quad \theta^Tx\ll0,
\end{aligned}
$$
举个例子, 假设我们有下面这个分类器, 我们观察其中三个点A, B, C. 我们可以比较确定地认为A的标签为"X". 而对于C来说, 我们就不能非常确定它的标签是"X", 因为它离决策边界太近了. 这个决策边界只要有一点点变化就可能导致C分到不同的类中. 对于B的确信程度介于A和C之间.
![](http://7xrrje.com1.z0.glb.clouddn.com/screenshot_747.png)
即我们不仅仅要求分类器能正确的分类, 更进一步我们要求$\theta^Tx\ll0$或$\theta^Tx\gg0$. 即, 我们想要得到一种决策边界, 使得所有的样本都尽量远离这个边界. (下图截图自[林轩田-机器学习技法](https://youtu.be/8hak0XngnV0?t=2m56s)), 下面三个决策边界中, 你认为哪一个最好?
![](http://7xrrje.com1.z0.glb.clouddn.com/screenshot_746.png)
这个时候你也许会问, 这个离决策边界的距离到底指的是什么, 应该怎样表达他们. 这里就会引出"函数间隔"和"几何间隔"的概念. 
不过为了使后面一系列的推导的方便, 我们先稍微修改一下原先的(logistic regression中的)一些记号.
注: 在接下来的讲解中, 我们默认数据是线性可分的(后面我们会讨论线性不可分的情况). 
## 1.2 SVM中的符号说明
1.在logstic中我们用0,1代表两个类, 现在我们改用-1,+1, 即$y\in \{-1, +1\}$; 
2.在logistic中, 我们的$g$是sigmoid函数, 现在改为:
$$
g(z)=\begin{cases} 1, \quad z\ge0 \\\ -1, \quad \text{otherwise} \end{cases}
$$
3.在logistic中, 我们的假设函数为$h_\theta(x)$, 现在改为, $h_{w,b}(x)=g(w^Tx+b)$, 其中$w$相当于${\begin{bmatrix} \theta_1 \theta_2 ... \theta_n \end{bmatrix}}^T$, $b$相当于$\theta_0$.
符号弄清楚了之后, 我们可以研究SVM了. 首先, 我们要介绍一个概念: 函数间隔(functional margin).
## 二. 函数间隔和几何间隔
## 2.1 函数间隔
对于一个训练样本$(x^{(i)}, y^{(i)})$, 我们定义它到超平面$(w,b)$的函数间隔为: $\hat{\gamma}=y^{(i)}(w^Tx^{(i)}+b).$
我们希望函数间隔越大越好, 即:
$$
\begin{aligned}
\text{if} \quad y^{(i)}=1, \text{want} \quad w^Tx^{(i)}+b\gg0, \\
\text{if} \quad y^{(i)}=-1, \text{want} \quad w^Tx^{(i)}+b\ll0.
\end{aligned}
$$
并且有, 若$y^{(i)}(w^Tx^{(i)}+b)>0$, 则样本$(x^{(i)}, y^{(i)})$分类正确. 
<span id="normalization"></span>

函数间隔越大, 代表我们对于分类的结果非常确定. 我们希望函数间隔越大越好. 看上去好像没什么毛病, 但这里的确有一个问题, 就是其实我们可以在不改变这个超平面的情况下可以让函数间隔任意大, 为什么? 只要我们成比增加w,b就可以达到这个目的了. 例如, 我们将$w$变为$2w$, $b$变为$2b$, 那么我们的函数间隔将会是原来的两倍, 但是超平面$wTx+b=0$和超平面$2w^Tx+2b=0$是一回事. 为了解决这个问题, 我们就需要加上一些限制条件(后面会讲).
对于整个训练集, 我们的函数间隔定义为
$$
\hat{\gamma}=\min_i\hat{\gamma}^{(i)}.
$$
也就是说, 对于整个训练集来说, 函数间隔为所有样本中函数间隔最小的那个函数间隔.
## 2.2 几何间隔
如下图所示, 决策边界为$w^Tx+b=0$, 我们可以证明$w$是垂直于这个决策边界(超平面)的(证明可见: [林轩田-机器学习技法](https://youtu.be/lHo9GcIURRs?t=4m28s)).对于训练样本A$(x^{(i)},y^{(i)})$, 它到超平面$w^Tx+b=0$的几何距离为$\gamma^{(i)}$. 由于BA方向上的单位向量可表示为$\frac{w}{||w||}$. 则B(A在超平面上的投影)可表示为($\overrightarrow{OB}=\overrightarrow{OA} - \overrightarrow{BA}$):
$$
x^{(i)}-\gamma^{(i)}\cdot\frac{w}{\Vert w\Vert}.
$$
![](http://7xrrje.com1.z0.glb.clouddn.com/screenshot_748.png)
而B又在超平面上, 所以我们将这个点带回超平面得到:
$$
w^T(x^{(i)}-\gamma^{(i)}\cdot\frac{w}{\Vert w\Vert})+b=0.
$$
通过上式解出$\gamma$: 
$$
\begin{aligned}
w^Tx^{(i)}-\gamma^{(i)}\frac{w^Tw}{||w||}+b=0, \\
w^Tx^{(i)}+b=\gamma^{(i)}||w||, \\
\gamma^{(i)}=(\frac{w}{\Vert w\Vert})^Tx^{(i)}+\frac{b}{\Vert w\Vert}.
\end{aligned}
$$
加上前面的$y^{(i)}$于是我们就得到了几何间隔: 
$$
\gamma^{(i)}=y^{(i)}(\frac{w^T}{\Vert w\Vert}x^{(i)}+\frac{b}{\Vert w\Vert}).
$$
我们发现当$||w||=1$时, 几何间隔就是函数间隔.这个时候, 如果任意放大$||w||$, 几何间隔是不会改变的, 因为$||w||$也会随着被放大. 几何间隔与函数间隔的关系为: 
$$
\gamma^{(i)}=\frac{\hat{\gamma}^{(i)}}{\Vert w\Vert}.
$$
对于所有的训练样本, 我们的几何间隔为:
$$
\gamma=\min_i\gamma^{(i)}.
$$
视频到这里后面还有一点点的内容放到下篇一起讲.
