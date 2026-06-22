---
pubDatetime: 2017-08-27
modDatetime: 2017-08-27
title: "deeplearning.ai 专项课程一第二周"
slug: "deeplearning-ai-neural-networks-and-deep-learning-week2"
tags:
  - "Machine Learning"
  - "Deep Learning"
  - "Neural Networks"
  - "deeplearning.ai"
description: "这是Andrew Ng在Coursera上的深度学习专项课程中第一课Neural Networks and Deep Learning第二周Neural Networks Basics的学习笔记. 本周我们将要学习Logistic R..."
---
这是Andrew Ng在Coursera上的深度学习专项课程中第一课Neural Networks and Deep Learning第二周Neural Networks Basics的学习笔记. 本周我们将要学习Logistic Regression, 它是神经网络的基础. Logistic Regression可以看成是一种只有输入层和输出层(没有隐藏层)的神经网络. 在学习完本周的内容后, 我们将使用Python来实现一个这样的模型, 并将其应用在cat和non-cat的图像识别上.
注: 本课程适合有一定基本概念的同学使用, 如果没有任何基础, 可以先学习Andrew Ng在Coursera上的机器学习课程. 课程见这里: [Coursera Machine Learning](https://www.coursera.org/learn/machine-learning), 这门课程我也做了[笔记](/posts/machine-learning-andrew-ng-my-notes/), 可供参考.

- - - - -
## 一. 基本概念回顾
这次Andrew出的系列课程在符号上有所改动(和机器学习课程中的行列有所区别, 主要是为了后面代码实现更方便), 如下图所示.
更多关于本系列课程的符号[点这里](http://7xrrje.com1.z0.glb.clouddn.com/deeplearningnotation.pdf)同样地, 参数也有所变化(bias 单独拿出来作为b, 而不是添加$\theta_0$):
下图描述了Logistic Regression, 这在机器学习的课程里已经讲的很清楚了, 可以看我之前做的笔记回忆下[Logistic Regression](/posts/machine-learning-andrew-ng-my-notes-week-3-logistic-regression/). 这里需要明确两个概念. 一个是Loss function, 即损失函数, 它代表了对于**一个样本**估计值与真实值之间的误差; 另一个是Cost function, 它代表了所有样本loss的平均值.
熟悉的梯度下降:
如果上面提到的知识点都已经掌握了的话, 那么学这门课就没什么问题啦, 不会的赶紧去补.
## 二. 计算图与前向反向传播
在神经网络中, forward propagation 用来计算输出, backward propagation 用来计算梯度, 得到梯度后就可以更新对应的参数了. 为了帮助更好地理解前向反向传播, 我们使用图的方式来描述这两个过程. 首先可以看一个简单的例子$J(a, b, c)=3(a+bc)$, 可用下面的图来表示:
如上图所示通过前向传播, 我们可以得到$J=33$. 反向传播本质上就是通过链式法则不断求出前面各个变量的导数的过程.
这里说明一下, 在后面代码实现中, 这些导数都可以用$dvar$来表示, 例如$dw1$, $db1$等等.
有了计算图的概念之后, 我们将其运用到Logistic Regression上. 
上面的式子可以用下面的计算图来表达:
有了上面的图之后, 我们现在来计算反向传播. 
首先我们来计算$\frac{dL}{da}$:
$$
\begin{align}
\frac{dL}{da} & = - (\frac{y}{a} - \frac{(1-y)}{(1-a)}) 
\end{align}
$$
通过链式法则, 计算$\frac{dL}{dz}$:
$$
\begin{align}
\frac{dL}{dz} & = \frac{dL}{da}\frac{da}{dz} \\\
& = - (\frac{y}{a} - \frac{(1-y)}{(1-a)})\sigma(z)(1-\sigma(z)) \\\
& = - (\frac{y}{a} - \frac{(1-y)}{(1-a)})a(1-a)) \\\
& = -y(1-a) + (1-y)a \\\
& = a - y
\end{align}
$$
最后计算$\frac{dL}{dw1}, \frac{dL}{dw2}, \frac{dL}{db}$:
$$
\frac{dL}{dw_1} = \frac{dL}{dz}\frac{dz}{dw_1} = (a - y)x_1
$$
$$
\frac{dL}{dw_2} = \frac{dL}{dz}\frac{dz}{dw_2} = (a - y)x_2
$$
$$
\frac{dL}{db} = \frac{dL}{dz}\frac{dz}{db} = a - y
$$
怎么样? 是不是很简单呢? 这里我们所有的计算都是针对一个训练样本的. 当然我们不可能只有一个样本, 那么对于整个训练集, 我们应该怎么做呢? 其实很简单, 我们只需要将$J(w, b)$拆开来写就很清晰. 
$$
J(w, b) = \frac{1}{m}(L(a^{(1)}, y^{(1)}) + L(a^{(2)}, y^{(2)}) + ... + L(a^{(m)}, y^{m)}))
$$
对于每一个样本都有一个对应的$dz^{(i)}$, 而对于$dw, db$来说是对于所有求平均. 
## 三. 向量化
如果用上一节的伪代码来实现梯度计算的话, 效率会非常低. 向量化就是用来解决计算效率问题. 在Andrew机器学习的课程中, 其实已经提到了这个技术, 当时的作业好像并没有强制要求使用向量化. 这次的深度学习系列课程作业, 一律要求使用向量化来实现代码. 配合强大的Numpy, 向量化其实很简单. 来看一个例子:
```python
import numpy as np
import time

a = np.random.rand(1000000)
b = np.random.rand(1000000)

tic = time.time()
c = np.dot(a, b)
toc = time.time()

print(c)
print('Vectorized version:{}ms'.format(1000*(toc-tic)))

c = 0
tic = time.time()
for i in range(1000000):
    c += a[i] * b[i]
toc = time.time()

print(c)
print('For loop:{}ms'.format(1000*(toc-tic)))
```
上面代码输出为:
```
250187.092541
Vectorized version:1.1589527130126953ms
250187.092541
For loop:424.5340824127197ms
```
两个版本效率上差了400多倍. 神经网络本身计算就比较复杂, 加之深度学习训练样本往往都很大, 效率尤为重要. 任何时候都要尽可能避免使用for循环.
首先我们进行第一步优化, 将$w$写成向量的形式. $dw=np.zeros((n_x, 1))$, 这样就省去了内层关于$w$的循环.
接下来我们来看看如何优化关于m个训练样本的循环. 回顾下第一节中所说的$X$:
将$X$用如上的矩阵表达后, 通过$W^T+b$也就得到了$z$的向量化表达. $a$的向量化表达也就是$z$每个元素进行$\sigma$操作了. 简单吧. 想要把握住向量化一定要清楚每个变量的维度(即python代码里ndarray的shape), 那些是矩阵操作, 那些是element-wise操作等等. 把握住上面的之后, 在代码实现里还要注意哪里会产生'broadcasting'. 例如这里的$b$实际上是一个scalar, 但在进行$W^T+b$操作的时候, $b$被numpy自动broadcasting成和$W^T$维度一样的横向量.
接下来我们看一下梯度的向量化. 前面我们知道$dz^{(1)}, dz^{(2)}, ..., dz^{(m)}$, 这样得到$dZ$. $A, Y$的向量化前面已知了. 这样关于$z$的梯度如下所示. 有了$dZ$之后$db$就很简单了, 它是所有$dZ$中元素的均值. 在python中的代码表示为`np.mean(dZ)` 或者 `1/m * np.sum(a)`. $dW$可以通过观察向量的维度得到. $X$为$(n, m)$, $dZ$为$(1,m)$, 而$dW$的维度和$W$的维度一样为$(n,1)$, 这样就得到了$dW=\frac{1}{m}XdZ^T$.
通过上面的努力, 我们将之前for循环的版本改成了完全向量化的表示, 这样向量化实现的代码效率会大大提高. (注意: ppt里的`for iter in range(1000)` 是迭代次数, 这个循环是不可避免的)
本周课程剩下部分四个视频分别讲解Broadcasting, Numpy Vector, Jupyter Notebook以及Logistic Regression的概率解释. 如果对于Numpy以及Jupyter Notebook不熟悉的同学需要好好看看这三个视频(配合课后作业相信可以很快上手), 这里我就不做笔记了. 对于最后一个视频, 如果学过Andrew机器学习课程那么也就可以跳过, 相信大家手推Logistic Regression的cost function都没问题.
## 四. 使用Python实现Logistic Regression进行猫咪识别
完成本周内容以及课后作业后, 我们应该可以使用Python+Numpy实现一个完整的Logistic Regression, 可以用于任何二分类任务. 以下为参考代码, 也可这里[Github](https://github.com/daniellaah/deeplearning.ai-notes-code/tree/master/Neural%20Networks%20and%20Deep%20Learning/week2)下载.  

LogisticRegression.py:
```python
def sigmoid(z):
    return 1. / (1.+np.exp(-z))

class LogisticRegression():
    def __init__(self):
        pass

    def __parameters_initializer(self, input_size):
        # initial parameters with zeros
        w = np.zeros((input_size, 1), dtype=float)
        b = 0.0
        return w, b

    def __forward_propagation(self, X):
        m = X.shape[1]
        A = sigmoid(np.dot(self.w.T, X) + self.b)
        return A

    def __compute_cost(self, A, Y):
        m = A.shape[1]
        cost = -np.sum(Y*np.log(A) + (1-Y)*(np.log(1-A))) / m
        return cost

    def cost_function(self, X, Y):
        # use the result from forward propagation and the label Y to compute cost
        A = self.__forward_propagation(X)
        cost = self.__compute_cost(A, Y)
        return cost

    def __backward_propagation(self, A, X, Y):
        m = X.shape[1]
        # backward propagation computes gradients
        dw = np.dot(X, (A-Y).T) / m
        db = np.sum(A-Y) / m
        grads = {"dw": dw, "db": db}
        return grads

    def __update_parameters(self, grads, learning_rate):
        self.w -= learning_rate * grads['dw']
        self.b -= learning_rate * grads['db']

    def fit(self, X, Y, num_iterations, learning_rate, print_cost=False, print_num=100):
        self.w, self.b = self.__parameters_initializer(X.shape[0])
        for i in range(num_iterations):
            # forward_propagation
            A = self.__forward_propagation(X)
            # compute cost
            cost = self.__compute_cost(A, Y)
            # backward_propagation
            grads = self.__backward_propagation(A, X, Y)
            dw = grads["dw"]
            db = grads["db"]
            # update parameters
            self.__update_parameters(grads, learning_rate)
            # print cost
            if i % print_num == 0 and print_cost:
                print ("Cost after iteration {}: {:.6f}".format(i, cost))
        return self

    def predict_prob(self, X):
        # result of forward_propagation is the probability
        A = self.__forward_propagation(X)
        return A

    def predict(self, X, threshold=0.5):
        pred_prob = self.predict_prob(X)
        threshold_func = np.vectorize(lambda x: 1 if x > threshold else 0)
        Y_prediction = threshold_func(pred_prob)
        return Y_prediction

    def accuracy_score(self, X, Y):
        pred = self.predict(X)
        return len(Y[pred == Y]) / Y.shape[1]

```
main.py:
```python
import numpy as np
import matplotlib.pyplot as plt
import h5py
import scipy
from PIL import Image
from scipy import ndimage
from lr_utils import load_dataset
%matplotlib inline

# Loading the data (cat/non-cat)
train_set_x_orig, train_set_y, test_set_x_orig, test_set_y, classes = load_dataset()
### START CODE HERE ### (≈ 3 lines of code)
m_train = train_set_x_orig.shape[0]
m_test = test_set_x_orig.shape[0]
num_px = train_set_x_orig.shape[1]
### END CODE HERE ###

print ("Number of training examples: m_train = " + str(m_train))
print ("Number of testing examples: m_test = " + str(m_test))
print ("Height/Width of each image: num_px = " + str(num_px))
print ("Each image is of size: (" + str(num_px) + ", " + str(num_px) + ", 3)")
print ("train_set_x shape: " + str(train_set_x_orig.shape))
print ("train_set_y shape: " + str(train_set_y.shape))
print ("test_set_x shape: " + str(test_set_x_orig.shape))
print ("test_set_y shape: " + str(test_set_y.shape))

# Reshape the training and test examples

### START CODE HERE ### (≈ 2 lines of code)
train_set_x_flatten = train_set_x_orig.reshape(train_set_x_orig.shape[0], -1).T
test_set_x_flatten = test_set_x_orig.reshape(test_set_x_orig.shape[0], -1).T
### END CODE HERE ###

print ("train_set_x_flatten shape: " + str(train_set_x_flatten.shape))
print ("train_set_y shape: " + str(train_set_y.shape))
print ("test_set_x_flatten shape: " + str(test_set_x_flatten.shape))
print ("test_set_y shape: " + str(test_set_y.shape))
print ("sanity check after reshaping: " + str(train_set_x_flatten[0:5,0]))

X_train = train_set_x_flatten/255
y_train = train_set_y
X_test = test_set_x_flatten/255
y_test = test_set_y
# Please note that the above code is from the programming assignment
import LogisticRegression
num_iter = 2001
learning_rate = 0.005
clf = LogisticRegression().fit(X_train, y_train, num_iter, learning_rate, True, 500)
train_acc = clf.accuracy_score(X_train, y_train)
print('training acc: {}'.format(train_acc))
test_acc = clf.accuracy_score(X_test, y_test)
print('testing acc: {}'.format(test_acc))

# output:
# Cost after iteration 0: 0.693147
# Cost after iteration 500: 0.303273
# Cost after iteration 1000: 0.214820
# Cost after iteration 1500: 0.166521
# Cost after iteration 2000: 0.135608
# training acc: 0.9904306220095693
# testing acc: 0.7

```
## 五. 本周内容回顾
通过本周内容的学习, 我们:
- 了解了深度学习系列课程中使用到的各种符号,
- 回顾了Logistic Regression,
- 掌握了loss和cost的区别与联系,
- 重新认识了前向反向传播, 即计算图,
- 学习了深度学习中必要的求导知识,
- 熟悉了Numpy, Jupyter Notebook的使用
- 掌握了使用Python以神经网络的方式实现Logistic Regression模型, 并使用强大的Numpy来向量化.

相关链接: 
- [Andrew Ng - deeplearning.ai](https://www.deeplearning.ai/)
- [Coursera - Deep Learning Specialization](https://www.coursera.org/specializations/deep-learning)
- [Coursera - Neural Networks and Deep Learning](https://www.coursera.org/learn/neural-networks-deep-learning/home/welcome)
- [网易微专业 - 深度学习工程师](http://mooc.study.163.com/smartSpec/detail/1001319001.htm)
