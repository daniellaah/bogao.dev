---
pubDatetime: 2016-11-21
modDatetime: 2016-11-21
title: "CS229机器学习笔记(四)-生成学习算法, 朴素贝叶斯, 多项式事件模型"
slug: "cs229-machine-learning-notes-lecture-5-6"
tags:
  - "Machine Learning"
  - "CS229"
description: "这篇笔记梳理了生成学习算法、朴素贝叶斯和多项式事件模型，并对它们与判别学习的区别做了说明。"
---
![](http://7xrrje.com1.z0.glb.clouddn.com/c5928e75-429e-44ff-9315-c4aa81351ed3.jpg)
课程信息:  [主页](http://cs229.stanford.edu) [Youtube](https://www.youtube.com/playlist?list=PLA89DCFA6ADACE599)

- - - - -
## 生成学习算法
前面讲的Logistic回归是一种判别学习算法(Discriminative Learning Algorithm), 我们是直接找出一条决策边界. 直接学习$p(y|x)$或者直接学习$h_\theta(x)\in \{0,1\}$. 
![](http://7xrrje.com1.z0.glb.clouddn.com/logisticregression1.jpg)
而在生成学习算法中(Generative Learning Algorithm), 我们学习在给定label下特征的分布以及label本身的分布. 即学习$p(x|y)$和$p(y)$. 由贝叶斯公式我们有:
$$
p(y=1|x)=\frac{p(x|y=1)p(y=1)}{p(x)}
$$
由全概率公式我们可以得到:
$$
p(x)=p(y=0|x)p(y=0)+p(y=1|x)p(y=1)
$$
从这里我们就可以看出来，判别算法是直接对$p(y|x)$进行建模而生成算法是对$p(x|y)$和$p(y)$建模，然后得到$p(y|x)$. 
## 高斯判别分析
这一节我们来具体地学习一个生成学习算法，它就是Gaussian Discriminant Analysis(GDA). 
首先，我们假设$x\in R^n$且$x$是一个连续值, $p(x|y)$是一个高斯分布(多变量高斯分布, 如果不熟悉多变量高斯分布可以参考[lecture notes2](http://cs229.stanford.edu/notes/cs229-notes2.pdf)). 
$$
p(x|y;\mu, \Sigma)=\frac{1}{(2\pi)^{n/2}|\Sigma|^{1/2}}exp(-\frac12(x-\mu)^T\Sigma^{-1}(x-\mu))
$$
下面具体看看GDA模型:
$$
y\sim Bernoulli(\phi),

x|y=0\sim N(\mu_0, \Sigma),

x|y=1\sim N(\mu_1, \Sigma).
$$
即:
$$
y=\phi^y(1-\phi)^{1-y},
$$
$$
p(x|y=0)=\frac{1}{(2\pi)^{n/2}|\Sigma|^{1/2}}exp(-\frac12(x-\mu_0)^T\Sigma^{-1}(x-\mu_0)),
$$
$$
p(x|y=1)=\frac{1}{(2\pi)^{n/2}|\Sigma|^{1/2}}exp(-\frac12(x-\mu_1)^T\Sigma^{-1}(x-\mu_1)),
$$
参数为$\phi, \mu_0,\mu_1,\Sigma$, log似然估计为: 

$$
\begin{align}
l(\phi, \mu_0,\mu_1,\Sigma) & = log\prod_{i=1}^mp(x^{(i)},y^{(i)};\phi, \mu_0,\mu_1,\Sigma) \\\
& = log\prod_{i=1}^mp(x^{(i)}|y^{(i)}; \mu_0,\mu_1,\Sigma)p(y^{(i)};\phi).
 \end{align}
$$

注意: 其中第一个等式右边是一个联合似然(joint likelihood), 回顾一下之前讲的logistic模型中，我们的似然函数如下:$l(\theta) = log\prod_{i=1}^mp(y^{(i)}|x^{(i)};\theta).$它是一个条件似然. 
我们$\max l$ w.r.t $(\phi, \mu_0,\mu_1,\Sigma)$, 得到:
![](http://7xrrje.com1.z0.glb.clouddn.com/screenshot_728.png)
最后，我们便可以通过下式进行预测: 
$$
\begin{align}
arg\max_yp(y|x) & = arg\max_y\frac{p(x|y)p(y)}{p(x)} \\\
& = arg\max_y p(x|y)p(y)
\end{align}
$$

## GDA模型和logistic模型
如下图所示，我们画出了正样本和负样本特征的分布(高斯分布):
![](http://7xrrje.com1.z0.glb.clouddn.com/screenshot_729.png)
然后，我们想要画出$p(y=1|x)=\frac{p(x|y=1)p(y=1)}{p(x)}$的图:
![](http://7xrrje.com1.z0.glb.clouddn.com/gda_logistic.jpg)
这个时候我们会发现，画出的图形就是sigmoid函数. 也就是说，在GDA的假设下($x|y\sim N(\mu, \Sigma)$), 我们计算得到的$p(y=1|x)$就是我们在logistic regression中用的sigmoid函数.  但是反过来不成立，即$p(y=1|x)$是一个sigmoid函数不能推出$x|y\sim N(\mu, \Sigma)$. 这里非常有趣的是，如果我们的假设是$x|y$不仅仅是高斯分布只要是属于指数分布族任何一种，我们都可以推导出$p(y=1|x)$是一个sigmoid函数. 
通过以上我们可以知道GDA使用了更强的假设($x|y$是高斯分布), 如果假设成立或者近似成立的话，那么GDA就相对于logistic而言使用了更多的信息，那么它的预测结果也会更好. 但如果这个假设不成立的话，那么logistic会表现的更好。例如, 如果$x|y$实际上是poisson分布, 但我们还是按照GDA假设他是高斯分布，这样的话GDA的表现就不如logistic. 
 generative learning algorithm有一个好处就是它只需要更少的数据, 因为他用了更强的假设; 而logistic没有这个假设，所以需要更多的数据，但是它要更加的robust. 

## 朴素贝叶斯
朴素贝叶斯(Naive Bayes)是另一种Generative learning algorithm. 这里使用垃圾邮件的例子来说明. 
## 朴素贝叶斯分类器
$y\in \{0,1\}$代表正常邮件和垃圾邮件, 首先我们需要解决的是，邮件该用什么形式来表现. 我们有一个词典，如果一个邮件中出现了这个单词，我们就在相应的位置用1表示:
![](http://7xrrje.com1.z0.glb.clouddn.com/screenshot_730.png)
现在我们要对$p(x|y)$进行建模, $x\in {\{0,1\}}^n, n=50000$(字典里有50000个单词). 这样我们的$x$就有$2^{50000}$中表示. 我们就需要$2^{50000}-1$个参数, 这肯定是不现实的. 所以在朴素贝叶斯中, 我们又做了一个更加强的假设: $x_{i}$条件独立于给定的$y$. 即知道了一个单词在某一种邮件中出现了不会影响其他单词在这个邮件中出现的概率. 用公式表示就是: 
![](http://7xrrje.com1.z0.glb.clouddn.com/screenshot_731.png)
于是, 模型的参数为: 
$$
\phi_{i|y=1}=p(x_i|y=1),

\phi_{i|y=0}=p(x_i|y=0),

\phi_y=p(y=1).
$$
联合似然函数为:
$$
\mathcal{L}(\phi_y,\phi_{i|y=0},\phi_{i|y=1})=\prod_{i=1}^mp(x^{(i)},y^{(i)})
$$
最大似然估计:
![](http://7xrrje.com1.z0.glb.clouddn.com/screenshot_732.png)
当我们得到这些参数之后, 就可以对新的数据进行预测: 
![](http://7xrrje.com1.z0.glb.clouddn.com/screenshot_733.png)
## 拉普拉斯平滑
还是上面垃圾邮件分类的例子，假设我们现在有一封新的邮件，它包含了"nips"这个单词. 但在这之前, 我们没有一封邮件(不管是垃圾还是正常邮件)是包含了这个单词的. 假设"nips"在字典中是第35000个, 那么我们的朴素贝叶斯的两个参数如下: 
![](http://7xrrje.com1.z0.glb.clouddn.com/screenshot_734.png)
因此, 在我们做预测的时候, 我们会得到如下结果: 
![](http://7xrrje.com1.z0.glb.clouddn.com/screenshot_735.png)
这显然是不合理的. 不能因为一件事情从来没有观测到就说它出现的概率为0.
所以这里我们引入了拉普拉斯平滑处理的概念. 假设一个随机变量可取值$\{1,2,...,k\}$, 参数为$\phi_i=p(z=i)$. 给定m个独立的观测值$\{ z^{(1)},z^{(2)},...,z^{(m)}\}$, 最大似然估计为: 
$$
\phi_j=\frac{\sum_{i=1}^m1\{ z^{(i)}=j\}}{m}
$$
为了不让$\phi_j$有可能等于0, 我们做一个拉普拉斯平滑, 即, 将最大似然估计改为: 
$$
\phi_j=\frac{\sum_{i=1}^m1\{ z^{(i)}=j\}+1}{m+k}
$$
这不仅解决了$\phi_j$可能等于0的问题, 而且保证了$\sum_{j=1}^k\phi_j$仍然等于1.
再回到朴素贝叶斯分类器, 使用了Laplace Smoothing之后的最大似然估计为:
![](http://7xrrje.com1.z0.glb.clouddn.com/screenshot_736.png)
## 多项式事件模型
我们前面讲的朴素贝叶斯模型可以解决很多分类问题, 在文本分类下, 它又叫做多元伯努利事件模型(Multi-variate Bernoulli Event Model). 这一节我们来讲一个专门为文本分类设计的模型, 它就叫做多项式事件模型(Multinomial Event Model). 
在Multi-variate Bernoulli Event Model中, 我们的邮件用如下形式表示: 
![](http://7xrrje.com1.z0.glb.clouddn.com/screenshot_730.png)
在Multinomial Event Model中, 我们使用另一种形式来表示, 将第i个邮件用一个向量表示:
$$
(x_1^{(i)},x_2^{(i)},...,x_{n_i}^{(i)})
$$
其中$n_i$表示第i封邮件的单词的个数, $x_j$表示第$j$个单词在字典中的索引, 例如字典有50000个单词的话, 那么$x_j\in \{ 1,2,...,50000\}$. 
现在, 我们模型的参数为: 
$$
\phi_{k|y=1}=p(x_j=k|y=1),

\phi_{k|y=0}=p(x_j=k|y=0),

\phi_y=p(y=1).
$$
log似然函数为: 
![](http://7xrrje.com1.z0.glb.clouddn.com/screenshot_739.png)
最大似然估计为: 
![](http://7xrrje.com1.z0.glb.clouddn.com/screenshot_737.png)
若使用Laplace Smoothing则最大似然估计为: 
![](http://7xrrje.com1.z0.glb.clouddn.com/screenshot_738.png)
其中$|V|$为字典中单词的个数. 

视频中的神经网络部分可以参考: 
1.[我的机器学习笔记(九) - 神经网络(上)](/posts/machine-learning-andrew-ng-my-notes-week-4-neural-networks-representation/)
2.[我的机器学习笔记(九) - 神经网络(下)](/posts/machine-learning-andrew-ng-my-notes-week-5-neural-networks-learning/)

参考: 
1. [机器学习笔记-子实](https://github.com/zlotus/notes-LSJU-machine-learning)
2. [生成学习、高斯判别、朴素贝叶斯—斯坦福ML公开课笔记5](http://blog.csdn.net/stdcoutzyx/article/details/9285001)
2. [斯坦福CS229机器学习课程笔记四：GDA、朴素贝叶斯、多项事件模型](http://logos.name/archives/260)
