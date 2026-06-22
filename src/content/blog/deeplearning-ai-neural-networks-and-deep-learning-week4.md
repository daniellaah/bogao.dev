---
pubDatetime: 2017-08-31
modDatetime: 2017-08-31
title: "deeplearning.ai 专项课程一第四周"
slug: "deeplearning-ai-neural-networks-and-deep-learning-week4"
tags:
  - "Machine Learning"
  - "Deep Learning"
  - "Neural Networks"
  - "deeplearning.ai"
description: "这是Andrew Ng在Coursera上的深度学习专项课程中第一门课Neural Networks and Deep Learning第四周Deep Neural Networks的学习笔记. 本周的大部分内容在上一周的笔记中都已经..."
---
这是Andrew Ng在Coursera上的深度学习专项课程中第一门课Neural Networks and Deep Learning第四周Deep Neural Networks的学习笔记. 本周的大部分内容在上一周的笔记中都已经覆盖了, 所以本周的笔记会非常简略. 本周重点任务是使用Python要实现一个任意层的神经网络, 并在cat数据上测试. 
注: 本课程适合有一定基本概念的同学使用, 如果没有任何基础, 可以先学习Andrew Ng在Coursera上的机器学习课程. 课程见这里: [Coursera Machine Learning](https://www.coursera.org/learn/machine-learning), 这门课程我也做了[笔记](/posts/machine-learning-andrew-ng-my-notes/), 可供参考.

- - - - -
## 一. 深度神经网络中的常用符号回顾
在上一周的内容中, 我们已经介绍了神经网络中的常用符号以及各种变量的维度. 这里就不再赘述, 不清楚的可以回顾上周的笔记或视频内容.
## 二. Intuition about deep representation
关于深度神经网络直观地解释这部分笔记暂略, 请直接观看课程视频内容:[Why deep representation?](https://www.coursera.org/learn/neural-networks-deep-learning/lecture/rz9xJ/why-deep-representations).
## 三. 深度神经网络中的前向/反向传播
在第三周的笔记中详细介绍了神经网络的前向/方向传播, 这里完全套用, 只是多了层数而已. 还不能手推的同学可以仔细研究上周的笔记内容([戳我](/posts/deeplearning-ai-neural-networks-and-deep-learning-week3/)).
## 四. 参数与超参数
在神经网络中参数指的是$W, b$, 这两个参数是通过梯度下降算法不断优化的. 而超参数指的是学习率, 迭代次数, 决定神经网络结构的参数以及激活函数的选择等等, 在后面我们还会提到momentum, minibatch size, regularization等等. 这些都属于超参数, 需要我们手动设定. 
这些超参数也决定了最终的参数$W, b$. 不同的超参数的选择会导致模型很大的差别, 所以超参数的选择也非常重要(后面的课程会讲解如何选择超参数).
## 五. 使用Python实现深度神经网络
完成本周内容以及课后作业后, 我们应该可以使用Python+Numpy实现一个任意结构的二分类神经网络. 以下为参考代码, 也可从这里[Github](https://github.com/daniellaah/deeplearning.ai-notes-code/tree/master/Neural%20Networks%20and%20Deep%20Learning/week4)下载.  

DeepNeuralNetwork.py
```python
def sigmoid(z):
    return 1. / (1.+np.exp(-z))

def relu(Z):
    A = np.maximum(0,Z)
    return A

def leaky_relu(Z):
    A = np.maximum(0,Z)
    A[Z < 0] = 0.01 * Z
    return A

class DeepNeuralNetwork():
    def __init__(self, layers_dim, activations):
        # assert (layers_dim[-1] == 1)
        # assert (activations[-1] == 'sigmoid')
        # assert (len(activations) == len(layers_dims)-1)
        np.random.seed(1)
        self.layers_dim = layers_dim
        self.__num_layers = len(layers_dim)
        self.activations = activations
        self.input_size = layers_dim[0]
        self.parameters = self.__parameters_initializer(layers_dim)
        self.output_size = layers_dim[-1]

    def __parameters_initializer(self, layers_dim):
        # special initialzer with np.sqrt(layers_dims[l-1])
        L = len(layers_dim)
        parameters = {}
        for l in range(1, L):
            parameters['W'+str(l)] = np.random.randn(layers_dim[l], layers_dim[l-1]) / np.sqrt(layers_dims[l-1])
            parameters['b'+str(l)] = np.zeros((layers_dim[l], 1))
        return parameters

    def __one_layer_forward(self, A_prev, W, b, activation):
        Z = np.dot(W, A_prev) + b
        if activation == 'sigmoid':
            A = sigmoid(Z)
        if activation == 'relu':
            A = relu(Z)
        if activation == 'leaky_relu':
            A = leaky_relu(Z)
        if activation == 'tanh':
            A = np.tanh(Z)
        cache = {'Z': Z, 'A': A}
        return A, cache

    def __forward_propagation(self, X):
        caches = []
        A_prev = X
        caches.append({'A': A_prev})
        # forward propagation by laryer
        for l in range(1, len(self.layers_dim)):
            W, b = self.parameters['W'+str(l)], self.parameters['b'+str(l)]
            A_prev, cache = self.__one_layer_forward(A_prev, W, b, self.activations[l-1])
            caches.append(cache)
        AL = caches[-1]['A']
        return AL, caches

    def __compute_cost(self, AL, Y):
        m = Y.shape[1]
        cost = -np.sum(Y*np.log(AL) + (1-Y)*np.log(1-AL)) / m
        return cost

    def cost_function(self, X, Y):
        # use the result from forward propagation and the label Y to compute cost
        assert (self.input_size == X.shape[0])
        AL, _ = self.__forward_propagation(X)
        return self.__compute_cost(AL, Y)

    def sigmoid_backward(self, dA, Z):
        s = sigmoid(Z)
        dZ = dA * s*(1-s)
        return dZ

    def relu_backward(self, dA, Z):
        dZ = np.array(dA, copy=True)
        dZ[Z <= 0] = 0
        return dZ

    def leaky_relu_backward(self, dA, Z):
        dZ = np.array(dA, copy=True)
        dZ[Z <= 0] = 0.01
        return dZ

    def tanh_backward(self, dA, Z):
        s = np.tanh(Z)
        dZ = 1 - s*s
        return dZ

    def __linear_backward(self, dZ, A_prev, W):
        # assert(dZ.shape[0] == W.shape[0])
        # assert(W.shape[1] == A_prev.shape[0])
        m = A_prev.shape[1]
        dW = np.dot(dZ, A_prev.T) / m
        db = np.sum(dZ, axis=1, keepdims=True) / m
        dA_prev = np.dot(W.T, dZ)
        return dA_prev, dW, db

    def __activation_backward(self, dA, Z, activation):
        assert (dA.shape == Z.shape)
        if activation == 'sigmoid':
            dZ = self.sigmoid_backward(dA, Z)
        if activation == 'relu':
            dZ = self.relu_backward(dA, Z)
        if activation == 'leaky_relu':
            dZ = self.leaky_relu_backward(dA, Z)
        if activation == 'tanh':
            dZ = self.tanh_backward(dA, Z)
        return dZ

    def __backward_propagation(self, caches, Y):
        m = Y.shape[1]
        L = self.__num_layers
        grads = {}
        # backward propagate last layer
        AL, A_prev = caches[L-1]['A'], caches[L-2]['A']
        dAL =  - (Y/AL - (1-Y)/(1-AL))
        grads['dZ'+str(L-1)] = self.__activation_backward(dAL, caches[L-1]['Z'], self.activations[-1])
        grads['dA'+str(L-2)], \
        grads['dW'+str(L-1)], \
        grads['db'+str(L-1)] = self.__linear_backward(grads['dZ'+str(L-1)],
                                                      A_prev, self.parameters['W'+str(L-1)])
        # backward propagate by layer
        for l in reversed(range(1, L-1)):
            grads['dZ'+str(l)] = self.__activation_backward(grads['dA'+str(l)],
                                                            caches[l]['Z'],
                                                            self.activations[l-1])
            A_prev = caches[l-1]['A']
            grads['dA'+str(l-1)], \
            grads['dW'+str(l)], \
            grads['db'+str(l)] = self.__linear_backward(grads['dZ'+str(l)], A_prev, self.parameters['W'+str(l)])
        return grads

    def __update_parameters(self, grads, learning_rate):
        for l in range(1, self.__num_layers):
            # assert (self.parameters['W'+str(l)].shape == grads['dW'+str(l)].shape)
            # assert (self.parameters['b'+str(l)].shape == grads['db'+str(l)].shape)
            self.parameters['W'+str(l)] -= learning_rate * grads['dW'+str(l)]
            self.parameters['b'+str(l)] -= learning_rate * grads['db'+str(l)]

    def fit(self, X, Y, num_iterations, learning_rate, print_cost=False, print_num=100):
        for i in range(num_iterations):
            # forward propagation
            AL, caches = self.__forward_propagation(X)
            # compute cost
            cost = self.__compute_cost(AL, Y)
            # backward propagation
            grads = self.__backward_propagation(caches, Y)
            # update parameters
            self.__update_parameters(grads, learning_rate)
            # print cost
            if i % print_num == 0 and print_cost:
                    print ("Cost after iteration %i: %f" %(i, cost))
        return self

    def predict_prob(self, X):
        A, _ = self.__forward_propagation(X)
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

main.py
```python
import time
import numpy as np
import h5py
import matplotlib.pyplot as plt
import scipy
from PIL import Image
from scipy import ndimage
from dnn_app_utils_v2 import *

%matplotlib inline
plt.rcParams['figure.figsize'] = (5.0, 4.0) # set default size of plots
plt.rcParams['image.interpolation'] = 'nearest'
plt.rcParams['image.cmap'] = 'gray'

%load_ext autoreload
%autoreload 2

np.random.seed(1)

train_x_orig, train_y, test_x_orig, test_y, classes = load_data()

# Explore your dataset
m_train = train_x_orig.shape[0]
num_px = train_x_orig.shape[1]
m_test = test_x_orig.shape[0]

print ("Number of training examples: " + str(m_train))
print ("Number of testing examples: " + str(m_test))
print ("Each image is of size: (" + str(num_px) + ", " + str(num_px) + ", 3)")
print ("train_x_orig shape: " + str(train_x_orig.shape))
print ("train_y shape: " + str(train_y.shape))
print ("test_x_orig shape: " + str(test_x_orig.shape))
print ("test_y shape: " + str(test_y.shape))

# Reshape the training and test examples
train_x_flatten = train_x_orig.reshape(train_x_orig.shape[0], -1).T   # The "-1" makes reshape flatten the remaining dimensions
test_x_flatten = test_x_orig.reshape(test_x_orig.shape[0], -1).T

# Standardize data to have feature values between 0 and 1.
train_x = train_x_flatten/255.
test_x = test_x_flatten/255.

print ("train_x's shape: " + str(train_x.shape))
print ("test_x's shape: " + str(test_x.shape))
# Please note that the above code is from the programming assignment

import DeepNeuralNetwork
layers_dims = (12288, 20, 7, 5, 1)
# layers_dims = (12288, 10, 1)
# layers_dims = [12288, 20, 7, 5, 1] #  5-layer model
activations = ['relu', 'relu', 'relu','sigmoid']
num_iter = 2500
learning_rate = 0.0075

clf = DeepNeuralNetwork(layers_dims, activations)\
            .fit(train_x, train_y, num_iter, learning_rate, True, 100)
print('train accuracy: {:.2f}%'.format(clf.accuracy_score(train_x, train_y)*100))
print('test accuracy: {:.2f}%'.format(clf.accuracy_score(test_x, test_y)*100))

# output
# Cost after iteration 0: 0.771749
# Cost after iteration 100: 0.672053
# Cost after iteration 200: 0.648263
# Cost after iteration 300: 0.611507
# Cost after iteration 400: 0.567047
# Cost after iteration 500: 0.540138
# Cost after iteration 600: 0.527930
# Cost after iteration 700: 0.465477
# Cost after iteration 800: 0.369126
# Cost after iteration 900: 0.391747
# Cost after iteration 1000: 0.315187
# Cost after iteration 1100: 0.272700
# Cost after iteration 1200: 0.237419
# Cost after iteration 1300: 0.199601
# Cost after iteration 1400: 0.189263
# Cost after iteration 1500: 0.161189
# Cost after iteration 1600: 0.148214
# Cost after iteration 1700: 0.137775
# Cost after iteration 1800: 0.129740
# Cost after iteration 1900: 0.121225
# Cost after iteration 2000: 0.113821
# Cost after iteration 2100: 0.107839
# Cost after iteration 2200: 0.102855
# Cost after iteration 2300: 0.100897
# Cost after iteration 2400: 0.092878
# train accuracy: 98.56%
# test accuracy: 80.00%

```

相关链接: 
- [Andrew Ng - deeplearning.ai](https://www.deeplearning.ai/)
- [Coursera - Deep Learning Specialization](https://www.coursera.org/specializations/deep-learning)
- [Coursera - Neural Networks and Deep Learning](https://www.coursera.org/learn/neural-networks-deep-learning/home/welcome)
