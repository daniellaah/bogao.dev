---
pubDatetime: 2016-06-21
modDatetime: 2016-06-21
title: "Coursera机器学习笔记(十六) - 推荐系统"
slug: "machine-learning-andrew-ng-my-notes-week-9-recommender-systems"
tags:
  - "Machine Learning"
  - "Notes"
  - "Coursera"
  - "MOOC"
  - "Recommender Systems"
description: "下图是四位用户对于五部电影的评分（若用户没有评分, 则用❓表示）. 一些符号如下图右下角所示. 推荐系统就是通过已知的评分来判断未知的评分"
---
- 课程地址：[Recommender Systems](https://www.coursera.org/learn/machine-learning/home/week/9)
- 课程Wiki：[Recommender Systems](https://share.coursera.org/wiki/index.php/ML:Recommender_Systems)
- 课件：[PPT](https://d396qusza40orc.cloudfront.net/ml/docs/slides/Lecture16.pptx) [PDF](https://d396qusza40orc.cloudfront.net/ml/docs/slides/Lecture16.pdf)

- - - - -
 
## 一. Predicting Movie Ratings
### 1.1 Problem Formulation
  下图是四位用户对于五部电影的评分（若用户没有评分, 则用❓表示）. 一些符号如下图右下角所示.  推荐系统就是通过已知的评分来判断未知的评分. 
### 1.2 Content Based Recommendations
  假设每一部电影都对应一个特征向量, 如下图$x_1$, $x_2$所示. 对于第$j$个用户, 我们通过学习得到参数$\theta$. 这样, 这个用户对于第$i$电影的评分就可以$(\theta^{(j)})^Tx^{(i)}$用来估计. 
  用公式化表示为：
  优化目标为：
  使用梯度下降来得到最优解（和线性回归相似）. 
  这一种推荐系统是基于内容的, 在这个例子中, 我们使用一个特征向量来表示一部电影. 但是通常情况下, 我们没有这样的向量或者很难得到这样的向量. 这个时候我们就需要不是基于内容的推荐系统. 
## 二. Collaborative Filtering
### 2.1 Collaborative Filtering
  假设我们知道用户对于不同种类电影的喜好（$\theta^{(j)}$）以及对各个电影的评分, 我们就大致可以得到各个电影的特征向量（$x$）. 
  下面是上述问题的公式化表达：
  协同过滤：
### 2.2 Collaborative Filtering Algorithm
  协同过滤的优化目标：  
  协同过滤算法：
## 三. Low Rank Matrix Factorization
### 3.1 Vectorization: Low Rank Matrix Factorization
  协同过滤算法矩阵化：
  使用该算法后, 可以利用得到的特征向量来计算相似的电影. 
### 3.2 Implementation Detail: Mean Normalization
  假设我们有一个用户Eve, 他没有对任何电影进行评分. 这个时候, 我们运行完算法之后会得到$\theta^{(5)}= \begin{bmatrix} 0 \\\ 0  \end{bmatrix}$. 这时在对Eve对电影的评分进行预测的话, 会得到所有的评分都是0. 这显然不太合理. 
  我们需要进行 Mean Normalizaion处理, 如下图所示. 然后对于第$j$个用户在第$i$个电影的评分用$(\theta^{(j)})(x^{(i)})+\mu_i$来预测. 
