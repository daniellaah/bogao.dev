---
pubDatetime: 2016-04-19
modDatetime: 2016-04-19
title: "Coursera机器学习笔记(四) - Octave教程"
slug: "machine-learning-andrew-ng-my-notes-week-2-octave-tutorial"
tags:
  - "Machine Learning"
  - "Notes"
  - "Coursera"
  - "MOOC"
  - "Octave"
description: "读取矩阵A第1行和第3行的所有元素："
---
![](http://7xrrje.com1.z0.glb.clouddn.com/screenshot_63.png)
- 课程地址：[Octave Tutorial](https://www.coursera.org/learn/machine-learning/lecture/9fHfl/basic-operations)
- 课程Wiki：[Octave Tutorial](https://share.coursera.org/wiki/index.php/ML:Octave_Tutorial)
- 课件：[PPT](https://d396qusza40orc.cloudfront.net/ml/docs/slides/Lecture5.pptx) [PDF](https://d396qusza40orc.cloudfront.net/ml/docs/slides/Lecture5.pdf)
- 参考：[Octave documentation pages](http://www.gnu.org/software/octave/doc/interpreter/)  [Introduction to Octave](http://www.dm.unibo.it/~lenci/teaching/14/maa/octavetut.pdf)

- - - - -
## 基本操作
## 四则运算 
```matlab
octave:1> 5+6
ans =  11
octave:2> 3-2
ans =  1
octave:3> 5*8
ans =  40
octave:4> 1/2
ans =  0.50000
```

## 逻辑运算
```matlab
octave:6> 1 == 2
ans = 0
octave:7> 1 ~= 2
ans =  1
octave:8> 1 && 0
ans = 0
octave:9> 1 || 0
ans =  1
octave:10> xor(1,0)
ans =  1
```
## 其他
更改提示符：
```matlab
octave:11> PS1('>> ')
>> 
```
添加分号可抑制输出：
```matlab
>> a = 1
a =  1
>> a = 1;
>> 
```
圆周率$\pi$：
```matlab
>> a = pi
a =  3.1416
```
常数$e$：
```matlab
>> e
ans =  2.7183
```
格式化输出：
```matlab
>> disp(sprintf('6 decimals: %0.6f', a))
6 decimals: 3.141593
>> disp(sprintf('6 decimals: %0.2f', a))
6 decimals: 3.14
>> format long 
>> a
a =  3.14159265358979
>> format short
>> a
a =  3.1416
```

## 矩阵
构造一个矩阵，方式一：
```matlab
>> A = [1 2; 3 4; 5 6;]
A =

   1   2
   3   4
   5   6
```

构造一个矩阵，方式二：
```matlab
>> A = [1 2;
> 3 4;
> 5 6;
> ]
A =

   1   2
   3   4
   5   6
```

构造一个横向量：
```matlab
>> v = [1 2 3]
v =

   1   2   3
```

构造一个列向量：
```matlab
>> v = [1; 2; 3]
v =

   1
   2
   3
```
从1到2，每次递增0.1
```matlab
>> v = 1:0.1:2
v =

 Columns 1 through 5:

    1.0000    1.1000    1.2000    1.3000    1.4000

 Columns 6 through 10:

    1.5000    1.6000    1.7000    1.8000    1.9000

 Column 11:

    2.0000
```

从1到6，每次递增1(默认)：
```matlab
>> v = 1:6
v =

   1   2   3   4   5   6
```
   
所有元素均为1：
```matlab
>> ones(2, 3)
ans =

   1   1   1
   1   1   1
```
   
每个元素乘以2：
```matlab
>> C = 2*ones(2, 3)
C =

   2   2   2
   2   2   2
```

高斯随机数：
```matlab
>> rand(3, 3)
ans =

   0.751588   0.906707   0.081204
   0.411613   0.457779   0.882052
   0.622524   0.774499   0.811092
```

所有元素均为0：
```matlab
>> w = zeros(1, 3)
w =

   0   0   0
```

单位阵：
```matlab
>> I = eye(5)
I =

Diagonal Matrix

   1   0   0   0   0
   0   1   0   0   0
   0   0   1   0   0
   0   0   0   1   0
   0   0   0   0   1
   

A =

   1   2
   3   4
   5   6
```

读取矩阵A第三行第二列的元素：
```matlab
>> A(3, 2)
ans =  6
```

读取矩阵A第2列所有元素：
```matlab
>> A(:,2)
ans =

   2
   4
   6
```

读取矩阵A第2行所有元素：
```matlab
>> A(2,:)
ans =

   3   4
```

读取矩阵A第1行和第3行的所有元素：
```matlab
>> A([1 3],:)
ans =

   1   2
   5   6
```

将A第二列替换为[10;11;12]：
```matlab
>> A(:,2) = [10; 11; 12]
A =

    1   10
    3   11
    5   12
```

在A的最后加上一列：
```matlab
>> A = [A, [100; 101; 102]]
A =

     1    10   100
     3    11   101
     5    12   102
```

 将A所有的元素合并成一个列向量 
```matlab
>> A(:)
ans =

     1
     3
     5
    10
    11
    12
   100
   101
   102
```

两个矩阵的合并（列合并）
```matlab
>> A = [1 2; 3 4; 5 6]
A =

   1   2
   3   4
   5   6

>> B = [7 8; 9 10; 11 12]
B =

    7    8
    9   10
   11   12

>> C = [A B]
C =

    1    2    7    8
    3    4    9   10
    5    6   11   12
 ```

两个矩阵的合并（行合并）
```matlab
>> D = [A;B]
D =

    1    2
    3    4
    5    6
    7    8
    9   10
   11   12    
```

查看帮助：
```matlab
>> help eye
```
![](http://7xrrje.com1.z0.glb.clouddn.com/screenshot_598.png?imageMogr/v2/thumbnail/!45p)
构造10000个随机数，并绘制出图形(高斯分布)：
```matlab
>> w=randn(1,10000);
>> hist(w,50)
```
![高斯分布](http://7xrrje.com1.z0.glb.clouddn.com/GaussianDistribution.png) 

## 数据的读取与存储
本节所用到的数据: [featuresX.dat](https://raw.githubusercontent.com/tansaku/py-coursera/master/featuresX.dat), [priceY.dat](https://raw.githubusercontent.com/tansaku/py-coursera/master/priceY.dat)
## 读取数据
```matlab
% 找到文件所在目录：
>> cd Desktop/
>> cd 'Machine Learning/'
>> ls
featuresX.dat	priceY.dat
```
数据如下所示：
![](http://7xrrje.com1.z0.glb.clouddn.com/screenshot_599.png?imageMogr/v2/thumbnail/!45p)
读取数据：
```matlab
% 方式一：
>> load featuresX.dat
>> load priceY.dat
```

```matlab
% 方式二：
>> load('featuresX.dat')
>> load('priceY.dat') 
```

使用who命令显示当前所有变量：
```matlab
>> who
Variables in the current scope:

A          a          featuresX  v          y
C          ans        priceY     w
I          c          sz         x
```

可以看到，刚才导入的数据已经在变量`featuresX`和`priceY`中了。
展示数据：
```matlab
>> featuresX
featuresX =

   2104      3
   1600      3
   2400      3
   1416      2
   3000      4
   1985      4
   1534      3
    ...        ..

>> size(featuresX)
ans =

   27    2

>> priceY
priceY =

   3999
   3299
   3690
   2320
   5399
   2999
    ...
    
>> size(priceY)
ans =

   27    1
```

使用whos查看变量更详细的信息：
![](http://7xrrje.com1.z0.glb.clouddn.com/screenshot_600.png?imageMogr/v2/thumbnail/!45p)
使用如下命令用来删除某个变量：
```matlab
>> clear featuresX
>> whos
```
这个时候再使用`whos`查看，发现featuresX已经不见了。
![](http://7xrrje.com1.z0.glb.clouddn.com/screenshot_601.png?imageMogr/v2/thumbnail/!45p)
## 存储数据
假设我们现在需要取出`priceY`前十个数据，使用如下命令：
```matlab
>> v = priceY(1:10)
v =

   3999
   3299
   3690
   2320
   5399
   2999
   3149
   1989
   2120
   2425
```
该如何存储这十个数据呢？使用`save`命令：
```matlab
>> save hello.mat v
>> ls
featuresX.dat	hello.mat	priceY.dat
```
清空所有变量：
```matlab
>> clear
>> whos
>> %无任何输出
```
刚才存储数据是以二进制的形式进行存储，我们也可以使用人能够读懂的形式存储。例如：
```matlab
>> load hello.mat
>> whos
Variables in the current scope:

   Attr Name        Size                     Bytes  Class
   ==== ====        ====                     =====  ===== 
        v          10x1                         80  double

Total is 10 elements using 80 bytes

>> v
v =

   3999
   3299
   3690
   2320
   5399
   2999
   3149
   1989
   2120
   2425

>> save hello.txt v -ascii
>> ls
featuresX.dat	hello.mat	hello.txt	priceY.dat
```

## 数据的计算
```matlab
% 各种矩阵运算
>> A * B
>> A .* B
>> A .^ 2
>> 1 ./ A
>> log(A)
>> exp(A)
>> -A
```

A中的每个元素都加上1：
```matlab
>> A + ones(size(A))
```
这样也可以：
```matlab
>> A + 1
```

矩阵转置：
```matlab
>> A'
```

向量中的最大值：
```matlab
>> A = [1 3 0.5 10 100]
A =

     1.00000     3.00000     0.50000    10.00000   100.00000

>> [val ind] = max(A)
val =  100
ind =  5
```

比较大小：
```matlab
>> A = [1 2; 3 4; 5 6]
A =

   1   2
   3   4
   5   6

>> A > 3
ans =

   0   0
   0   1
   1   1
```

找出向量中特定元素：
```matlab
>> find(A > 3)
ans =

   3
   5
   6
```

找出矩阵中特定元素：
```matlab
>> [r c] = find(A >= 3)
r =

   2
   3
   2
   3

c =

   1
   1
   2
   2
```

生成任意行、列、对角线和相等的矩阵：
```matlab
>> magic(3)
ans =

   8   1   6
   3   5   7
   4   9   2
```

向量所有元素的和：
```matlab
>> a = [1.2 2.3 4.5 6.6]
a =

   1.2000   2.3000   4.5000   6.6000

>> sum(a)
ans =  14.600
```

向上及向下取整：
```matlab
>> floor(a)
ans =

   1   2   4   6

>> ceil(a)
ans =

   2   3   5   7
```

构造一个由A,B两个矩阵中对应位置较大的数组成的矩阵：
```matlab
A =

   1   2
   3   4
   5   6

>> B = [3 1; 4 6; 2 9]
B =

   3   1
   4   6
   2   9

>> max(A, B)
ans =

   3   2
   4   6
   5   9

A =

   1   2
   3   4
   5   6
```

取出矩阵每列最大的元素：
```matlab
>> max(A, [], 1)
ans =

   5   6
```

取出矩阵每行最大的元素：
```matlab
>> max(A, [], 2)
ans =

   2
   4
   6
```

想要直接获得矩阵中最大的元素，以下两种方式都可以：
```matlab
% 方式一：
>> max(max(A))
ans =  6
% 方式二：
>> max(A(:))
ans =  6
```

矩阵的上下翻转：
```matlab
>> eye(3)
ans =

Diagonal Matrix

   1   0   0
   0   1   0
   0   0   1

>> flipud(eye(3))
ans =

Permutation Matrix

   0   0   1
   0   1   0
   1   0   0
```

矩阵的逆：
```matlab
>> A = rand(3, 3)
A =

   0.68934   0.12881   0.80507
   0.49777   0.41907   0.37271
   0.32607   0.27877   0.41814

>> tmp = pinv(A)
tmp =

   1.795801   4.294380  -7.285421
  -2.180466   0.647802   3.620828
   0.053345  -3.780710   5.658801

>> tmp * A
ans =

   1.00000   0.00000   0.00000
   0.00000   1.00000   0.00000
  -0.00000  -0.00000   1.00000
```

## 绘制数据
绘制出sin函数图像：
```matlab
x = [0: 0.01: 0.98];
>> y = sin(2*pi*4*x);
>> plot(x,y);
```
![](http://7xrrje.com1.z0.glb.clouddn.com/screenshot_602.png?imageMogr/v2/thumbnail/!55p)
绘制出cos函数图像
```matlab
y2 = cos(2*pi*4*x);
```
![](http://7xrrje.com1.z0.glb.clouddn.com/screenshot_603.png?imageMogr/v2/thumbnail/!55p)
将两个函数绘制在一起：
```matlab
>> plot(x,y);
>> hold on;
>> plot(x,y2,'r')
```
![](http://7xrrje.com1.z0.glb.clouddn.com/screenshot_604.png?imageMogr/v2/thumbnail/!55p)

添加说明：
```matlab
>> xlabel("time");
>> ylabel("value");
>> lengend("sin", "cos");
error: 'lengend' undefined near line 1 column 1
>> legend("sin", "cos");
```
![](http://7xrrje.com1.z0.glb.clouddn.com/screenshot_605.png?imageMogr/v2/thumbnail/!55p)

存储图像：
```matlab
>> print -dpng "myPlot.png"
```
![](http://7xrrje.com1.z0.glb.clouddn.com/screenshot_606.png?imageMogr/v2/thumbnail/!55p)

关掉绘制的图像：
```matlab
>> close
```

分别在两个窗口显示两个图像：
```matlab
>> figure(1); plot(x, y);
>> figure(2); plot(x, y2);
```

在同一窗口不同位置显示两个图像：
```matlab
>> subplot(1,2,1);plot(x, y);
>> subplot(1,2,2);plot(x, y2);
```
![](http://7xrrje.com1.z0.glb.clouddn.com/screenshot_607.png?imageMogr/v2/thumbnail/!55p)

改变左边图像的横坐标的刻度：
```matlab
>> subplot(1,2,1)
>> axis([0 0.5 -1 1])
```
![](http://7xrrje.com1.z0.glb.clouddn.com/screenshot_608.png?imageMogr/v2/thumbnail/!55p)

清除所有绘制的图像：
```matlab
>> clf
```

将矩阵可视化：
```matlab
>> imagesc(magic(15))
```
![](http://7xrrje.com1.z0.glb.clouddn.com/screenshot_609.png?imageMogr/v2/thumbnail/!55p)

```matlab
>> imagesc(A), colorbar, colormap gray
```
![](http://7xrrje.com1.z0.glb.clouddn.com/screenshot_610.png?imageMogr/v2/thumbnail/!55p)

## 控制语句

for循环：
```matlab
>> for i=1:10,
>      v(i) = i^2;
>  end;
>> v
v =

     1     4     9    16    25    36    49    64    81   100
```

while循环：
```matlab
>> i = 1;
>> while i <= 10,
>      v(i) = sqrt(v(i));
> 
Display all 1753 possibilities? (y or n)
>      i = i + 1;
>  end;
>> v
v =

    1    2    3    4    5    6    7    8    9   10
```
定义一个函数：
![](http://7xrrje.com1.z0.glb.clouddn.com/screenshot_611.png?imageMogr/v2/thumbnail/!55p)
```matlab
>> ls
featuresX.dat		myPlot.png		squareThisNumber.m
hello.mat		octave-workspace
hello.txt		priceY.dat
>> squareThisNumber(3)
ans =  9
```
如果该定义的函数不在当前目录下，我们就不能使用它：
```matlab
>> cd ~
>> pwd
ans = /Users/bobo
>> squareThisNumber(3)
error: 'squareThisNumber' undefined near line 1 column 1
```
不过我们也可以更改Octave的搜索路径：
```matlab
>> addpath("~/Desktop/Machine-Learning")
```
更改之后，我们现在虽然在`/User/bobo`目录下，但是仍然可以使用squareThisNumber函数。
```matlab
>> pwd
ans = /Users/bobo
>> squareThisNumber(5)
ans =  25
```
返回两个值的函数：
![](http://7xrrje.com1.z0.glb.clouddn.com/screenshot_612.png?imageMogr/v2/thumbnail/!55p)
```matlab
>> [y1, y2] = squareAndCube(3)
y1 =  9
y2 =  27
```

代价函数：
![](http://7xrrje.com1.z0.glb.clouddn.com/screenshot_613.png?imageMogr/v2/thumbnail/!55p)
```matlab
>> X = [1 1; 1 2; 1 3]
X =

   1   1
   1   2
   1   3

>> y = [1; 2; 3]
y =

   1
   2
   3

>> theta = [0; 1]
theta =

   0
   1

>> costFunctionJ(X, y, theta)
ans = 0
```

如果$\theta=[0; 0]$
```matlab
>> theta = [0; 0]
theta =

   0
   0

>> costFunctionJ(X, y, theta)
ans =  2.3333
```

## 向量化
[Vectorization](https://www.coursera.org/learn/machine-learning/lecture/WnQWH/vectorization)
