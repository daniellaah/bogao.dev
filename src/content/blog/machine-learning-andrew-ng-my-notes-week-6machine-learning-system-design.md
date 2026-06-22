---
pubDatetime: 2016-05-23
modDatetime: 2016-05-23
title: "Coursera机器学习笔记(十一) - 机器学习系统设计"
slug: "machine-learning-andrew-ng-my-notes-week-6machine-learning-system-design"
tags:
  - "Machine Learning"
  - "Notes"
  - "Coursera"
  - "MOOC"
description: "假设我们需要设计一个垃圾邮件分类器. 如下图所示, 左边为垃圾邮件, 右边为正常邮件. 如下图所示, 我们可以选择100个单词来表示是否是垃圾邮件. 例如, 含有\\\"deal\\\", \\\"buy\\\", \\\"discount\\\"等表示垃圾邮件, 含有..."
---
![](http://7xrrje.com1.z0.glb.clouddn.com/screenshot_201.png)
- 课程地址：[Machine Learning System Design](https://www.coursera.org/learn/machine-learning/home/week/6)
- 课程Wiki：[Machine Learning System Design](https://share.coursera.org/wiki/index.php/ML:Machine_Learning_System_Design)
- 课件：[PPT](https://d396qusza40orc.cloudfront.net/ml/docs/slides/Lecture11.pptx) [PDF](https://d396qusza40orc.cloudfront.net/ml/docs/slides/Lecture11.pdf)

- - - - -

## 一. 构建垃圾邮件分类器
### 1.1 垃圾邮件分类器
假设我们需要设计一个垃圾邮件分类器. 如下图所示, 左边为垃圾邮件, 右边为正常邮件. 
![](http://7xrrje.com1.z0.glb.clouddn.com/screenshot_202.png)
如下图所示, 我们可以选择100个单词来表示是否是垃圾邮件. 例如, 含有"deal", "buy", "discount"等表示垃圾邮件, 含有"andrew", "now"等表示正常邮件. 特征向量可以用下图左侧蓝色部分表示, 如果出现某个单词, 对应的位置就是1, 否则为0（注：在实际中, 我们使用训练集中最多出现的n个单词(10,000-50,000个)而不是人工选择100个单词）. 
![](http://7xrrje.com1.z0.glb.clouddn.com/screenshot_203.png)
现在问题来了, 如何利用你的时间来使得你的分类器的效果最好？下图展示了一些idea. 
1.使用"honeypot"项目来搜集大量数据（垃圾邮件）
2.研究基于邮件路由信息的特征
3.研究邮件本身的内容, 例如"dicount"和"dicounts"是否应该看成同一个单词, "deal"和"Dealer"是否应该看成同一个单词；以及标点符号的特征. 
4.设计高级算法来检测有拼写错误的单词（例如 m0rtgage, med1cine, w4tches.)
![](http://7xrrje.com1.z0.glb.clouddn.com/screenshot_204.png)  
### 1.2 误差分析
这一节课介绍Error Analysis的概念, 可以帮助我们做出更好的抉择. 
以下是比较推荐的做法：
1.快速实现一个较简单的算法并使用 cross-validation测试. 
2.描绘出learning curves, 然后决定是需要更多数据还是更多特征等等. 
3.错误分析：人工地检查算法在cross validation set上出现错误的样例, 找出这些样例中的一些有规律的特征. 
![](http://7xrrje.com1.z0.glb.clouddn.com/screenshot_205.png)  
假设我们在cross validation set中有500样例, 其中100个在我们的算法分类时出现了错误. 我们可以人工地将它们基于邮件的类型来分类. 例如, 我们发现这100个分类错误的邮件中有12个是有关药物的, 有4个是有关假货的, 有53个是关于窃取密码的还有31个是其他的, 这个时候我们就应该多关注关于窃取密码的邮件, 看看能不能从其中发现更好的特征. 再例如, 我们发现这100个分类错误的邮件中有5个有故意的拼写错误, 有16个包含不正常的邮件路由还有32个包含不正常的标点符号的使用等等. 这个时候, 我们应该考虑拼写错误可能对正确分类的影响不大, 我们应该把重点放在不正常的标点符号的使用. 
![](http://7xrrje.com1.z0.glb.clouddn.com/screenshot_206.png)  
最后, 我们应该确保我们对与算法有一种数值评估的方式, 也就是可以用一个数字来表示我们的算法的准确性或者误差. 这个就叫做numerical evaluation, 我们这里先来看一个例子. 
我们现在考虑要不要把"discount", "discounts", "discounted", "discounting"看成一个单词, 可以使用"stemming"软件来处理自然语言, 并把他们看成同一个单词, 但是这样也可能出错, 例如"universe"和"university". 我们需要一种数字评估的方式来判断用"stemming"和不用"stemming"的区别. 例如我们可以计算用"stemming"的cross validation error和不用"stemming"时候的cross validation error. 假设用"stemming"的cross validation error为5%而不用"stemming"时候的cross validation error为3%, 这就可能说明使用"stemming"是一个不错的方法, 因为它比较大的降低了分类误差. 
![](http://7xrrje.com1.z0.glb.clouddn.com/screenshot_207.png)  
## 二. 处理不均衡数据
### 2.1 准确率和召回率
假设我们现在训练一个logistic regression去诊断一个病人是否得了癌症, 当我们使用测试集测试的时候发现只有1%的误差. 这看上去我们的模型非常准确. 但是实际上, 只有0.5%的病人是得了癌症的, 这个时候, 1%的误差就不代表这个模型很准确了. 例如, 如下图左下角的代码, 我们不管输入的x是什么, 都直接预测y=0(即不是癌症). 即使这种预测, 也能够有99.5%的准确率. 产生这个的原因就是因为y=1和y=0数量相差非常大, 我们把它叫做skewed classes(一个分类的数量远大于另一个分类的数量). 
![](http://7xrrje.com1.z0.glb.clouddn.com/screenshot_208.png)  
对于skewed classes, 我们就需要另一种方法来判断模型的好坏, 这个方法就是计算准确率(Precision)/召回率(Recall). 如下图所示. 
![](http://7xrrje.com1.z0.glb.clouddn.com/screenshot_209.png)  
### 2.2 $\text{F}_1 \text{Score}$
正常情况下, 当$h_x(\theta) \ge 0.5$的时候我们预测$y=1$, 当$h_x(\theta) < 0.5$的时候我们预测$y=0$. 现在假设我们想要预测结果为$y=1$的时候有很高的置信度, 这个时候我们可以阈值从0.5改成0.7或0.9. 这个时候我们的模型就具有一个高precision低recall. 或者我们想要避免将得癌症的患者预测为没有癌症, 这个时候我们就需要设定一个比较低的阈值例如0.3. 在这种情况下, 我们的模型就具有一个高recall低precision. 
我们可以描绘出Precision／Recall的图形来进行一个权衡. 
![](http://7xrrje.com1.z0.glb.clouddn.com/screenshot_210.png) 
现在有三个相同的算法, 但是它们的阈值不同, 对应的precision／recall如下图所示. 我们该选择哪一个?
之前说过如果我们只有一个值能够评估算法就好了, 但是现在我们有两个值, 我们该如何做？很自然的我们能想到的一个做法是使用平均值, 但是对于这三个算法均值最高的是算法3, 但是它的precision只有0.02. 显然, 取平均值不是个好办法.
这个时候引进$\text{F}_1 \text{Score}$的概念, 公式为
$\text{F}_1 \text{Score}=2\frac{PR}{P+R}$. 
![](http://7xrrje.com1.z0.glb.clouddn.com/screenshot_211.png)  
![](http://7xrrje.com1.z0.glb.clouddn.com/screenshot_216.png) 
## 三. 数据集对模型的影响
如下图所示, Banko和Brill使用四种算法对易混词进行分类. 它们发现, 随着训练集数据的增大, 那些一开始表现地不是很好的算法在最后反而精确度较高. 
> It's not who has the best algorithm that wins. It's who has the most data.

![](http://7xrrje.com1.z0.glb.clouddn.com/screenshot_212.png)  
满足上述说法是有一定条件的, 第一个条件就是特征包含了可以准确预测结果的充足信息. 我们可以这样理解：给定特征x, 一个在和y有关的专家是否可以确信地预测y？
![](http://7xrrje.com1.z0.glb.clouddn.com/screenshot_213.png)  
第二个条件就是学习算法需要具有很多参数(例如, 在逻辑回归／线性回归中有很多特征, 在神经网络中有许多隐藏层), 并且训练集很大. 这样, 使用大量的数据就不太会过拟合, 从而就会有一个较小的$J_{test}(\theta)$. 
![](http://7xrrje.com1.z0.glb.clouddn.com/screenshot_214.png)
