---
pubDatetime: 2016-06-26
modDatetime: 2016-06-26
title: "Coursera机器学习笔记(十七) - 大规模机器学习"
slug: "machine-learning-andrew-ng-my-notes-week-10-large-scale-machine-learning"
tags:
  - "Machine Learning"
  - "Notes"
  - "Coursera"
  - "MOOC"
description: "在使用大量的数据之前, 我们应该现画出学习曲线, 这样可以帮助我们判断使用大量的数据是否会对我们的学习算法有帮助"
---
- 课程地址：[Large Scale Machine Learning](https://www.coursera.org/learn/machine-learning/home/week/10)
- 课程Wiki：[Large Scale Machine Learning](https://share.coursera.org/wiki/index.php/ML:Large_Scale_Machine_Learning)
- 课件：[PPT](https://d396qusza40orc.cloudfront.net/ml/docs/slides/Lecture17.pptx) [PDF](https://d396qusza40orc.cloudfront.net/ml/docs/slides/Lecture17.pdf)

- - - - -

## 一. Gradient Descent with Large Datasets
### 1.1 Learning with Large Datasets
  在使用大量的数据之前, 我们应该现画出学习曲线, 这样可以帮助我们判断使用大量的数据是否会对我们的学习算法有帮助. 
### 1.2 Stochastic Gradient Descent
  回顾一下线性回归和梯度下降. 
  当数据量非常大的时候, 计算消耗就会很大, 这种将所有样本一起计算的梯度下降称为"Batch gradient descent". 
  下面是Batch gradient descent与Stochastic gradient descent的对比. 
  Stochastic gradient descent最终会在最小值附近徘徊. 
### 1.3 Mini-Batch Gradient Descent
  Mini-Batch gradient descent是相当于介于Batch gradient descent和Stochastic gradient descent之间的梯度下降. 
### 1.4 Stochastic Gradient Descent Convergence
  在Stochastic gradient descent中, 我们可以绘出每1000个迭代之后cost的平均图形, 用来检查算法是否正确运行. 
  下面是几种可能出现的情况. 
  如果想要得到最小值, 可以逐渐地减小$\alpha$. 
## 二. Advanced Topics
### 2.1 Online Learning
### 2.2 Map Reduce and Data Parallelism
