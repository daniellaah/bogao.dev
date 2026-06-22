---
pubDatetime: 2016-05-09
modDatetime: 2016-05-09
title: "Coursera机器学习笔记(八) - 神经网络(上)"
slug: "machine-learning-andrew-ng-my-notes-week-4-neural-networks-representation"
tags:
  - "Machine Learning"
  - "Notes"
  - "Coursera"
  - "MOOC"
  - "Neural Networks"
description: "这篇笔记介绍神经网络的基本表示方式，包括非线性分类、前向传播，以及用神经单元组合复杂决策边界的直觉。"
---
![](http://7xrrje.com1.z0.glb.clouddn.com/screenshot_119.png)
- 课程地址：[Neural Networks:Representation](https://www.coursera.org/learn/machine-learning/home/week/4)
- 课程Wiki：[Neural Networks:Representation](https://share.coursera.org/wiki/index.php/ML:Neural_Networks:_Representation)
- 课件：[PPT](https://d396qusza40orc.cloudfront.net/ml/docs/slides/Lecture8.pptx) [PDF](https://d396qusza40orc.cloudfront.net/ml/docs/slides/Lecture8.pdf)

- - - - -

## 一. 为什么要用神经网络
对于下图所示的分类问题, 我们可以利用高阶项来构造我们的假设函数. 但是, 实际问题往往有很多特征. 例如在房价预测的问题中, 我们可能有100个特征, 如果想要多项式包含所有的二次项那么这个多项式会有5,000个特征(复杂度为$O(n^2)$). 这样就会带来两个问题：1.过拟合 2.消耗大量计算资源. 当然可以使用所有二次项的子集, 例如$x_1^2, x_2^2, x_3^2, ...$, 但是这样可能又欠拟合. 如果想要包含所有的三次项, 那大概会有170,000个特征, 复杂度为$O(n^3)$. 
![](http://7xrrje.com1.z0.glb.clouddn.com/screenshot_120.png)
下面考虑一个计算机视觉的问题. 假设我们想训练一个可以识别汽车图片的分类器. 一张图片对于计算机来说就是一堆数字矩阵. 
![](http://7xrrje.com1.z0.glb.clouddn.com/screenshot_121.png)
对于一个50x50的图像会有2,500个像素, 即n=2,500(如果是RGB图的话n就是7500). 如果我们想要包含所有的二次项, 那么特征就是3,000,000个. 
![](http://7xrrje.com1.z0.glb.clouddn.com/screenshot_123.png)
对于这类问题使用logistic回归显然是没法解决的, 这个时候就要用到神经网络(Neural Network).
## 二. 神经网络结构
下图为一个神经元(neuron), 它的输入为$x_1, x_2, x_3$, 有时候为了方便我们添加一个$x_0$, 叫做bias unit. 它的输出为$h(\theta)$. $\theta$也叫做weights. 
![](http://7xrrje.com1.z0.glb.clouddn.com/screenshot_128.png)
下图为由多个神经元组成的神经网络. 第一层叫做输入层(input layer), 最后一层叫做输出层(output layer), 中间的叫做隐藏层(hidden layer). 
![](http://7xrrje.com1.z0.glb.clouddn.com/screenshot_130.png)
注意: 如果在第$j$层有$s_j$个units, 在第$j+1$层有$s_{j+1}$个units, 那么$\Theta^{(j)}$就是一个$s_{(j+1)} \times (s_j + 1)$的矩阵. (因为前一层增加了一个bias unit)
![](http://7xrrje.com1.z0.glb.clouddn.com/screenshot_129.png)
## 三. 前向传播算法
前向传播算法其实就是有输入层计算出输出的过程, 这里为了提高计算的效率, 我们使用向量化的算法. 首先我们做如下定义:
$z_1^{(2)}=\Theta_{10}^{(1)}x_0+\Theta_{11}^{(1)}x_1+\Theta_{12}^{(1)}x_2+\Theta_{13}^{(1)}x_3$,
$z_2^{(2)}=\Theta_{20}^{(1)}x_0+\Theta_{21}^{(1)}x_1+\Theta_{22}^{(1)}x_2+\Theta_{23}^{(1)}x_3$,
$z_3^{(2)}=\Theta_{30}^{(1)}x_0+\Theta_{31}^{(1)}x_1+\Theta_{32}^{(1)}x_2+\Theta_{33}^{(1)}x_3$,
$$
z^{(2)} =\begin{bmatrix} z_1^{(2)} \\\ z_2^{(2)} \\\ z_3^{(2)} \end{bmatrix}
$$
![](http://7xrrje.com1.z0.glb.clouddn.com/screenshot_132.png)
这样$z^{(2)}$的计算就可以写成向量计算: $z^{(2)} = \Theta^{(1)}x$, 进而有$a^{(2)}=g(z^{(2)})$. 为了和后面几层的写法统一, 我们令$a^{(1)}=x$, 所以有$z^{(2)} = \Theta^{(1)}a^{(1)}$. 
我们在隐藏层加上一个额外的$a_{(0)}^{(2)}=1$, 得到$a^{(2)}=\begin{bmatrix} a_0^{(2)} \\\ a_1^{(2)} \\\ a_2^{(2)} \\\ a_3^{(2)} \end{bmatrix}$, 同理$z^{(3)}=\Theta^{(2)}a^{(2)}$. 最后$h_\Theta(x)=a^{(3)}=g(z^{(3)})$
现在我们先把刚才的神经网络的输入层遮住, 观察剩下部分的结构以及算法我们发现, 其实这一部分其实就是前面所讲的logistic回归. 不同的是, 它的输入$\alpha$是由正真的特征$x$学习得到的, 可以把$\alpha$看成新的特征, $x$看成初始特征. 这样, 神经网络就相当于通过初始特征学习到新的特征, 再通过新的特征进行logistic回归得到输出结果.
![](http://7xrrje.com1.z0.glb.clouddn.com/screenshot_133.png)
当然, 神经网络不仅仅是上面一种结构, 下图展示了另一种神经网结构. 
![](http://7xrrje.com1.z0.glb.clouddn.com/screenshot_134.png)
## 四. 神经网络与逻辑运算
### 4.1 逻辑与,逻辑或
  逻辑与运算, 参数为-30, 20, 20. 结果如下图所示：
  ![](http://7xrrje.com1.z0.glb.clouddn.com/screenshot_136.png)
  逻辑或运算, 参数为-10, 20, 20. 结果如下图所示：
  ![](http://7xrrje.com1.z0.glb.clouddn.com/screenshot_137.png)
### 4.2 逻辑非
  逻辑非运算, 参数为10, -20. 结果如下图所示：
  ![](http://7xrrje.com1.z0.glb.clouddn.com/screenshot_138.png)
  将三个神经单元组成一个神经网络, 可以得到同或运算：
  ![](http://7xrrje.com1.z0.glb.clouddn.com/screenshot_139.png)
## 五. 多分类
  下两图为多种分类问题：
  ![](http://7xrrje.com1.z0.glb.clouddn.com/screenshot_144.png)
  ![](http://7xrrje.com1.z0.glb.clouddn.com/screenshot_145.png)
