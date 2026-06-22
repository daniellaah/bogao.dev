---
pubDatetime: 2016-11-23
modDatetime: 2016-11-23
title: "CS229机器学习笔记(六)-SVM之拉格朗日对偶, 最优间隔分类器"
slug: "cs229-machine-learning-notes-lecture-7"
tags:
  - "Machine Learning"
  - "CS229"
description: "课程信息: 主页 Youtube 参考资料: 《统计学习方法》 参考阅读:"
---
课程信息:  [主页](http://cs229.stanford.edu) [Youtube](https://www.youtube.com/playlist?list=PLA89DCFA6ADACE599)
参考资料: [《统计学习方法》](https://book.douban.com/subject/10590856/)
参考阅读:
1. [支持向量机系列-pluskid](http://blog.pluskid.org/?page_id=683)(强烈推荐)
2. [支持向量机SVM（一）](http://www.cnblogs.com/jerrylead/archive/2011/03/13/1982639.html)(强烈推荐)
3. [支持向量机SVM（二）](http://www.cnblogs.com/jerrylead/archive/2011/03/13/1982684.html)(强烈推荐)
4. [斯坦福CS229机器学习课程笔记五：支持向量机 Support Vector Machines](http://logos.name/archives/304)
5. [最优间隔分类、原始/对偶问题、SVM对偶—斯坦福ML公开课笔记7](http://blog.csdn.net/stdcoutzyx/article/details/9774135)
6. [机器学习笔记](https://github.com/zlotus/notes-LSJU-machine-learning)

- - - - -
接上篇: [CS229机器学习笔记(五)-SVM之函数间隔, 几何间隔](/posts/cs229-machine-learning-notes-lecture-6/)
支持向量机学习的基本想法是求解能够正确划分训练数据集并且几何间隔最大的分离超平面. 对线性可分的训练数据集而言, 线性可分分离超平面有无穷多个(等价于感知机), 但是几何间隔最大的分离超平面是唯一的. 这里的间隔最大化又称为硬间隔最大化(与将要讨论的训练数据集近似线性可分时的软间隔最大化相对应)
## 一. 间隔最大化
通过上一篇的讲解, 我们知道我们想要找到一个超平面, 使得离超平面最近的点的几何间隔越大越好.该如何找到这样的超平面呢? 这个问题可用如下的优化问题表示：
$$
\begin{align}
\max_{w,b} &\quad \gamma \\\
s.t. &\quad y_{i}(\frac{w}{\Vert w\Vert}\cdot x_i+ \frac{b}{\Vert w\Vert})\ge\gamma, \quad i=1,2,...,N \\\
\end{align}
$$
即我们希望最大化超平面$(w,b)$关于训练数据集的几何间隔$\gamma$, 约束条件表示的是超平面$(w,b)$关于每个训练样本点的几何间隔至少是$\gamma$
考虑几何间隔和函数间隔的关系式, 可将这个问题改写为
$$
\begin{align}
\max_{w,b} &\quad \frac{\hat{\gamma}}{\Vert w\Vert} \\\
s.t. &\quad y_{i}({w}\cdot x_i+ {b})\ge\\hat{\gamma}, \quad i=1,2,...,N \\\
\end{align}
$$
函数间隔$\hat{\gamma}$的取值并不影响最优化问题的解. 事实上, 假设将$w$和$b$按比例改变为$\lambda w$ 和 $\lambda b$, 这时函数间隔成为$\lambda\hat{\gamma}$. 函数间隔的这一改变对上面最优化问题的不等式约束没有影响, 对目标函数的优化也没有影响, 也就是说, 它产生一个等价的最优化问题. 这样, 就可以取$\gamma=1$. 将$\gamma=1$代入上面的最优化问题, 注意到最大化$\frac{1}{\Vert w\Vert}$和最小化$\frac{1}{2}\Vert w\Vert^2$是等价的, 于是就得到下面的线性可分支持向量机学习的最优化问题
$$
\begin{align}
\min_{w,b} &\quad {\frac12}||w||^2  \\\
s.t. &\quad y_{i}(w\cdot x_{i}+b)-1\ge =0
\end{align}
$$
这个时候我们的问题就转化成了在线性约束下的二次规划. 可以使用二次规划的软件来解决这个优化问题, 然后我们就可以得到我们的最优间隔分类器. 
实际上, 我们有更好的办法去解这个优化问题. 但在这之前, 我们需要补充一下其他的相关知识.
## 二. 拉格朗日对偶
在约束最优化问题中, 常常利用拉格朗日对偶性(Lagrange duality)将原始问题转换为对偶问题, 通过解对偶问题而得到原始问题的解. 该方法应用在许多统计学习方法中, 例如, 最大熵模型与支持向量机. 
### 2.1 原始问题
$$
\begin{align}
\min_{w} & \quad f(w) \\\
{s.t.} &\quad h_i(w)=0, \quad i=1,\cdots,l
\end{align}
$$
我们使用拉格朗日乘子法, 将问题转化为: 
$$
\mathcal{L}(w,\beta)=f(w)+\sum_{i=1}^l\beta_ih_i(w)
$$
其中, $\beta_i$为拉格朗日乘子(Lagrange Multipliers). 然后令偏导为0来解得$w,\beta$.
$$
\begin{align}
\frac{\partial\mathcal{L}}{\partial w_i} & = 0 \\\ 
\frac{\partial\mathcal{L}}{\partial \beta_i} & = 0
\end{align}
$$
这个问题的更加广泛的形式为(既存在等式约束又存在不等式约束): 
$$
\begin{align}
\min_{w}&\quad f(w) \\\ 
\mathrm{s.t.} & \quad g_i(w)\leq 0,\quad i=1,\cdots ,k \\\
& \quad h_i(w)=0,\quad i=1,\cdots,l
\end{align}
$$
我们定义广义拉格朗日公式(generalized Lagrangian)为: 
$$
\mathcal{L}(w,\alpha,\beta)=f(w)+\sum_{i=1}^k\alpha_ig_i(w)+\sum_{i=1}^l\beta_ih_i(w).
$$
其中, $\alpha_i, \beta_i$为拉格朗日乘子. 现在我们定义:
$$
\theta_{\mathcal{P}}(w)=\operatorname*\max_{\alpha,\beta:\alpha_i\geq 0}\mathcal{L}(w,\alpha,\beta)
$$
其中下标$\mathcal{P}$代表"primal". 若约束条件得不到满足的时候($g_i(w)>0$或$h_i(w)\ne0$), 则可令$\alpha_i$为无穷大或$\beta_i$为无穷大使得$\theta_{\mathcal{P}}(w)=\infty$. 而当约束条件满足时, $\theta_{\mathcal{P}}(w)=f(w)$. 所以有:
$$
\theta_{\mathcal{P}}=\begin{cases}
f(w) & w \text{ is feasible} \\\
\infty & \text{otherwise}
\end{cases}
$$
即对于满足原始约束的w来说, $\theta_{\mathcal{p}}$与原始问题中的目标函数相同. 对于违反原始约束的w来说, $\theta_{\mathcal{p}}=\infty$. 因此, 如果考虑最小化：
$$
\min_{w}\theta_{\mathcal{P}}(w)=\min_{w}\max_{\alpha,\beta:\alpha_i\geq 0}\mathcal{L}(w,\alpha,\beta)
$$
它是与原始最优化问题等价的, 即它们有相同的解. 问题$\min_{w}\max_{\alpha,\beta:\alpha_i\geq 0}\mathcal{L}(w,\alpha,\beta)=\min_w\theta_{\mathcal{p}}(w)$称为广义拉格朗日函数的极小极大问题. 这样一来我们就把原始最优化问题表示为广义拉格朗日函数的极小极大问题. 为了后面使用方便, 我们定义原始问题的最优值
$$
p^\ast=\min_w\theta_{\mathcal{p}}(w)
$$
称为原始问题的值.
### 2.2 对偶问题
现在, 我们看一下另外一个问题: 
$$
\theta_{\mathcal{D}}(\alpha,\beta)=\min_{w}\mathcal{L}(w,\alpha,\beta)
$$
其中下标$\mathcal{D}$代表对偶("Dual"). 在原始问题中, 我们是先最大化关于$\alpha, \beta$的函数, 再最小化关于$w$的函数; 而这里的对偶问题, 我们先最小化关于$w$的函数, 再最大化关于$\alpha, \beta$的函数:
$$
\max_{\alpha,\beta:\alpha_i\ge0}\theta_{\mathcal{D}}(\alpha,\beta)=\max_{\alpha,\beta:\alpha_i\ge0}\min_{w}\mathcal{L}(w,\alpha,\beta)
$$
它们唯一的区别就在于min和max的顺序不同. 我们令$d^{\ast}=\max_{\alpha,\beta:\alpha_i\ge0}\min_{w}\mathcal{L}(w,\alpha,\beta)$, 并且对于任意函数都有$minmax\le maxmin$, 所以我们可以得到:
$$
d^{\ast}=\max_{\alpha,\beta:\alpha_i\ge0}\min_{w}\mathcal{L}(w,\alpha,\beta)\le\min_{w}\max_{\alpha,\beta:\alpha_i\geq 0}\mathcal{L}(w,\alpha,\beta)=p^{\ast}
$$
也就是说, 在某种情况下,会有$d^\ast=p^\ast$, 这个时候我们就可把求原始问题转化成求对偶问题.假设$f$和$g_i$是凸函数, $h$是仿射的. 并且存在$w$是的对于所有的$i$能够使$g_i(w)<0$.
在上述假设条件下, 一定存在$w^{\ast}, {\alpha}^{\ast}, {\beta}^{\ast}$, 使得$w^{\ast}$是原始问题的解, $ {\alpha}^{\ast}, {\beta}^{\ast}$是对偶问题的解.并且还有$p^{\ast}=d^{\ast}=\mathcal{L}(w^{\ast}, {\alpha}^{\ast}, {\beta}^{\ast})$. 
$w^{\ast}, {\alpha}^{\ast}, {\beta}^{\ast}$满足KKT条件(Karush-Kuhn-Tucker conditions):
如果存在满足KKT条件的$w^{\ast}, {\alpha}^{\ast}, {\beta}^{\ast}$, 则原始问题与对偶问题一定有解. (5)式又称为KKT对偶互补条件(KKT dual complementarity condition), 这个条件表明如果$\alpha^\ast>0$, 那么就有$g_i(w^\ast)=0$. 即约束条件$g_i(w^\ast)≤0$“激活”, w处于可行域的边界上. 而其他位于可行域内部$g_i(w^\ast)<0$的点都不起约束作用, 对应的$\alpha^\ast=0$.
## 三. 最优间隔分类器
有了上面的知识之后, 我们再回到SVM的问题:
$$
\min_{\gamma, w,b}{\frac12}||w||^2\quad s.t. \quad y^{(i)}(w^Tx^{(i)}+b)\ge1.
$$
这看上去好像就是上一节讲的拉格朗日对偶问题, 只不过这里没有等式约束只有不等式约束. 我们将不等式约束改成我们熟悉的样子: 
$$
g_i(w)=-y^{(i)}(w^Tx^{(i)}+b)+1\le0.
$$
从上一节讨论的KKT条件可知, 只有当训练样本的函数间隔为1时($g_i(w)=0$), 它前面的系数$\alpha_i>0$. 对于其他的训练样本, 前面的系数$\alpha_i=0$.
考虑下图, 最大间隔分类超平面为实线:
其中一个正样本和两个负样本正好在平行于分类超平面的虚线上, 只有这三个样本对应的$\alpha_i<0$, 其它样本对应的$\alpha_i=0$. 这三个样本就叫做支持向量(这也就是支持向量机名字的由来).从这里我们可以看出, 支持向量的个数远远小于训练集的大小. 
我们构造拉格朗日函数: 
$$
\mathcal{L}(w, b, \alpha)=\frac12||w||^2-\sum_{i=1}^m\alpha_i[y^{(i)}(w^Tx^{(i)}+b)-1].
$$
下面的任务就是求解对偶问题了. 根据上一节的知识, 我们有:
$$
d^\ast=\mathop\max_{\alpha:\alpha_i\ge0}\theta_\mathcal{D}(\alpha)=\mathop\max_{\alpha:\alpha_i\ge0}\mathop\min_{w,b}\mathcal{L}(w,b,\alpha).
$$
首先, 求$\mathcal{L}(w,b,\alpha)$关于$w,b$的最小值. 令偏导为0:
$$
\begin{aligned}
\frac{\partial\mathcal{L}}{\partial w}=w-\sum_{i=1}^m\alpha_iy^{(i)}x^{(i)}=0, \\
\frac{\partial\mathcal{L}}{\partial b}=0-\sum_{i=1}^m\alpha_iy^{(i)}=0.
\end{aligned}
$$
可得:
$$
\begin{aligned}
w=\sum_{i=1}^m\alpha_iy^{(i)}x^{(i)}, \\
\sum_{i=1}^m\alpha_iy^{(i)}=0.
\end{aligned}
$$
再将求得的$w$带回$\mathcal{L}(w,b,\alpha)$可得到$\mathop\min_{w,b}\mathcal{L}(w,b,\alpha)$:

$$
\begin{align}
& \mathop\min_{w,b}\mathcal{L}(w,b,\alpha)  \\\ 
& =\frac12(\sum_i^m\alpha_iy_ix_i)(\sum_j^m\alpha_jy_jx_j) - (\sum_i^m\alpha_iy_ix_i)(\sum_j^m\alpha_jy_jx_j)+(\sum_i^m\alpha_iy_ib) + \sum_i^m\alpha_i \\\
& = -\frac12(\sum_i^m\alpha_iy_ix_i)(\sum_j^m\alpha_jy_jx_j) + b\sum_i^m\alpha_iy_i + \sum_i^m\alpha_i \\\
& = \sum_i^m\alpha_i  - \frac12\sum_i^m\sum_j^m\alpha_i\alpha_jy_iy_jx_i^Tx_j \\\
& = \sum_i^m\alpha_i  - \frac12\sum_i^m\sum_j^m\alpha_i\alpha_jy_iy_j\langle x_i,x_j\rangle
\end{align}
$$
有了$\mathop\min_{w,b}\mathcal{L}(w,b,\alpha)$, 我们便可进行max操作, 即:
可以证明该优化问题满足KKT条件(证明可见[张雨石的博客](http://blog.csdn.net/stdcoutzyx/article/details/9774135)).求得$\alpha_i^\ast$之后(如何求解后面再讲), 可通过$w=\sum_{i=1}^m\alpha_iy^{(i)}x^{(i)}$求得$w^\ast$, 最后通过下式求得$b^\ast$:
当我们求出了所有的参数, 我们就可以通过计算$w^Tx+b$来进行分类了:
$$
\begin{align} w^Tx+b & = {\left(\sum_i^m\alpha_iy_ix_i\right)}^Tx+b \\\ & = \sum_i^m\alpha_iy_i\langle x_i,x \rangle +b\end{align}.
$$
通过上式我们发现, 现在新来一个数据, 我们只需要计算它与训练样本的内积即可. 并且通过前面的KKT条件我们知道, 只有除了支持向量的那些样本, 都有$\alpha_i=0$. 所以, 我们只需要将新样本与支持向量进行内积即可计算出$w^Tx+b$. 
>在决定分离超平面时只有支持向量起作用, 而其他实例点并不起作用. 如果移动支持向量将改变所求的解；但是如果在间隔边界以外移动其他实例点, 甚至去掉这些点, 则解是不会改变的. 由于支持向量在确定分离超平面中起着决定性作用, 所以将这种分类模型称为支持向量机. 支持向量的个数一般很少, 所以支持向量机由很少的“重要的”训练样本确定.
