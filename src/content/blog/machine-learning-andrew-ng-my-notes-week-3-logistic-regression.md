---
pubDatetime: 2016-04-26
modDatetime: 2016-04-26
title: "Coursera机器学习笔记(五) - Logistic Regression"
slug: "machine-learning-andrew-ng-my-notes-week-3-logistic-regression"
tags:
  - "Machine Learning"
  - "Notes"
  - "Coursera"
  - "MOOC"
  - "Logistic Regression"
description: "前面的课程中提到了一些分类问题: 对于乳腺癌的那个例子, 数据集如下所示. 如果使用线性回归来处理这个问题, 我们可能得到这样一个假设函数: 然后我们设定一个阈值0.5, 当假设函数的输出大于这个阈值时我们预测y=1；当假设函数的..."
---
![](http://7xrrje.com1.z0.glb.clouddn.com/screenshot_67.png)

- 课程地址：[Logistic Regression](https://www.coursera.org/learn/machine-learning/home/week/3)
- 课程Wiki：[Logistic Regression](https://share.coursera.org/wiki/index.php/ML:Logistic_Regression)
- 课件：[PPT](https://d396qusza40orc.cloudfront.net/ml/docs/slides/Lecture6.pptx) [PDF](https://d396qusza40orc.cloudfront.net/ml/docs/slides/Lecture6.pdf)

- - - - -
## 一. 模型展示
### 1.1 从线性回归解到对数几率回归
前面的课程中提到了一些分类问题:
![](http://7xrrje.com1.z0.glb.clouddn.com/screenshot_68.png)
对于乳腺癌的那个例子, 数据集如下所示. 如果使用线性回归来处理这个问题, 我们可能得到这样一个假设函数: 
![](http://7xrrje.com1.z0.glb.clouddn.com/screenshot_615.png)
然后我们设定一个阈值0.5, 当假设函数的输出大于这个阈值时我们预测$y=1$；当假设函数的输出小于0.5时, 我们预测$y=0$. 
![](http://7xrrje.com1.z0.glb.clouddn.com/screenshot_69.png)
即使我们的问题是一个分类问题, 但是对于上面这个特定的例子, 看上去使用线性回归好像还是挺合理的. 但是如果我们再增加一个数据(下图最右), 使用Linear Regression就会得到如图蓝色线所示的$h_\theta(x)$. 
![](http://7xrrje.com1.z0.glb.clouddn.com/screenshot_616.png)
这个结果显然是不合理的, 它有很多错误的分类. 直观上来看, 要是能得到图中垂直于横轴的(图中蓝色)线那边是极好的. 
![](http://7xrrje.com1.z0.glb.clouddn.com/screenshot_70.png)
而且即使所有的训练样例的 y = 0或1, 使用线性回归得到的$h_\theta(x)$也有可能大于1或者小于0. 
![](http://7xrrje.com1.z0.glb.clouddn.com/screenshot_617.png)
所以我们需要一个能更好地处理分类问题的模型, 即对数几率回归(Logistic Regression/Logit regression). (有些地方翻译成'逻辑回归'或者'逻辑斯蒂格回归') 需要注意的是这个模型虽然叫regression, 但是它是一个用来解决分类问题的模型. 在对率回归(对数几率回归的简称)中, $0\le h_\theta(x)\le1$. 
![](http://7xrrje.com1.z0.glb.clouddn.com/screenshot_618.png)
### 1.2 假设函数
在对率回归中, 假设函数为$h_\theta(x)=g(\theta^Tx)$, 其中$g(z)=\frac{1}{1+e^{-z}}$, $g(z)$叫做Sigmoid Function或者对率函数(Logistic Function). 
对数几率函数是Sigmoid函数的一种, 它将z值转化为一个接近0或1的y值, 并且其输出值在$z=0$附近变化很陡. Sigmoid函数即形似S的函数, 对率函数是Sigmoid函数最重要的代表. 
$$
{h_\theta(x)=\frac{1}{1+e^{-\theta^Tx}}}
$$
![](http://7xrrje.com1.z0.glb.clouddn.com/screenshot_72.png)
我们可以将对率函数的输出理解为当输入为x的时候, y=1的概率. 可以用$h_\theta(x)=P(y=1|x;\theta)$表达. 例如, 在下图中, 我们给定一个x, 它的假设函数的输出为0.7, 我们可以说这个病人的肿瘤为恶性的概率是70%. 
![](http://7xrrje.com1.z0.glb.clouddn.com/screenshot_73.png)
### 1.3 决策边界
如图所示的Sigmoid函数, 我们可以看到, 当$z>0$的时候$g(z)\ge0.5$即预测$y=1$；当$z<0$的时候$g(z)<0.5$即预测$y=0$. 
![](http://7xrrje.com1.z0.glb.clouddn.com/screenshot_619.png)
而在对率回归中, 我们的$z=\theta^Tx$, 所以我们有：当$\theta^Tx\ge0$时, 预测$y=1$；当$\theta^Tx<0$时, 预测$y=0$. 如下图所示. 
![](http://7xrrje.com1.z0.glb.clouddn.com/screenshot_620.png)
下面举一个例子看一看什么是决策边界. 如下图所示, 左边为数据集. 假设此时我们已经通过训练得到了$\theta=\begin{bmatrix}-3\\\ 1\\\ 1\end{bmatrix}$, 由上图可知, 当$\theta^Tx\ge0$时, 预测$y=1$. 即当$-3+x_1+x_2\ge0$时, 预测$y=1$；也即当$x_1+x_2\ge3$时, 预测$y=1$. 我们在坐标中画出$x_1+x_2=3$的图形, 如果数据在这条直线的上方, 我们就预测$y=1$；如果数据在这条直线的下方, 我们就预测$y=0$. 我们把$x_1+x_2\ge3$称为决策边界(Decision Boundary). 
![](http://7xrrje.com1.z0.glb.clouddn.com/screenshot_75.png)
下面看一个比较复杂的决策边界的例子. 在线性回归的时候谈到过使用高阶多项式特征, 当然这里我们也可以用. 我们添加两个特征一个是$x_1^2$, 一个是$x_2^2$. 假设我们通过训练得到参数$\theta$, 如下图所示. 当$-1+x_1^2+x_2^2\ge0$的时候, 预测$y=1$. 即$x_1^2+x_2^2\ge1$的时候, 预测$y=1$. 画出$x_1^2+x_2^2=1$的图形, 在圆内$y=0$, 在圆外$y=1$. 这是一个圆形的决策边界. 
![](http://7xrrje.com1.z0.glb.clouddn.com/screenshot_621.png)
当我们有更高阶的多项式时, 我们会得到更加复杂的决策边界. 
![](http://7xrrje.com1.z0.glb.clouddn.com/screenshot_622.png)
## 二. 代价函数
在之前的线性回归中, 我们的代价函数为：${J(\theta)=\frac{1}{m}\sum_{i=1}^m\frac{1}{2}\left(h_\theta(x^{(i)})-y^{(i)}\right)^2}$  
令$Cost\left(h_\theta(x^{(i)}),y^{(i)}\right)=\frac{1}{2}\left(h_\theta(x^{(i)})-y^{(i)}\right)^2$, 简记为$Cost\left(h_\theta(x),y\right)=\frac{1}{2}\left(h_\theta(x)-y\right)^2$
在线性回归中, 之所以可以使用梯度下降来找到全局最优解是因为代价函数$J(\theta)$是一个凸函数(convex). 但是对于对率回归来说, 假设函数$h_\theta(x)=\frac{1}{1+e^{-\theta^Tx}}$是一个较为复杂的非线性函数, 直接带入的话得到的代价函数就不是一个凸函数(non-convex), 如下图左侧部分所示. 这样使用梯度下降只能找到局部最优. 所以现在我们需要构造一个合理的并且是凸函数的代价函数
![](http://7xrrje.com1.z0.glb.clouddn.com/screenshot_77.png)
在对数几率回归中, 使用如下的$Cost\left(h_\theta(x),y\right)$
![](http://7xrrje.com1.z0.glb.clouddn.com/screenshot_80.png)
当$y=1$时, $Cost\left(h_\theta(x),y\right)$如下图所示. 此时, 如果我们$h_\theta(x)=1$, 那么$Cost=0$, 即当预测结果和真实结果一样时, 我们不对学习算法进行惩罚；但是当结果不一致时, 即$h_\theta(x)→ 0$时, 我们对算法的惩罚趋近于无穷. 
![](http://7xrrje.com1.z0.glb.clouddn.com/screenshot_81.png)
同样地, 下图是当$y=0$时的情况. 
![](http://7xrrje.com1.z0.glb.clouddn.com/screenshot_82.png)
这样对代价函数处理之后, 我们的代价函数就是一个凸函数, 可以使用梯度下降来站到一个全局最优解.
## 三. 梯度下降
因为y的值只有0或1两种情况, 我们现在将$Cost\left(h_\theta(x),y\right)$用一个式子来表达:${Cost\left(h_\theta(x),y\right)=-ylog(h_\theta(x))-(1-y)log(1-h_\theta(x))}$
(可以带入验证)
![](http://7xrrje.com1.z0.glb.clouddn.com/screenshot_83.png)  
于是得到代价函数:
$$
{J(\theta)=-\frac{1}{m}\left[\sum_{i=1}^my^{(i)}log(h_\theta(x^{(i)}))+(1-y^{(i)})log(1-h_\theta(x^{(i)}))\right]}
$$
![](http://7xrrje.com1.z0.glb.clouddn.com/screenshot_84.png)
到这里, 后面的步骤就和线性回归很相似了. 直接利用梯度下降即可. 同样地我们需要求偏导, 求完偏导之后我们发现得到的更新规则和之前线性回归的更性规则是一模一样的. 除了假设函数$h_\theta(x)$不一样. 这里如果特征之间的数量级差别较大也是需要特征缩放的. (注:下图公式中$\alpha$后少了一个$\frac{1}{m}$)
![](http://7xrrje.com1.z0.glb.clouddn.com/screenshot_86.png)
关于偏导数是如何求出的, 可参见[课程wiki](https://share.coursera.org/wiki/index.php/ML:Logistic_Regression).
## 四. 高级优化算法
除了梯度下降还有其他更加高级更加复杂的算法：Conjugate Gradient、BFGS和L-BFGS. 如下图, 右下角是这些算法的优点和缺点. 
![](http://7xrrje.com1.z0.glb.clouddn.com/screenshot_87.png)
下图是一个具体的例子, 右边是自己定义的代价函数, 下方的options是调用fminunc所需的参数, initialTheta是初始的$\theta$, 然后调用fminunc并传入相应的参数就可以得到最优的$\theta$（optTheta）. 
![](http://7xrrje.com1.z0.glb.clouddn.com/screenshot_88.png)
代价函数的代码如下:
```matlab
function [jVal, gradient] = costFunction(theta)
jVal = (theta(1)-5)^2 + (theta(2)-5)^2;
gradient = zeros(2,1);
gradient(1) = 2*(theta(1)-5);
gradient(2) = 2*(theta(2)-5);  
```
在Octave中演示如下:
![](http://7xrrje.com1.z0.glb.clouddn.com/screenshot_91.png)

## 五. 多分类问题
下图举了一些多分类(Multiclass Classification)的例子. 
![](http://7xrrje.com1.z0.glb.clouddn.com/screenshot_93.png)
在之前的二分类(Binary Classification)的问题中, 我们的数据集大概是如下图左侧所示. 而现在的多分类(Multi-class Classification)的问题中数据集如下图左侧所示. 
![](http://7xrrje.com1.z0.glb.clouddn.com/screenshot_94.png)
我们可以使用一对多(One-vs-all/One-vs-rest)方法来处理这个问题, 即将其分成三个二分类的问题. 如下图所示. 
![](http://7xrrje.com1.z0.glb.clouddn.com/screenshot_95.png)
预测时, 需要计算出$h_\theta^{(1)}(x)$、$h_\theta^{(2)}(x)$和$h_\theta^{(3)}(x)$的值并得出最大值, 其对应的分类即为预测x的分类. 
![](http://7xrrje.com1.z0.glb.clouddn.com/screenshot_96.png)
