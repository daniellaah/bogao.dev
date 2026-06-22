---
pubDatetime: 2017-09-06
modDatetime: 2017-09-06
title: "deeplearning-ai-专项课程二第一周"
slug: "deeplearning-ai-improving-deep-neural-networks-week1"
tags:
  - "Machine Learning"
  - "Deep Learning"
  - "Neural Networks"
  - "deeplearning.ai"
description: "在深度学习专项课程的第一门课Neural Networks and Deep Learning中, 我们主要学习了深度神经网络中的前向反向传播, 并成功地使用Python+Numpy实现了任意结构的二分类深度神经网络. 而从这次开始我..."
---
在深度学习专项课程的第一门课Neural Networks and Deep Learning中, 我们主要学习了深度神经网络中的前向反向传播, 并成功地使用Python+Numpy实现了任意结构的二分类深度神经网络. 而从这次开始我们要学习专项课程中第二门课Improving Deep Neural Networks: Hyperparameter tuning, Regularization and Optimization. 这次的笔记为第一周Practical aspects of Deep Learning, 主要内容包括: 数据集分割, 偏差与方差, 正则化, Normalization,  梯度检查等. 在学完本周的内容后, 我们会使用Python实现不同的权重初始化, L2正则, Dropout正则以及梯度下降.
注: 本课程适合有一定基本概念的同学使用, 如果没有任何基础, 可以先学习Andrew Ng在Coursera上的机器学习课程. 课程见这里: [Coursera Machine Learning](https://www.coursera.org/learn/machine-learning), 这门课程我也做了[笔记](/posts/machine-learning-andrew-ng-my-notes/), 可供参考.

- - - - -
## 一. 训练集, 验证集与测试集
## 数据集划分
在训练完一个模型时, 我们需要知道这个模型预测的效果. 此时就需要一个额外的数据集, 我们称为dev/hold out/validation set, 这里我们就统一称之为验证集. 如果我们需要知道模型最终效果的无偏估计, 那么我们还需要一个测试集. 在以往传统的机器学习中, 我们通常按照70/30来数据集分为训练集和验证集, 或者按照60/20/20的比例分为训练集, 验证集和测试集. 但在今天机器学习问题中, 我们可用的数据集的量级非常大(例如有100w个样本). 这时我们就不需要给验证集和测试集太大的比例, 例如98/1/1.
## 数据源的分布
在划分数据集中, 有一个比较常见的错误就是不小心使得在训练集中的数据和验证或测试集中的数据来自于不同的分布. 例如我们想要做一个猫的分类器, 在划分数据的时候发现训练集中的图片全都是来自于网页, 而验证集和测试集中的数据全都来自于用户. 这是一种完全错误的做法, 在实际中一定要杜绝.
## 二. 偏差, 方差
关于偏差与方差相比大家都很熟悉了, 在机器学习的课程中也已经学习到. 下面祭出Andrew经典的图例解释:
我们该如何定位模型所处的问题? 如下图所示, 这里举了四中情况下的训练集和验证集误差. 
- 当训练误差很小, 但验证误差和训练误差相差很大时为高方差
- 当训练误差和验证误差接近且都很大时为高偏差
- 当训练误差很大, 验证误差更大时为高方差, 高偏差
- 当训练误差和验证误差接近且都很小时为低方差低偏差

关于高方差高偏差可能是第一次听过, 如下图所示, 整体上模型处于高偏差, 但是对于一些噪声又拟合地很好. 此时就处于高偏差高方差的状态.
当我们学会定位模型的问题后, 那么该怎样解决对应的问题呢? 见下图:
若模型高偏差, 我们可以增加模型的复杂度例如使用一个"更大"的网络结构或者训练更久一点. 如模型高方差, 我们可以想办法获取更多的数据, 或者使用接下来我们要讲的正则化.
## 三. 正则化
在以前机器学习课程中已经学过正则化, 这里就不在赘述. 
## L2正则化
L2正则化下的Cost Function如下所示, 只需要添加正则项$\frac{\lambda}{2m}\sum_{l=1}^L\||w^{[l]}\||^2_F$, 其中F代表Frobenius Norm. 在添加了正则项之后, 相应的梯度也要变化, 所以在更新参数的时候需要加上对应的项. 这里注意一点, 我们只对参数w正则, 而不对b. 因为对于每一层来说, w有很高的维度, 而b只是一个标量. w对整个模型的影响远大于b.
下面给出添加正则项为什么能防止过拟合给出直观的解释. 如下图所示, 当我们的$\lambda$比较大的时候, 模型就会加大对w的惩罚, 这样有些w就会变得很小(L2正则也叫权重衰减, weights decay). 从下图左边的神经网络来看, 效果就是整个神经网络变得简单了, 从而降低了过拟合的风险.
从另一个角度来看. 以tanh激活函数为例, 当$\lambda$增加时, w会偏小, 这样$z = wa +b$也会偏小, 此时的激活函数大致是线性的. 这样模型的复杂度也就降低了, 即降低了过拟合的风险.
## Dropout
dropout也是一种正则化的手段, 在训练时以1-keep_prob随机地"丢弃"一些节点. 如下图所示. 
具体可参考如下实现方式, 在前向传播时将$a$中的某些值置为0, 为了保证大概的大小不受添加dropout影响, 再将处理后的$a$除以keep_prob.
更多细节请阅读[实现代码](https://github.com/daniellaah/deeplearning.ai-step-by-step-guide/blob/master/02-Improving-Deep-Neural-Networks/week1/02-regularization/DeepNeuralNetwork.py).
## 其他正则化
1.Data augmentation
2.Early stopping
## 四. Normalization
## 五. Vanishing/Exploding gradients
Vanishing/Exploding gradients指的是随着前向传播不断地进行, 激活单元的值会逐层指数级地增加或减小, 从而导致梯度无限增大或者趋近于零, 这样会严重影响神经网络的训练. 如下图. 
一个可以减小这种情况发生的方法, 就是用有效的参数初始化(该方法并不能完全解决这个问题). 具体可参见[代码实现](https://github.com/daniellaah/deeplearning.ai-step-by-step-guide/blob/master/02-Improving-Deep-Neural-Networks/week1/01-initialization/DeepNeuralNetwork.py)
更多关于该问题, 也可参考Udacity的Deep Learning课程中的讲解:[Vanishing / Exploding Gradients](https://www.youtube.com/watch?v=VuamhbEWEWA).
## 六. 梯度检查
待更新...
[代码实现](https://github.com/daniellaah/deeplearning.ai-step-by-step-guide/blob/master/02-Improving-Deep-Neural-Networks/week1/03-gradient_checking/DeepNeuralNetwork.py)
