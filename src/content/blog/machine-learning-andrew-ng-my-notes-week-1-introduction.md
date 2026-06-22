---
pubDatetime: 2016-04-06
modDatetime: 2016-04-06
title: "Coursera机器学习笔记(一) - 监督学习vs无监督学习"
slug: "machine-learning-andrew-ng-my-notes-week-1-introduction"
tags:
  - "Machine Learning"
  - "Notes"
  - "Coursera"
  - "MOOC"
  - "Supervised Learning"
  - "Unsupervised Learning"
description: "什么是监督学习? 我们来看看维基百科中给出的定义:"
---
![](http://7xrrje.com1.z0.glb.clouddn.com/screenshot_03.png)

- 课程地址：[Supervised Learning & Unsupervised Learning](https://www.coursera.org/learn/machine-learning/lecture/1VkCb/supervised-learning) 
- 课程Wiki：[Introduction](https://share.coursera.org/wiki/index.php/ML:Introduction)
- 课件：[PPT](https://d396qusza40orc.cloudfront.net/ml/docs/slides/Lecture1.pptx)  [PDF](https://d396qusza40orc.cloudfront.net/ml/docs/slides/Lecture1.pdf)

- - - - -

## 一. 监督学习
什么是监督学习? 我们来看看[维基百科](https://zh.wikipedia.org/wiki/%E7%9B%A3%E7%9D%A3%E5%BC%8F%E5%AD%B8%E7%BF%92)中给出的定义:
> 监督式学习（英语：Supervised learning），是一个机器学习中的方法，可以由训练资料中学到或建立一个模式（函数 / learning model），并依此模式推测新的实例。训练资料是由输入物件（通常是向量）和预期输出所组成。函数的输出可以是一个连续的值（称为回归分析），或是预测一个分类标签（称作分类）

从数据的角度来讲, 监督学习和无监督学习的区别就在于监督学习的数据不仅仅有特征组成, 即每一个数据样本都包含一个准确的输出值. 在房价预测的问题中, 数据由特征+房价组成.

### 1.1 监督学习的分类
在监督学习中, 我们的预测结果可以是连续值, 也可以是离散值. 我们根据这样的属性将监督学习氛围回归问题和分类问题.
$$
\text{Supervised Learning:}
\begin{cases}
\text{Regression} \\\
\text{Classification}
\end{cases}
$$
下面我们分别举一个例子来看看, 学完这两个例子之后, 我们就会对监督学习, 回归以及分类有比较清晰地认识了.
### 1.2 监督学习举例
#### 1.2.1 回归问题
我们现在有这么一个问题, 我们想通过给定的一个房子的面积来预测这个房子在市场中的价格. 这里的房子的面积就是特征, 房子的价格就是一个输出值. 为了解决这个问题, 我们获取了大量的房地产数据, 每一条数据都包含房子的面积及其对应价格. 第一, 我们的数据不仅包含房屋的面积, 还包含其对应的价格, 而我们的目标就是通过面积预测房价. 所以这应该是一个监督学习; 其次, 我们的输出数据房价可以看做是连续的值, 所以这个问题是一个回归问题. 至于如何通过数据得到可以使用的模型, 后面的几节课我们再做讨论.
![](http://7xrrje.com1.z0.glb.clouddn.com/img_1.jpg?imageMogr/v2/thumbnail/!45p)
思考: 如果对于同样的数据, 但是我们的目标是预测这个房子的房价是大于100w还是小于100w, 那么这个时候是什么哪一类问题?
#### 1.2.2 分类问题
我们再来看一个分类问题, 从名字上来讲, 分类问题还是比较好理解的, 我们的目标应该是要对数据进行分类. 现在我们的数据是有关乳腺癌的医学数据, 它包含了肿瘤的大小以及该肿瘤是良性的还是恶性的. 我们的目标是给定一个肿瘤的大小来预测它是良性还是恶性. 我们可以用0代表良性，1代表恶性. 这就是一个分类问题, 因为我们要预测的是一个离散值. 当然, 在这个例子中, 我们的离散值可以去'良性'或者'恶性'. 在其他分类问题中, 离散值可能会大于两个.例如在该例子中可以有{0,1,2,3}四种输出，分别对应{良性, 第一类肿瘤, 第二类肿瘤, 第三类肿瘤}。
![](http://7xrrje.com1.z0.glb.clouddn.com/img_1022aa.jpg?imageMogr/v2/thumbnail/!45p)
在这个例子中特征只有一个即瘤的大小。 对于大多数机器学习的问题, 特征往往有多个(上面的房价问题也是, 实际中特征不止是房子的面积). 例如下图， 有“年龄”和“肿瘤大小”两个特征。(还可以有其他许多特征，如下图右侧所示)
![](http://7xrrje.com1.z0.glb.clouddn.com/img_1018abc.jpg?imageMogr/v2/thumbnail/!45p)
## 二. 无监督学习
在监督学习中我们也提到了它与无监督学习的区别. 在无监督学习中, 我们的数据并没有给出特定的标签, 例如上面例子中的房价或者是良性还是恶性. 我们目标也从预测某个值或者某个分类便成了寻找数据集中特殊的或者对我们来说有价值结构. 如下图所示, 我们可以直观的感受到监督学习和无监督学习在数据集上的区别. 
![](http://7xrrje.com1.z0.glb.clouddn.com/screenshot_582.png?imageMogr/v2/thumbnail/!55p)
我们也可以从图中看到, 大概可以将数据及分成两个簇. 将数据集分成不同簇的无监督学习算法也被称为聚类算法.
![](http://7xrrje.com1.z0.glb.clouddn.com/img_1025dadc.jpg?imageMogr/v2/thumbnail/!45p)
### 2.1 无监督学习举例
想要了解这些例子更详细的内容可以看[上课视频](https://www.coursera.org/learn/machine-learning/lecture/olRZo/unsupervised-learning).
#### 2.1.1 新闻分类
第一个例子举的是Google News的例子。Google News搜集网上的新闻，并且根据新闻的主题将新闻分成许多簇, 然后将在同一个簇的新闻放在一起。如图中红圈部分都是关于BP Oil Well各种新闻的链接，当打开各个新闻链接的时候，展现的都是关于BP Oil Well的新闻。 
![](http://7xrrje.com1.z0.glb.clouddn.com/img_0168.png?imageMogr/v2/thumbnail/!45p)
#### 2.1.2 根据给定基因将人群分类
如图是DNA数据，对于一组不同的人我们测量他们DNA中对于一个特定基因的表达程度。然后根据测量结果可以用聚类算法将他们分成不同的类型。
![](http://7xrrje.com1.z0.glb.clouddn.com/img_0169.png?imageMogr/v2/thumbnail/!45p)
#### 2.1.3 鸡尾酒派对效应
详见课程: [Unsupervised Learning](https://www.coursera.org/learn/machine-learning/lecture/olRZo/unsupervised-learning)
#### 2.1.4 其他
这里又举了其他几个例子，有组织计算机集群，社交网络分析，市场划分，天文数据分析等。具体可以看一下视频：[Unsupervised Learning](https://www.coursera.org/learn/machine-learning/lecture/olRZo/unsupervised-learning)
   ![](http://7xrrje.com1.z0.glb.clouddn.com/img_1024abc.jpg?imageMogr/v2/thumbnail/!45p)
