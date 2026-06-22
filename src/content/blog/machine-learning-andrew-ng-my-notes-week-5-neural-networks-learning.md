---
pubDatetime: 2016-05-13
modDatetime: 2016-05-13
title: "Coursera机器学习笔记(九) - 神经网络(下)"
slug: "machine-learning-andrew-ng-my-notes-week-5-neural-networks-learning"
tags:
  - "Machine Learning"
  - "Notes"
  - "Coursera"
  - "MOOC"
  - "Neural Networks"
description: "这篇笔记继续梳理神经网络中的反向传播、误差项推导以及向量化表达。"
---
- 课程地址：[Neural Networks:Learning](https://www.coursera.org/learn/machine-learning/home/week/5)
- 课程Wiki：[Neural Networks:Learning](https://share.coursera.org/wiki/index.php/ML:Neural_Networks:_Learning)
- 课件：[PPT](https://d396qusza40orc.cloudfront.net/ml/docs/slides/Lecture9.pptx) [PDF](https://d396qusza40orc.cloudfront.net/ml/docs/slides/Lecture9.pdf)

- - - - -

## 一. 代价函数
在神经网络中我们使用L来表示总的层数, 例如下图中L=4; 使用$s_l$表示在第$l$层中unit的个数(不包括bias unit), 如下图中$s_1=3$, $s_2=5$, $s_3=5$, $s_L=4$. 对于一个分类问题要么是二分类(Binary classification)要么是多分类(Multi-class classification). 对于二分类问题, 神经网络只需要一个输出单元; 而对于多分类问题, 需要K个输出单元, 其中K为类的个数. 
这里我们按照多分类对代价函数进行描述. 下图为神经网络的代价函数与logistic回归的代价函数的对比. 对于前半部分, 因为神经网络中有K个输出, 所以先要对这K个输出的损失求和; 对于后半部分, 因为每一层(除了输出层)都有一个$\Theta$, 所以正则化项要将这些权重都包括进来(当然, 不需要包括bias unit的权重). 
如下图所示, $h_\Theta(x)$是一个K维的向量, 即$h_\Theta(x) \in \rm I\\!R^K$, 我们用$(h_\Theta(x))_i$来表示第$i$个输出值.
下面这段文字是这个[课程wiki](https://share.coursera.org/wiki/index.php/ML:Neural_Networks:_Learning)对于神经网络代价函数的解释.
> * the double sum simply adds up the logistic regression costs calculated for each cell in the output layer; 
> * the triple sum simply adds up the squares of all the individual Θs in the entire network;
> * the i in the triple sum does not refer to training example i.   

## 二. 逆/反向传播算法
知道了代价函数之后, 我们还是按照套路来求代价函数的最优解. 同样地, 我们希望使用梯度下降来找到最优解. 想要使用梯度下降当然需要求出"梯度"即偏导项$\frac{\partial}{\partial\Theta_{ij}^{(l)}}J(\Theta)$. 而计算这个偏导项的过程就叫做逆传播算法或者叫反向传播算法. 
首先我们根据前向传播算法来得到$a^{(1)}$, $a^{(2)}$, $a^{(3)}$, $a^{(4)}$和$z^{(2)}$, $z^{(3)}$, $z^{(4)}$.
在逆传播算法中我们定义每层的误差
$$
\delta^{(l)}=\frac{\partial}{\partial z^{(l)}}J(\Theta)
$$
$\delta_j^{(l)}$表示第$l$层第$j$个节点的误差. 为了求出偏导项$\frac{\partial}{\partial\Theta_{ij}^{(l)}}J(\Theta)$, 我们首先要求每一层的$\delta$(不包括第一层, 因为第一层是输入层). 首先, 对于输出层即第4层(这里我们不考虑正则化):

$$
\begin{align}
\delta_j^{(4)} & = \frac{\partial}{\partial z_i^{(4)}}J(\Theta) \\\
& = \frac{\partial J(\Theta)}{\partial a_i^{(4)}}\frac{\partial a_i^{(4)}}{\partial z_i^{(4)}} \\\
& = -\frac{\partial}{\partial a_i^{(4)}}\sum_{k=1}^K\left[y_kloga_k^{(4)}+(1-y_k)log(1-a_k^{(4)})\right]g'(z_i^{(4)})  \\\
& = -\frac{\partial}{\partial a_i^{(4)}}\left[y_iloga_i^{(4)}+(1-y_i)log(1-a_i^{(4)})\right]g(z_i^{(4)})(1-g(z_i^{(4)}))  \\\
& = \left(\frac{1-y_i}{1-a_i^{(4)}}-\frac{y_i}{a_i^{(4)}}\right)a_i^{(4)}(1-a_i^{(4)}) \\\
& = (1-y_i)a_i^{(4)} - y_i(1-a_i^{(4)}) \\\
& = a_i^{(4)} - y_i
\end{align}
$$
(关于 $g'(z_i^{(4)})$ 的证明见本文最后的补充材料。其中 $a_j^{(4)}$ 就是 $(h_\Theta(x))_j$，$j$ 就是输出单元的个数，用向量化的表示为：$\delta^{(4)}=a^{(4)}-y$。对于剩下每层的 $\delta_i^{(l)}$ 如下:  

$$
\begin{align}
\delta_i^{(l)} & = \frac{\partial}{\partial z_i^{(l)}}J(\Theta) \\\
& = \sum_{j=1}^{S_j}\frac{\partial J(\Theta)}{\partial z_j^{(l+1)}}\cdot\frac{\partial z_j^{(l+1)}}{\partial a_i^{(l)}}\cdot\frac{\partial a_i^{(l)}}{\partial z_i^{(l)}} \\\
& = \sum_{j=1}^{S_j}\delta_j^{(l+1)}\cdot\Theta_{ij}^{(l)}\cdot g'(z_i^{(l)}) \\\
& = g'(z_i^{(l)})\sum_{j=1}^{S_j}\delta_j^{(l+1)}\cdot\Theta_{ij}^{(l)}
\end{align}
$$
写成向量的形式即为:
$$
\delta^{(l)}=(\Theta^{(l)})^T\delta^{(l+1)}.*g'(z^{(l)})
$$
求出来所有的$\delta$之后, 可以很容易得到$\frac{\partial}{\partial\Theta_{ij}^{(l)}}J(\Theta)=a_i^{(l)}\delta_j^{(l+1)}$, 这就是我们要求的偏导项(忽略正则化).
上面所有的推导都是基于一个样本的, 现在假设有$m$个样本, 我们可以使用BGD来求解最优值. 假设我们有一个训练集如下图所示, 对于所有的$l,i,j$我们先令$\Delta_{ij}^{(l)}=0$, 然后对于每一个样本, 都进行如下图所示的计算并使用$\Delta_{ij}^{(l)}$进行累加. 其中$\Delta_{ij}^{(l)}:=\Delta_{ij}^{(l)}+a_j^{(l)}\delta_i^{(l+1)}$用向量的表示形式为：$\Delta^{(l)}:=\Delta^{(l)}+\delta^{(l+1)}(a^{(l)})^T$. 最后, 计算出$D_{ij}^{(l)}$如下图所示(注意,ppt上有个小错误, 根据我们的代价函数应该是$D_{ij}^{(l)}:=\frac{1}{m}(\Delta_{ij}^{(l)}+\lambda\Theta_{ij}^{(l)})$). 
关于BP算法, 可以参考Caltech的[Learning from Data](https://www.youtube.com/watch?v=Ih5Mr93E-2c&t=3013s&index=10&list=PLD63A284B7615313A).

## 三. 参数调整
为了使用高级优化算法, 这一节我们讲如何调整参数. 在神经网络中, 参数$\Theta^{(j)}$是一个矩阵, 而在之前利用高级优化算法的课程中, 我们知道$\theta$是一个向量, 这个时候就需要对$\Theta$进行Unrolling. 
如下图所示的神经网络中, (ppt中出现了一些错误, 根据$\Theta_1$, $\Theta_2$, $\Theta_3$, 这个神经网络应该是有4层, 并且$s_1=10$, $s_2=10$, $s_3=10$, $s_4=1$. )$\Theta^{(1)}$, $\Theta^{(2)}$, $\Theta^{(3)}$, $D^{(1)}$, $D^{(2)}$, $D^{(3)}$如下图所示, 在Octave/Matlab中, 我们可以使用如下代码将所有对应的矩阵转化成一个向量：
```matlab
  thetaVec = [Theta1(:); Theta2(:); Theta3(:)];
  DVec = [D1(:); D2(:); D3(:)]
  %使用如下代码可以得到原来的矩阵
  Theta1 = reshape(thetaVec(1: 110), 10, 11);
  Theta2 = reshape(thetaVec(111: 220), 10, 11);
  Theta3 = reshape(thetaVec(221: 231), 1, 11);
```
  下图为利用unrolling来使用高级优化算法的步骤：
## 四. 梯度检查
由于神经网络的复杂性, 我们在使用梯度下降或者其他的高级优化算法时可能会出现bug, 即使感觉上好像没什么问题. 那么如何能有效地检查出问题呢, 这个时候就需要使用Gradient Checking.
首先, 如下图所示, 我们使用如下近似：$\frac{d}{d\theta}J(\theta)\approx \frac{J(\theta+\epsilon)-J(\theta-\epsilon)}{2\epsilon}$, 通常我们取$\epsilon=10^{-4}$.   
上面的例子中$\theta$是一个实数, 在下图中, $\theta$是一个向量, 此时是对偏导数进行数值估计.  
在实际运用中, 我们使用如下代码来计算gradApprox. 然后, 我们将通过逆传播算法计算得来的DVec和gradApprox进行比较, 如果这两个值近似的话, 那么就说明我们的逆传播算法运行地没有问题. 
下图描述了使用Gradient Checking时的步骤. 需要主意的是, 在得到gradApprox之后一定要即时关闭Gradient Checking, 因为它会非常大地消耗计算资源.  

## 五. 随机初始化
在之前的linear regression和logistic regression中我们初始化$\theta$的值为0. 在神经网络中也可以这么初始化吗? 
现初始化$\Theta_{ij}^{(l)}=0$, 此时会有$a_1^{(2)}=a_2^{(2)}$, $\delta_1^{(2)}=\delta_2^{(2)}$. 这样不论进行多少次更新, 永远会有$a_1^{(2)}=a_2^{(2)}$, 也就是说这两个神经元是完全等同的, 这显然不合理, 那么我们应该如何初始化参数呢?
对于$\Theta^{(1)} \in \mathbb{R}^{10\times 11}$, 使用随机函数来进行初始化：
```matlab
Theta1 = rand(10, 11)*(2*INIT_EPSILON) - INIT_EPSILON
```

## 六. 模型选择
神经网络有许许多多种结构, 我们应该如何选择神经网络的结构？
在神经网络中, 有两个是确定的, 那就是输入单元的个数和输出单元的个数. 因为前者就是特征的个数（维度）, 而后者是分类的数量. 一个合理的默认值为, 有一个隐藏层；或者有多个隐藏层, 并且这些隐藏层单元数量相等. 
## 七. 总结
## 八. 应用
 [视频地址](https://www.coursera.org/learn/machine-learning/lecture/zYS8T/autonomous-driving)

以下为补充材料:
$$
\begin{align}
\frac{\partial g(z)}{\partial z} & = -\left( \frac{1}{1 + e^{-z}} \right)^2\frac{\partial{}}{\partial{z}} \left(1 + e^{-z} \right) \\\
& = -\left( \frac{1}{1 + e^{-z}} \right)^2e^{-z}\left(-1\right) \\\
& = \left( \frac{1}{1 + e^{-z}} \right) \left( \frac{1}{1 + e^{-z}} \right)\left(e^{-z}\right) \\\
& = \left( \frac{1}{1 + e^{-z}} \right) \left( \frac{e^{-z}}{1 + e^{-z}} \right) \\\
& = \left( \frac{1}{1+e^{-z}}\right)\left( \frac{1+e^{-z}}{1+e^{-z}}-\frac{1}{1+e^{-z}}\right) \\\
& = g(z) \left( 1 - g(z)\right) \\\
\end{align}
$$
