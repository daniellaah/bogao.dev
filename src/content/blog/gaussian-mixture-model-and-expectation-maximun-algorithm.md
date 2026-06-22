---
pubDatetime: 2018-01-24
modDatetime: 2018-01-24
title: "高斯混合模型和EM算法"
slug: "gaussian-mixture-model-and-expectation-maximun-algorithm"
tags:
  - "Machine Learning"
  - "GMM"
  - "EM"
description: "高斯混合模型, 英文为Gaussian Mixture Model, 简称GMM, 是一种聚类算法. 它和K-means算法很像, 只不过GMM得到的结果是对概率密度的估计, 是一种软聚类. 那么究竟什么是高斯混合模型呢? 其实顾名思..."
---
![](http://7xrrje.com1.z0.glb.clouddn.com/luxury-silver-pen-with-a-business-diary-picjumbo-com.jpg)
本篇文章概览:
1. 什么是高斯混合模型
2. 什么是EM算法
2. 如何利用EM算法推导GMM
3. 使用Python实现GMM

- - - - -

## 一. 高斯混合模型(GMM)
高斯混合模型, 英文为Gaussian Mixture Model, 简称GMM, 是一种聚类算法. 它和K-means算法很像, 只不过GMM得到的结果是对概率密度的估计, 是一种软聚类. 那么究竟什么是高斯混合模型呢? 其实顾名思义, 其就假设数据是由多个服从高斯分布的数据混合而成的. 这里究竟有几个高斯分布不能确定, 就像K-means算法里的k值一样, 是一种超参数, 更多时候需要领域知识来决定. 模型中的每一个高斯分布被称为component, 即组分. 每一个组分的概率密度线性叠加就组成了GMM的概率密度函数:
![](http://7xrrje.com1.z0.glb.clouddn.com/gmm1.png)
根据上面的式子，如果我们要从 GMM 的分布中随机地取一个点的话，实际上可以分为两步：首先随机地在这 K 个 Component 之中选一个，每个 Component 被选中的概率实际上就是它的系数 $\pi_k$ ，选中了 Component 之后，再单独地考虑从这个 Component 的分布中选取一个点就可以了──这里已经回到了普通的 Gaussian 分布，转化为了已知的问题。<sup>[1]</sup>
给定一批数据, 我们想用GMM来对这批数据进行聚类. 具体如何做呢? 很简单, 我们只要通过这批数据来得到GMM的概率密度函数即可. 本质上就是通过数据来计算$\pi_k, \mu_k, \sigma_k$等参数.其中, 通过数据来推算概率密度被称作density estimation, 而估算参数被称作parameter estimation. 
如何估计这些参数? 这就回到我们熟悉的最大似然估计了. 根据概率密度函数, 很容易写出对应的log似然函数:
![](http://7xrrje.com1.z0.glb.clouddn.com/gmm2.png)
对于上式, 我们无法像普通的log似然函数那样通过求导来求出最大值. 具体地, 我们通过如下步骤来解决这个问题.
1. 估计当前模型下第i个观测数据来自第k个分模型的概率, 称为分模型k对观测数据$y_i$的响应度.
![](http://7xrrje.com1.z0.glb.clouddn.com/gmm3.png)
此时, 假设$\mu_k, \sigma_k$均已知(随机初始值).
2. 利用第一步的$\gamma_i$估计每个组分的参数$\mu_k, \sigma_k$. 直观理解, 可以将看作$x_i$这个值其中有$\gamma(i, k)x_i$这部分是由 组分$k$所生成的, 即组份$k$在生成数据$x_i$时所做的贡献.
![](http://7xrrje.com1.z0.glb.clouddn.com/gmm4.png?imageMogr/v2/thumbnail/!45p)
3. 不断迭代上面两步, 知道收敛为止.
上面这三步其实就是GMM的核心了, 至此我们应该可以轻松的实现GMM的代码了. 不过先不着急, 上面的步骤只是直观地展示了GMM求解的步骤, 那么这些步骤是怎么来的呢? 有没有严格的数学证明? 下面我们就来看看什么是EM算法.

## 二. EM算法
假定有训练集
![](http://7xrrje.com1.z0.glb.clouddn.com/screenshot_1421.png?imageMogr/v2/thumbnail/!45p)
包含m个独立样本，希望从中找到该组数据的模型p(x,z)的参数.
常规操作, 对数似然函数为:
![](http://7xrrje.com1.z0.glb.clouddn.com/screenshot_1422.png?imageMogr/v2/thumbnail/!45p)
z是隐随机变量，不方便直接找到参数估计。 策略:计算l(θ)下界，求该下界的最大值; 重复该过程，直到收敛到局部最大值。
![](http://7xrrje.com1.z0.glb.clouddn.com/screenshot_1423.png?imageMogr/v2/thumbnail/!45p)
令$Q_i$是$z$的某一个分布，$Q_i> 0$, 有:
![](http://7xrrje.com1.z0.glb.clouddn.com/screenshot_1425.png?imageMogr/v2/thumbnail/!45p)
其中最后一步利用了Jensen不等式. 当且仅当$\log(\frac{P}{Q})=c(\text{constant})$时, 等号成立, 即:
![](http://7xrrje.com1.z0.glb.clouddn.com/screenshot_1426.png?imageMogr/v2/thumbnail/!45p)
$$
\begin{aligned}
P(x^{(i)}, z^{(i)}; \theta)=cQ_i(z^{(i)}) \\
\sum_z P(x^{(i)}, z^{(i)}; \theta)=\sum_zcQ_i(z^{(i)}) \\
\sum_z P(x^{(i)}, z^{(i)}; \theta)=c \\
\frac{P(x^{(i)}, z^{(i)}; \theta)}{Q_i(z^{(i)})}=\sum_z P(x^{(i)}, z^{(i)}; \theta) \\
Q_i(z^{(i)})=\frac{P(x^{(i)}, z^{(i)}; \theta)}{\sum_z P(x^{(i)}, z^{(i)}; \theta)}=P(z^{(i)}|x^{(i)};\theta)
\end{aligned}
$$
这样我们就推出了$Q_i(z^{(i)})$, 解决了$Q_i(z^{(i)})$如何选择的问题, 这就是E步, 有了$Q_i(z^{(i)})$, 就有了$l$的下界. 在M步中, 我们极大化这个下界. 一般的EM算法的步骤如下：
![](http://7xrrje.com1.z0.glb.clouddn.com/screenshot_1427.png?imageMogr/v2/thumbnail/!45p)
这里值得注意的是, 当我们把似然函数看成是关于$Q$和$\theta$的函数时, 其实我们上面的迭代步骤就是关于$Q$和$\theta$的坐标上升.
接下来, 我们来利用EM算法推导GMM.
## 三. 利用EM算法推导GMM
随机变量$X$是有$K$个高斯分布混合而成，取各个高斯分布的概率为$\phi_1, \phi_2... \phi_K$，第$i$个高斯分布的均值为$\mu_i$，方差为$\Sigma_i$。若观测到随机变量$X$的一系列样本$x_1,x_2,...,x_n$试估计参数 $\phi, \mu, \Sigma$。
E-step:
![](http://7xrrje.com1.z0.glb.clouddn.com/screenshot_1428.png?imageMogr/v2/thumbnail/!45p)
M-step:
将多项分布和高斯分布的参数带入:
![](http://7xrrje.com1.z0.glb.clouddn.com/screenshot_1429.png?imageMogr/v2/thumbnail/!45p)
对$\mu_l$求偏导:
![](http://7xrrje.com1.z0.glb.clouddn.com/screenshot_1430.png?imageMogr/v2/thumbnail/!45p)
令上式=0:
![](http://7xrrje.com1.z0.glb.clouddn.com/screenshot_1431.png?imageMogr/v2/thumbnail/!45p)
同理对$\Sigma_j$求偏导并令结果为0可得:
![](http://7xrrje.com1.z0.glb.clouddn.com/screenshot_1432.png?imageMogr/v2/thumbnail/!45p)
上面就解决了高斯分布中的参数. 下面看多项分布中的参数.
考察M-step的目标函数，对于$\phi$，删除常数项:
![](http://7xrrje.com1.z0.glb.clouddn.com/screenshot_1433.png?imageMogr/v2/thumbnail/!45p)
得到:
![](http://7xrrje.com1.z0.glb.clouddn.com/screenshot_1434.png?imageMogr/v2/thumbnail/!45p)
由于多项分布的概率和为1，建立拉格朗日方程
![](http://7xrrje.com1.z0.glb.clouddn.com/screenshot_1435.png?imageMogr/v2/thumbnail/!45p)
对 $\phi$ 求偏导:
![](http://7xrrje.com1.z0.glb.clouddn.com/screenshot_1437.png?imageMogr/v2/thumbnail/!45p)
令上式等于0:
$$
\sum_{i=1}^mw_j^{(i)}+\beta\phi_j=0
$$
$$
\sum_{j=1}^k\sum_{i=1}^mw_j^{(i)}+\sum_{j=1}^k\beta\phi_j=0
$$
$$
\sum_{i=1}^m\sum_{j=1}^kw_j^{(i)}+\beta\sum_{j=1}^k\phi_j=0
$$
$$
m+\beta\sum_{j=1}^k\phi_j=0
$$
$$
\beta=-m
$$
带回式中可得:
![](http://7xrrje.com1.z0.glb.clouddn.com/screenshot_1438.png?imageMogr/v2/thumbnail/!45p)
这样, 我们通过EM算法一步步推导得到了第一节中的结论.
到这里, 我们就掌握了GMM和EM算法. 这里还需注意的是, EM算法是一种通用的算法, 常常用于解决含有因变量的参数估计问题. 它不仅可以用在这里的GMM, 在HMM和LDA(Latent Dirichlet Allocation)中, 我们还会看到EM的身影.
最后, 附上Python实现GMM的代码.

## 四. Python实现GMM
```python
import numpy as np
import matplotlib.pyplot as plt
from scipy.stats import multivariate_normal
from sklearn.utils import shuffle

class GMM():
    def __init__(self, n_components=2, max_iter=100):
        self.n_comp = 2
        self.max_iter = max_iter
        self.weights_ = []
        self.means_ = []
        self.covariances_ = []

    def fit(self, X):
        m, n = X.shape
        means = [np.random.standard_normal(n) for i in range(self.n_comp)]
        sigmas = [np.identity(n) for i in range(self.n_comp)]
        pis = [1/self.n_comp for i in range(self.n_comp)]
        # EM
        for i in range(self.max_iter):
            # E Step
            predict_gausses = [multivariate_normal(mean, sigma) for mean, sigma in zip(means, sigmas)]
            gauss_sum = 0
            for pi, predict_gauss in zip(pis, predict_gausses):
                gauss_sum += pi * predict_gauss.pdf(X)
            gammas = [pi * predict_gauss.pdf(X) / gauss_sum for pi, predict_gauss in zip(pis, predict_gausses)]

            # M Step
            means = [np.dot(gamma, X) / np.sum(gamma) for gamma in gammas]
            sigmas = [np.dot(gamma * (X - mean).T, X - mean) / np.sum(gamma) for gamma, mean in zip(gammas, means)]
            pis = [np.sum(gamma) / m for gamma in gammas]
        self.weights_ = pis
        self.covariances_ = sigmas
        self.means_ = means
        return self

if __name__ == '__main__':
    mean1, sigma1 = [0, 0], [[1, 0], [0, 1]]
    mean2, sigma2 = [2, 4], [[3, 0], [0, 1]]
    # mean1, sigma1 = [0, 0, 0], [[1, 0, 0], [0, 1, 0], [0, 0, 1]]
    # mean2, sigma2 = [2, 4, 1], [[3, 0, 0], [0, 1, 0], [0, 0, 2]]
    np.random.seed(8827)
    X1 = np.random.multivariate_normal(mean1, sigma1, 500)
    X2 = np.random.multivariate_normal(mean2, sigma2, 300)
    y = np.array([1]*500 + [0]*300)
    X = np.vstack([X1, X2])
    X, y = shuffle(X, y)
    gmm = GMM(n_components=2).fit(X)
    weight1, weight2 = gmm.weights_
    predict_mean1, predict_mean2 = gmm.means_
    predict_sigma1, predict_sigma2 = gmm.covariances_
    predict_gauss1 = multivariate_normal(predict_mean1, predict_sigma1)
    predict_gauss2 = multivariate_normal(predict_mean2, predict_sigma2)
    predict_y1 = predict_gauss1.pdf(X)
    predict_y2 = predict_gauss2.pdf(X)
    predict1 = (predict_y1 > predict_y2).astype(int)
    predict2 = (predict_y1 < predict_y2).astype(int)
    acc1, acc2 = np.mean(predict1 == y), np.mean(predict2 == y)
    print('accuracy: {}'.format(acc1 if acc1 > acc2 else acc2))
    fig = plt.figure(figsize=(12, 6))
    ax = fig.add_subplot(121)
    ax.set_title('True')
    ax.scatter(X[y==1, 0], X[y==1, 1], c='r', s=10)
    ax.scatter(X[y==0, 0], X[y==0, 1], c='b', s=10)
    ax = fig.add_subplot(122)
    ax.set_title('Predict')
    ax.scatter(X[predict1==1, 0], X[predict1==1, 1], c='r', s=10)
    ax.scatter(X[predict1==0, 0], X[predict1==0, 1], c='b', s=10)
    plt.show()

```
Output:
accuracy: 0.9825
![](http://7xrrje.com1.z0.glb.clouddn.com/gmm_output.png?imageMogr/v2/thumbnail/!45p)

参考文献:
1. [漫谈 Clustering (3): Gaussian Mixture Model - pluskid](http://blog.pluskid.org/?p=39)
2. [混合高斯模型（Mixtures of Gaussians）和EM算法 - JerryLead](http://www.cnblogs.com/jerrylead/archive/2011/04/06/2006924.html)
