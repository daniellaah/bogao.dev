---
pubDatetime: 2016-05-19
modDatetime: 2016-05-19
title: "Coursera机器学习笔记(十) - 机器学习经验方法总结"
slug: "machine-learning-andrew-ng-my-notes-week-6-advice-for-applying-machine-learning"
tags:
  - "Machine Learning"
  - "Notes"
  - "Coursera"
  - "MOOC"
description: "假设我们现在正在研究预测房价问题, 当我们测试假设函数的时候, 我们发现其中存在着很大的误差. 那么我们下一步应该如和去debugg我们的学习算法？ 我们可以从如下几个角度去考虑去提升我们的算法:"
---
- 课程地址：[Advice for Applying Machine Learning](https://www.coursera.org/learn/machine-learning/home/week/6)
- 课程Wik：[Advice for Applying Machine Learning](https://share.coursera.org/wiki/index.php/ML:Advice_for_Applying_Machine_Learning)
- 课件：[PPT](https://d396qusza40orc.cloudfront.net/ml/docs/slides/Lecture10.pptx) [PDF](https://d396qusza40orc.cloudfront.net/ml/docs/slides/Lecture10.pdf)

- - - - -
## 一. 算法评估
### 1.1 问题引入
假设我们现在正在研究预测房价问题, 当我们测试假设函数的时候, 我们发现其中存在着很大的误差. 那么我们下一步应该如和去debugg我们的学习算法？
我们可以从如下几个角度去考虑去提升我们的算法:
- 使用更多的训练样例
- 减少特征数
- 增加特征数
- 增加多项式特征
- 减小$\lambda$的值
- 增加$\lambda$的值

但是, 并不是每一种方法都是有效的, 那么我们该如何知道哪里出了问题呢?  
### 1.2 模型评估
为了能有效地评估我们的模型, 先要将数据集分成两个部分, 第一部分为训练集(training set), 第二部分为测试集(test set). 注意, 在数据集分割的时候, 最好先打乱数据的顺序, 以免数据集本身的顺序对我们的评估造成影响. 通常, 我们将元数据的70%作为训练集, 30%作为测试集.
对于线性回归问题, 训练/测试的过程如下：
1.通过训练集求得$\theta$
2.带入测试集中计算误差(test set error)
对于logistic回归, 训练/测试的过程和线性回归类似. 只不过这里有两种计算测试集误差的方法, 一种就是使用如下图PPT所示的公式. 另一种就是计算错分类(misclassification error)的比例. 具体为计算方法为：
$$
err(h_\theta(x),y) =
\begin{cases}
1,  \quad h_\theta(x) >= 0.5, y=0 | h_\theta(x) < 0.5, y=1 \\\
0, \quad h_\theta(x) >= 0.5, y=1 | h_\theta(x) < 0.5, y=0
\end{cases}
$$
$$
\text{Test error}=\frac{1}{m_{test}}\sum_{i=1}^{m_{test}}err(h_\theta(x_{test}^{(i)}),y_{test}^{(i)})
$$
### 1.3 模型选择, 训练/测试/验证集
一个能对数据非常好地拟合的模型并不一定可以有效的泛化, 我们已经看过了过拟合的例子, 如下图所示. 那么, 我们应该用什么来表示一个模型对未来数据的泛化能力呢?
你也许会想模型在测试集上的误差应该可以表示这个模型的泛化能力. 这样真的好吗? 我们来看一个例子.
假设我们现在有10个待选择的模型如下图所示, 为了选出最好的模型, 我们不妨设参数$d$为模型最高阶的阶数, 例如, $d=1$时它是一个一次式,  $d=2$时它是一个二次式等等. 我们按照上一节的测试集方法, 首先在训练集上得到每个模型的参数$\Theta^{(1)}, \Theta^{(2)}, ..., \Theta^{(10)}$, 然后使用这些参数来计算对应模型在测试集上的误差$J_{test}(\Theta^{(1)}), J_{test}(\Theta^{(2)}),...,J_{test}(\Theta^{(10)})$. 通过比较后发现，$J_{test}(\Theta^{(5)})$ 最小，所以我们选择这个模型，并且以 $J_{test}(\Theta^{(5)})$ 来代表该模型对未知数据的泛化能力。现在想想，用测试集误差来代表该模型对未知数据的泛化能力是不公平的。因为，这个测试集误差是我们通过对比选择出来的，它在这个测试集上肯定是最优的，相当于我们已经看到了这些数据，用它来代表对未知数据的泛化能力显然不行。
为了解决上述问题, 我们重新将数据分成训练集(Training set), 交叉验证集(Cross Validation set)和测试集(Test set)三部分, 如下图所示. 
然后计算Traning error, Cross Validation error和Test error, 如下图所示. 
最后, 我们用交叉验证集来选择模型, 如下图所示, 假设我们选择了第四个模型. 然后计算出测试集误差, 这个时候这个测试集误差就可以代表这个模型在新的样例下的适应程度了. 

## 二. 偏差与方差
### 2.1 判断偏差与方差
对于一个模型, 我们如何判断它存在bias还是variance呢?
下面我们看一下训练误差和验证误差关于d的图像. 当d比较大的时候(模型非常复杂), 此时可能过拟合了, 这个时候训练误差很小, 验证误差很大；当d比较小的时候(模型比较简单), 模型在训练集和验证集上表现的都比较差. 只有在中间某个位置的时候, 模型在训练集和验证集上都会有很好的表现.
如下图所示, cross validation error较大时为图中最左和最右两种情况. 左边这种情况叫做Bias右边这种情况叫做Variance. 
$$
\text{Bias(underfit)}:
\begin{cases}
J_{train}(\theta) \text{ is large} \\\
J_{cv}(\theta) \approx J_{train}(\theta)
\end{cases}
$$
$$
\text{Variance(overfit)}:
\begin{cases}
J_{train}(\theta) \text{ is small} \\\
J_{cv}(\theta) >> J_{train}(\theta)
\end{cases}
$$
### 2.2 正则化
假设我们的模型是一个高阶多项式, 我们想使用正则化来避免过拟合. 当$\lambda$选择不同值的时候有不同的效果, 如下图所示. 我们可以把$\lambda$看成正则化的强度, 当$\lambda$很大时, 正则化过强, 就会导致模型变得简单即产生bias; 当$\lambda$很小时, 正则化过弱, 就可能会导致variance.那么问题来了, 我们应该如何选择$\lambda$的值?
我们如下定义$J(\theta)$, $J_{train}(\theta)$, $J_{cv}(\theta)$, $J_{test}(\theta)$, 注意只有$J(\theta)$带正则化项. 
还是按照原来的套路, 我们先选定12个$\lambda$的值如下图所示, 然后分别训练得到相应的$\Theta$, 在使用这12个$\Theta$计算得到12个$J_{cv}(\Theta)$, 然后选择最小的$J_{cv}(\Theta)$对应的$\lambda$. 例如$J_{cv}(\Theta^{(5)})$是最小的, 那么我们就选择第5个$\lambda$, 并计算出$J_{test}(\Theta^{(5)})$来代表这个模型的泛化能力. 
下面我们来看看, $\lambda$值的变化对$J_{train}(\theta)$和$J_{cv}(\theta)$的影响. 如果$\lambda$很小, 即几乎没有使用正则化, 那么就会出现过拟合；如果$\lambda$很大, 则会出现high bias问题（underfitting）. 这里的图形都是比较理想化的, 在真实的数据中所画出的图形可能比这个要乱并且有噪声, 但大概都可以看出一个趋势, 这样可以帮助你选出验证误差最小的那个点. 
### 2.3 学习曲线
学习曲线(Learning Curves)可以帮助我们判断模我们的型到底出现了什么样的问题. 我们可以将$J_{train}(\theta)$和$J_{cv}(\theta)$看成关于m(训练样本的数量)的函数, 观察随着m的增加, $J_{train}(\theta)$和$J_{cv}(\theta)$的变化. 
在下图右侧, 当m=1, 2, 3即样本的数量很少时, 模型可以很容易完全拟合这些样本, 即$J_{train}(\theta)$很小；但是随着样本数量的增加, 想要完美地拟合数据就越来越困难, 即误差会增加. 所以, $J_{train}(\theta)$的图形如下图所示. 
我们再来看$J_{cv}(\theta)$, 只有当我们有大量的数据时, 我们得到的模型才能更好地泛化, $J_{cv}(\theta)$的图形如下图$J_{cv}(\theta)$所示. 
知道了学习曲线之后, 我们可以利用它来帮助我们判断增加训练样本的数量会不会对我们的模型有帮助.
现在假设我们的模型存在high bias问题, 即欠拟合. 我们的假设函数如下图右侧所示. 因为我们的模型较为简单, 根本就不能很好的描述数据的规律, 所以不论实在训练集上还是在交叉验证集上的误差都比较大, 并且这个时候增加更多的训练样本对我们的模型不会有任何帮助. 
现在我们看看另一种情况. 现在假设我们的模型存在high variance问题, 即过拟合. 我们的假设函数如下图右侧所示. 当m较小时, 假设函数可以完全地拟合训练集, 当m越来越大, 想要完全拟合就会困难一些, 但仍然可以很好地拟合, 所以如下图左侧$J_{train}(\theta)$所示. 因为在high variance的时候, 假设函数处于过拟合, 所以$J_{cv}(\theta)$一直都比较大. 但是持续增大样本的数量时, $J_{cv}(\theta)$会一直减小. 如下图左侧所示. 结论：如果学习算法存在high variance问题, 增加训练数据很有可能会有帮助. 
## 三. 总结

方案   |   可以解决的问题
:-:|:---:
搜集更多的数据   |   high variance
使用更少的特征   |   high variance
增加额外的特征   |   high bias
增加多项式特征   |   high bias
减小$\lambda$的值   |   high bias
增加$\lambda$的值   |   high variance
最后我们再来看看神经网络中的bias和variance问题. 如下图所示, 在"较小"的神经网络中, 虽然计算资源消耗较小, 但是容易出现欠拟合的问题. 在"较大"的神经网络中, 会消耗比较大的计算资源, 也会出现过拟合的问题, 但是我们可以使用regularization来解决这个问题, 这样的神经网络比"较小"的神经网络要更有效. 

更多关于bias和variance问题, 请参考:
- [Understanding the Bias-Variance Tradeoff](http://scott.fortmann-roe.com/docs/BiasVariance.html)
- [Stanford机器学习---第六讲. 怎样选择机器学习方法、系统](http://blog.csdn.net/abcjennifer/article/details/7797502)
