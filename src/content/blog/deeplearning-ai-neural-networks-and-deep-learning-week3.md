---
pubDatetime: 2017-08-29
modDatetime: 2017-08-29
title: "deeplearning.ai 专项课程一第三周"
slug: "deeplearning-ai-neural-networks-and-deep-learning-week3"
tags:
  - "Machine Learning"
  - "Deep Learning"
  - "Neural Networks"
  - "deeplearning.ai"
description: "这是Andrew Ng在Coursera上的深度学习专项课程中第一课Neural Networks and Deep Learning第三周Shallow Neural Networks的学习笔记. 上周我们说了Logistic Re..."
---
![](http://7xrrje.com1.z0.glb.clouddn.com/screenshot_1286.png)
这是Andrew Ng在Coursera上的深度学习专项课程中第一课Neural Networks and Deep Learning第三周Shallow Neural Networks的学习笔记. 上周我们说了Logistic Regression是神经网络的基础, 在学习了上周的内容之后, 我们要正式地进入神经网络的学习. 当然, 我们先从简单的只有一个隐藏层的神经网络开始. 在学习完本周内容之后, 我们将会使用Python实现一个单个隐藏层的神经网络, 并在Planar data上测试.
注: 本课程适合有一定基本概念的同学使用, 如果没有任何基础, 可以先学习Andrew Ng在Coursera上的机器学习课程. 课程见这里: [Coursera Machine Learning](https://www.coursera.org/learn/machine-learning), 这门课程我也做了[笔记](/posts/machine-learning-andrew-ng-my-notes/), 可供参考.

- - - - -
## 一. 常用符号与基本概念
如下图第三行所示是一个简单的神经网络结构. 在神经网络中我们使用中括号的上角标来表示第几层, 例如$a^{[1]}$表示第一层的激活单元; 使用圆括号的上角标来表示第几个训练样本, 例如$x^{(1)}$表示第一个训练样本.
![](http://7xrrje.com1.z0.glb.clouddn.com/screenshot_1287.png?imageMogr/v2/thumbnail/!35p)
该神经网络完全可以使用上一周所讲的计算图来表示, 和LR计算图的区别仅仅在于多了一个$z$和$a$的计算而已. 如果你已经完全掌握了上一周的内容, 那么其实你已经知道了神经网络的前向传播, 反向传播(梯度计算)等等. 要注意的是各种参数, 中间变量($a, z$)的维度问题. 关于神经网络的基本概念, 这里就不赘述了. 见下图回顾一下:
![](http://7xrrje.com1.z0.glb.clouddn.com/screenshot_1288.png?imageMogr/v2/thumbnail/!35p)
## 二. 神经网络中的前向传播
我们先以一个训练样本来看神经网络中的前向传播. 现在我们只看这个神经网络中的输入层和隐藏层的第一个激活单元(如下图右边所示). 其实这就是一个Logistic Regression. 这样一来我们再看神经网络中输入层和隐藏层(不看输出层), 这就不就是四个LR放在一起吗? 在LR中$z$和$a$的计算我们已经掌握了, 那么在神经网络中$z$和$a$又是什么呢? 其实很简单, 我们记隐藏层第一个$z$为$z_1$, 第二个$z$记为$z_2$以此类推. 只要将这四个$z$纵向叠加在一起称为一个列向量即可得到神经网络中这一层的$z$($a$同理).  
![](http://7xrrje.com1.z0.glb.clouddn.com/screenshot_1289.png?imageMogr/v2/thumbnail/!35p)
那么这一层的$w, b$又是如何得到的? 别忘了, 对于参数$w$来说, 它本身就是一个列项量, 那么它是如何做纵向叠加的呢? 我们只需要将其转置变成一个横向量, 再纵向叠加即可. 
![](http://7xrrje.com1.z0.glb.clouddn.com/screenshot_1290.png?imageMogr/v2/thumbnail/!35p)
得到隐藏层的$a$之后, 我们可以将其视为输入, 现只看神经网络的隐藏层和输出层, 我们发现这不就是个LR嘛. 
![](http://7xrrje.com1.z0.glb.clouddn.com/screenshot_1291.png?imageMogr/v2/thumbnail/!35p)
这里总结一下各种变量的维度(注意这里是针对一个训练样本来说的, 其中 $n_L$ 代表第 $L$ 层的节点个数):
- $w.shape : (n_L, n_{(L-1)})$
- $b.shape : (n_L, 1)$
- $z.shape : (n_L, 1)$
- $a.shape : (n_L, 1)$

那么如果有$m$个训练样本这些变量的维度又是怎样的呢. 我们思考哪些变量的维度会随着样本数的变化二变化. $w$是参数显然它的维度是不会变的. 而输入每一个样本都会有一个$z$和$a$, 还记得$X$的形式吗? 同样地, $Z$就是将每个样本算出来的$z$横向叠加($A$同理). 具体计算过程如下图:
![](http://7xrrje.com1.z0.glb.clouddn.com/screenshot_1292.png?imageMogr/v2/thumbnail/!35p)
## 三. 神经网络中的激活函数
四中常用的激活函数: Sigmoid, Tanh, ReLU, Leaky ReLU. 其中sigmoid我们已经见过了, 它的输出可以看成一个概率值, 往往用在输出层. 对于中间层来说, 往往是ReLU的效果最好.
![](http://7xrrje.com1.z0.glb.clouddn.com/screenshot_1296.png?imageMogr/v2/thumbnail/!35p)
以上激活函数的导数请自行在草稿纸上推导.
![](http://7xrrje.com1.z0.glb.clouddn.com/screenshot_1297.png?imageMogr/v2/thumbnail/!35p)
![](http://7xrrje.com1.z0.glb.clouddn.com/screenshot_1298.png?imageMogr/v2/thumbnail/!35p)
![](http://7xrrje.com1.z0.glb.clouddn.com/screenshot_1299.png?imageMogr/v2/thumbnail/!35p)
为什么需要激活函数? 如果没有激活函数, 那么不论多少层的神经网络都只相当于一个LR. 证明如下:
![](http://7xrrje.com1.z0.glb.clouddn.com/screenshot_1300.png?imageMogr/v2/thumbnail/!35p)
## 四. 神经网络中的反向传播
反向传播最主要的就是计算梯度, 在上一周的内容中, 我们已经知道了LR梯度的计算. 同样地我们使用计算图来计算神经网络中的各种梯度.
![](http://7xrrje.com1.z0.glb.clouddn.com/screenshot_1303.png?imageMogr/v2/thumbnail/!35p)
$$
dz^{[2]} = \frac{dL}{dz}= \frac{dL}{da^{[2]}}\frac{da^{[2]}}{dz^{[2]}}=a^{[2]}-y
$$
$$
dW^{[2]}=\frac{dL}{dW^{[2]}}=\frac{dL}{dz^{[2]}}\frac{dz^{[2]}}{dW^{[2]}}=dz^{[2]}a^{[1]}
$$
$$
db^{[2]}=\frac{dL}{db^{[2]}}=\frac{dL}{dz^{[2]}}\frac{dz^{[2]}}{db^{[2]}}=dz^{[2]}
$$
$$
dz^{[1]} = \frac{dL}{dz^{[2]}}\frac{dz^{[2]}}{da^{[1]}}\frac{da^{[1]}}{dz^{[1]}}=W^{[2]T}dz^{[2]}*g^{[1]'}(z^{[1]})
$$
$$
dW^{[1]}=\frac{dL}{dW^{[1]}}=\frac{dL}{dz^{[1]}}\frac{dz^{[1]}}{dW^{[1]}}=dz^{[1]}x^T
$$
$$
db^{[1]}=\frac{dL}{db^{[1]}}=\frac{dL}{dz^{[1]}}\frac{dz^{[1]}}{db^{[1]}}=dz^{[1]}
$$
下图右边为在m个训练样本上的向量化表达:
![](http://7xrrje.com1.z0.glb.clouddn.com/screenshot_1304.png?imageMogr/v2/thumbnail/!35p)
## 五. 神经网络中的参数初始化
在LR中我们的参数$w$初始化为0, 如果在神经网络中也是用相同的初始化, 那么一个隐藏层的每个节点都是相同的, 不论迭代多少次. 这显然是不合理的, 所以我们应该随机地初始化$w$从而解决这个sysmetry breaking problem.
![](http://7xrrje.com1.z0.glb.clouddn.com/screenshot_1301.png?imageMogr/v2/thumbnail/!35p)
具体初始化代码可参见下图, 其中乘以$0.01$是为了让参数较小, 加速梯度下降(如激活函数为tanh时, 若参数较大则$z$也较大, 此时的梯度接近于0, 更新缓慢).
![](http://7xrrje.com1.z0.glb.clouddn.com/screenshot_1302.png?imageMogr/v2/thumbnail/!35p)
## 六. 使用Python搭建简单神经网络
完成本周内容以及课后作业后, 我们应该可以使用Python+Numpy实现一个简单的神经网络. 以下为参考代码, 也可从这里[Github](https://github.com/daniellaah/deeplearning.ai-notes-code/tree/master/Neural%20Networks%20and%20Deep%20Learning/week3)下载.  

SimpleNeuralNetwork.py
```python
def sigmoid(z):
    return 1. / (1.+np.exp(-z))

class SimpleNeuralNetwork():
    # simple neural network with one hidden layer
    def __init__(self, input_size, hidden_layer_size):
        self.paramters = self.__parameter_initailizer(input_size, hidden_layer_size)

    def __parameter_initailizer(self, n_x, n_h):
        # W cannot be initialized with zeros
        W1 = np.random.randn(n_h, n_x) * 0.01
        b1 = np.zeros((n_h, 1))
        W2 = np.random.randn(1, n_h) * 0.01
        b2 = np.zeros((1, 1))
        return {'W1': W1,'b1': b1,'W2': W2,'b2': b2}

    def __forward_propagation(self, X):
        W1 = self.paramters['W1']
        b1 = self.paramters['b1']
        W2 = self.paramters['W2']
        b2 = self.paramters['b2']
        # forward propagation
        Z1 = np.dot(W1, X) + b1
        A1 = np.tanh(Z1)
        Z2 = np.dot(W2, A1) + b2
        A2 = sigmoid(Z2)
        cache = {'Z1': Z1,'A1': A1,'Z2': Z2,'A2': A2}
        return A2, cache

    def __compute_cost(self, A2, Y):
        m = A2.shape[1]
        cost = -np.sum(Y*np.log(A2) + (1-Y)*np.log(1-A2)) / m
        return cost

    def cost_function(self, X, Y):
        # use the result from forward propagation and the label Y to compute cost
        A2, cache = self.__forward_propagation(X)
        cost = self.__compute_cost(A2, Y)
        return cost

    def __backward_propagation(self, cache, Y):
        A1, A2 = cache['A1'], cache['A2']
        W2 = self.paramters['W2']
        m = X.shape[1]
        # backward propagation computes gradients
        dZ2 = A2 - Y
        dW2 = np.dot(dZ2, A1.T) / m
        db2 = np.sum(dZ2, axis=1, keepdims=True) / m
        dZ1 = np.dot(W2.T, dZ2) * (1 - np.power(A1, 2))
        dW1 = np.dot(dZ1, X.T) / m
        db1 = np.sum(dZ1, axis=1, keepdims=True) / m
        grads = {'dW1': dW1,'db1': db1,'dW2': dW2,'db2': db2}
        return grads

    def __update_parameters(self, grads, learning_rate):
        self.paramters['W1'] -= learning_rate * grads['dW1']
        self.paramters['b1'] -= learning_rate * grads['db1']
        self.paramters['W2'] -= learning_rate * grads['dW2']
        self.paramters['b2'] -= learning_rate * grads['db2']

    def fit(self, X, Y, num_iterations, learning_rate, print_cost=False, print_num=100):
        for i in range(num_iterations):
            # forward propagation
            A2, cache = self.__forward_propagation(X)
            # compute cost
            cost = self.cost_function(X, Y)
            # backward propagation
            grads = self.__backward_propagation(cache, Y)
            # update parameters
            self.__update_parameters(grads, learning_rate)
            # print cost
            if i % print_num == 0 and print_cost:
                print ("Cost after iteration %i: %f" %(i, cost))
        return self

    def predict_prob(self, X):
        # result of forward_propagation is the probability
        A2, _ = self.__forward_propagation(X)
        return A2

    def predict(self, X, threshold=0.5):
        pred_prob = self.predict_prob(X)
        threshold_func = np.vectorize(lambda x: 1 if x > threshold else 0)
        Y_prediction = threshold_func(pred_prob)
        return Y_prediction

    def accuracy_score(self, X, Y):
        pred = self.predict(X)
        return len(Y[pred == Y]) / Y.shape[1]

```

main.py
```python
# Package imports
import numpy as np
import matplotlib.pyplot as plt
from testCases import *
import sklearn
import sklearn.datasets
import sklearn.linear_model
from planar_utils import plot_decision_boundary, sigmoid, load_planar_dataset, load_extra_datasets
%matplotlib inline

np.random.seed(1) # set a seed so that the results are consistent
X, Y = load_planar_dataset()
# Please note that the above code is from the programming assignment

import SimpleNeuralNetwork
np.random.seed(3)
num_iter = 10001
learning_rate = 1.2
input_size = X.shape[0]
hidden_layer_size = 4
clf = SimpleNeuralNetwork(input_size=input_size,
                          hidden_layer_size=hidden_layer_size)\
        .fit(X, Y, num_iter, learning_rate, True, 1000)
train_acc = clf.accuracy_score(X, Y)
print('training accuracy: {}%'.format(train_acc*100))

# output
# Cost after iteration 0: 0.693162
# Cost after iteration 1000: 0.258625
# Cost after iteration 2000: 0.239334
# Cost after iteration 3000: 0.230802
# Cost after iteration 4000: 0.225528
# Cost after iteration 5000: 0.221845
# Cost after iteration 6000: 0.219094
# Cost after iteration 7000: 0.220628
# Cost after iteration 8000: 0.219400
# Cost after iteration 9000: 0.218482
# Cost after iteration 10000: 0.217738
# training accuracy: 90.5%

for hidden_layer_size in [1, 2, 3, 4, 5, 20, 50]:
    clf = SimpleNeuralNetwork(input_size=input_size,
                               hidden_layer_size=hidden_layer_size)\
            .fit(X, Y, num_iter, learning_rate, False)
    print('{} hidden units, cost: {}, accuracy: {}%'
           .format(hidden_layer_size,
                   clf.cost_function(X, Y),
                   clf.accuracy_score(X, Y)))
# output
# 1 hidden units, cost: 0.6315593779798304, accuracy: 67.5%
# 2 hidden units, cost: 0.5727606525435293, accuracy: 67.25%
# 3 hidden units, cost: 0.2521014374551156, accuracy: 91.0%
# 4 hidden units, cost: 0.24703039056643344, accuracy: 91.25%
# 5 hidden units, cost: 0.17206481441467936, accuracy: 91.5%
# 20 hidden units, cost: 0.16003869681611513, accuracy: 92.25%
# 50 hidden units, cost: 0.16000569403994763, accuracy: 92.5%
```

## 七. 本周内容回顾
通过本周内容的学习, 我们:
1. 学习了神经网络的基本概念
2. 掌握了神经网络中各种变量的维度
3. 掌握了神经网络中的前向传播与反向传播
4. 了解了神经网络中的激活函数
5. 学习了神经网络中参数初始化的重要性
6. 掌握了使用Python实现简单的神经网络

相关链接: 
- [Andrew Ng - deeplearning.ai](https://www.deeplearning.ai/)
- [Coursera - Deep Learning Specialization](https://www.coursera.org/specializations/deep-learning)
- [Coursera - Neural Networks and Deep Learning](https://www.coursera.org/learn/neural-networks-deep-learning/home/welcome)
- [网易微专业 - 深度学习工程师](http://mooc.study.163.com/smartSpec/detail/1001319001.htm)
