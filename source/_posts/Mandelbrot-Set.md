---
title: Mandelbrot_Set
date: 2024-01-10 16:12:35
tags: 'homework'
---

# 曼德布罗集 Mandelbrot Set

## 程序基本情况和目标
1. 曼德布罗集（Mandelbrot Set）是一个集合，定义如下：
$$ M = \{C|Z_{n+1}=Z_n^2+C,Z_0=0,Z_n,C\in\mathbb{C}\}$$
公式解释：对一个特定的复数 $C$ ，初始 $ Z_0=0 $ ，经过 $ Z_{n+1}=Z_n^2+C $ 连续迭代后，如果 $ Z_n $ 数列收敛于 $ 0 $ 附近（不是发散到无穷远），则 $ C $ 属于曼德布罗集。 
2. 一般可以认为，曼德布罗集中复数C的实部在 $-2.25$ 至 $0.75$ 之间，虚部在 $-1.25 $ 至 $1.25$ 之间，在进行迭代计算中，如果 $Z_n$ 和原点 $0 $ 的距离超过 $3$，认为 $Z_n$ 趋向发散，如果连续经过 $256$ 次迭代，距离仍不超过 $ 3 $，则认为 $ Z_n $ 趋向收敛（即 $C $ 属于曼德布罗集）。
3. 由于复数可以对应到坐标平面上的点，因此曼德布罗集可以直观地使用图形来展示，目标是可视化曼德布罗集。

## 主要功能模块
### 迭代和迭代次数计算
功能：输入点坐标，计算迭代次数。作业要求中已有几乎完整的迭代次数计算函数，但有一定错误和优化空间，需要阅读理解后进行更正和优化。
### RGB映射
功能：在Mand06作业中，要求支持256+种颜色且低值域敏感。考虑制作一个通解的RGB非对称映射函数。
### 图像文件生成
功能：如题。作业要求中已有几乎完整的图像文件生成函数，但具体的像素点RGB设置依然需要根据不同的作业要求完成。
### 输入
功能：
本作业有以下几个可能的输入：
Mand05:
>输入1：640 480 z                 （输入分辨率，坐标使用默认）\
输入2：1024 768 -1.3 -0.1 0.5   （输入分辨率和坐标值） \
输入3：z                         （所有输入使用默认数据）

Mand06:
>输入1：640 480 [t]                 （t>=0且t<=4，输入分辨率，坐标为t号数据）\
输入2：640 480 [t] z                 （输入分辨率，坐标使用默认）\
输入3：1024 768 [t] -1.3 -0.1 0.5   （输入分辨率和坐标值） \
输入4：z                         （所有输入使用默认数据）

因此，在可能是 z 的位置，我们需要考虑两种情况：z 或数据，考虑参考快读模板自行书写输入函数。

## 关键代码说明
### 迭代和迭代次数计算
利用复数公式从 $z_n,z_{n+1}$ 迭代计算 $z_{n+2}$，根据 $|z_n|$ 计算是否收敛或迭代次数。
```cpp
int chkIteration(struct my_complex c, int n)
{ // 给定c，最多迭代n次，返回收敛或发散情况
    struct my_complex z1, z0 = {0, 0};
    double d;
    int i;
    for (i = 0; i < n; i++)
    { // 每次迭代从z0计算得到z1，复数公式：z1=z0*z0+c
        z1.real = z0.real * z0.real - z0.imag * z0.imag + c.real;
        z1.imag = 2 * z0.real * z0.imag + c.imag;
        // printf("(%lg,%lg) ", z1.real, z1.imag);    // 中间结果，%lg格式符
        d = z1.real * z1.real + z1.imag * z1.imag; // 计算z1与原点(0,0)的距离，(实部的平方+虚部的平方)再开根
        if (d > 3 * 3)                             // 如果距离超过3，可以认为迭代结果为发散
            return i + 1;                          // 返回迭代次数
        z0 = z1;                                   // 计算得到的z1作为下次迭代的z0
    }
    return -1; // 返回-1表示收敛
}
```
### RGB映射
[参考文献](https://blog.csdn.net/ZxqSoftWare/article/details/115519489)
通过此文方法，将RGB三维向量对称映射到线性空间中，通过先划分区间再分别变换的方法完成了映射。
```python
# 原程序
_max = 0
_min = 256
_range = _max - _min + 1
# 将_data映射到不同的色彩区间中
def convert_data(_data):
    if _data < _min:
        return [0, 0, 0]
    r = (_data - _min) / _range
    step = int(_range / 5)
    idx = int(r * 5)
    h = (idx + 1) * step + _min
    m = idx * step + _min
    local_r = (_data - m) / (h - m)
    if _data < _min:
        return [0, 0, 0]
    if _data > _max:
        return [255, 255, 255]
    if idx == 0:
        return [0, int(local_r * 255), 255]
    if idx == 1:
        return [0, 255, int((1 - local_r) * 255)]
    if idx == 2:
        return [int(local_r * 255), 255, 0]
    if idx == 3:
        return [255, int((1 - local_r) * 255), 0]
    if idx == 4:
        return [255, 0, int(local_r * 255)]
```
该程序的c语言实现:
```cpp
void map(int it, int *r, int *g, int *b)
{
    int min = 0, max = 256;
    double tmp, step, m, localr;
    it = pow(max - it, 3);
    max = pow(max, 3);
    int range = max - min + 1, idx;
    if (it < min)
    {
        *r = 0, *g = 0, *b = 0;
        return;
    }
    if (it > max)
    {
        *r = 255, *g = 255, *b = 255;
        return;
    }
    tmp = (double)(it - min) / range;
    step = range / 5;
    idx = tmp * 5;
    m = (idx * step + min);
    localr = (it - m) / ((idx + 1) * step + min - m);
    switch (idx)
    {
    case 0:
        *r = 0, *g = localr * 255, *b = 255;
        break;
    case 1:
        *r = 0, *g = 255, *b = localr * 255;
        break;
    case 2:
        *r = localr * 255, *g = 255, *b = 0;
        break;
    case 3:
        *r = 255, *g = localr * 255, *b = 0;
        break;
    case 4:
        *r = 0, *g = 255, *b = localr * 255;
        break;
    default:
        break;
    }
}
```
由题意，我们应当重点关注低值域的变化，考虑非对称映射。\
重点修改部分在 $idx$ 和 $localr$ 计算，通过改变区间大小影响了各个值域的权重。\
经过大量测试和修改才达成了以下程序，过程可具体查看附录中RGB映射函数的过程性源代码。\
这是一个鲁棒性很强的实现，我们只需要更改本函数的 $max,min$ 就可以极其方便地套用于其他有类似需求的程序。此外，在本程序中，也可以通过同步更改迭代函数中的最高迭代次数或在本函数中多传一个参数 $max$ （最高迭代次数）以使得图像更加精确，色彩丰富。
```cpp
void map(int it, int *r, int *g, int *b)
{
    int min = 0, max = 256;
    double tmp, step, m, localr;
    int range = max - min + 1, idx;
    if (it < min)
    {
        *r = 0, *g = 0, *b = 0;
        return;
    }
    if (it > max)
    {
        *r = 255, *g = 255, *b = 255;
        return;
    }
    tmp = (double)(it - min) / range;
    if (tmp > 0.2)
        idx = 4, localr = (it - min - range * 0.2) / (range * 0.8);
    else if (tmp > 0.1)
        idx = 3, localr = (range * 0.1 - (it - min - range * 0.1)) / (range * 0.1);
    else if (tmp > 0.05)
        idx = 2, localr = (it - min - range * 0.05) / (range * 0.05);
    else if (tmp > 0.02)
        idx = 1, localr = (range * 0.03 - (it - min - range * 0.02)) / (range * 0.03);
    else
        idx = 0, localr = (it - min) / (range * 0.02);
    switch (idx)
    {
    case 0:
        *r = 0, *g = localr * 255, *b = 255;
        break;
    case 1:
        *r = 0, *g = 255, *b = localr * 255;
        break;
    case 2:
        *r = localr * 255, *g = 255, *b = 0;
        break;
    case 3:
        *r = 255, *g = localr * 255, *b = 0;
        break;
    case 4:
        *r = 0, *g = 255, *b = localr * 255;
        break;
    default:
        break;
    }
}
```
### 图像文件生成
为保证图像比例合理，根据 $x_1,y_1,y_2$ 直接计算 $x_2$。遍历图片所有像素点位置 $(i,j)$ ，计算出它们对应的向量 $C_{i,j}$ 代入上文迭代函数计算，得出迭代次数后使用RGB映射函数计算出对应颜色，最后调用绘点函数设置颜色。
```cpp
// 生成图像文件fn，w列h行，坐标左界x1，右界x2，下界y1，上界y2
void drawPicture(char *fn, int w, int h, double x1, double y1, double y2)
{
    int cnt = 0;
    int i, j;
    double x, y, rxy = (y2 - y1) / h, x2 = x1 + w * rxy;
    bmpInitial(w, h);       // 调用资源函数，初始化图像宽度和高度信息
    for (i = 0; i < h; i++) // 逐行循环，图像下边对应0行
    {
        y = y1 + i * (y2 - y1) / h; // 计算第i行对应的y坐标
        for (j = 0; j < w; j++)     // 逐列循环，图像左边对应0列
        {
            x = x1 + j * (x2 - x1) / w; // 计算第j列对应的x坐标
            my_complex cpx = {x, y};
            int r, g, b;
            int it = chkIteration(cpx, 256);
            map(it, &r, &g, &b);
            bmpSetPixel(i, j, r, g, b);
        }
    }
    bmpWriteToFile(fn); // 调用资源函数，生成图像文件
    if (1 <= t && t <= 4)
        printf("fn=Mand06_%d.BMP, w=%d, h=%d\nx1=%lg, x2=%lg, y1=%lg, y2=%lg, rxy=%lg\n", t, w, h, x1, x2, y1, y2, rxy);
    else
        printf("fn=Mand06.BMP, w=%d, h=%d\nx1=%lg, x2=%lg, y1=%lg, y2=%lg, rxy=%lg\n", w, h, x1, x2, y1, y2, rxy);
}
```
### 输入
这是我见过最奇葩的输入要求，放个快读模板压压惊。
```cpp
//快读模板
char *p1,*p2,buf[100000];
#define nc() (p1==p2 && (p2=(p1=buf)+fread(buf,1,100000,stdin),p1==p2)?EOF:*p1++)
int read()
{
    int x=0,f=1;
    char ch=nc();
    while(ch<48||ch>57)
    {
        if(ch=='-')
            f=-1;
        ch=nc();
    }
    while(ch>=48&&ch<=57)
        x=x*10+ch-48,ch=nc();
   	return x*f;
}
```
我分别设计了 $randci$ 和 $randcf$ 两个函数来输入 $int$ 和 $double$ 类型参数，判断是否使用默认数据在 $read$ 函数种完成。
```cpp
//for Mand05
int randci(char s[], int i)//读取整型
{
    int ret;
    while (i == -1 || s[i] != ' ')
        scanf("%c", &s[++i]);
    ret = atoi(s);
    for (i = 0; i < 100; ++i)
        s[i] = '\0';
    return ret;
}

double randcf(char s[], int i)//读取浮点
{
    double ret;
    while (i == -1 || s[i] != ' ' && s[i] != '\n')
        scanf("%c", &s[++i]);
    ret = atof(s);
    for (i = 0; i < 100; ++i)
        s[i] = '\0';
    return ret;
}

void read(int *w, int *h, double *x1, double *y1, double *y2)
{
    //先行预设
    char s[100];
    *w = 160, *h = 120;
    *x1 = -2.25, *y1 = -1.25, *y2 = 1.25;
    
    scanf("%c", s);
    if (s[0] == 'z')
        return;
    *w = randci(s, 0);
    *h = randci(s, -1);

    scanf("%c", s);
    if (s[0] == 'z')
        return;
    *x1 = randcf(s, 0);
    *y1 = randcf(s, -1);
    *y2 = randcf(s, -1);
}
```
利用二维数组简便后续赋值。
```cpp
//for Mand06
int randci(char s[], int i)
{
    int ret;
    while (i == -1 || s[i] != ' ')
        scanf("%c", &s[++i]);
    ret = atoi(s);
    for (i = 0; i < 100; ++i)
        s[i] = '\0';
    return ret;
}

double randcf(char s[], int i)
{
    double ret;
    while (i == -1 || s[i] != ' ' && s[i] != '\n')
        scanf("%c", &s[++i]);
    ret = atof(s);
    for (i = 0; i < 100; ++i)
        s[i] = '\0';
    return ret;
}

void read(int *w, int *h, double *x1, double *y1, double *y2)
{
    char s[100];
    double nums[4][3] = {
        {-2, -2, 1},
        {-2.25, -1.5, 0.5},
        {0, 0, 1},
        {0, 0, 0.5}};
    int t;
    *w = 160, *h = 120;
    *x1 = -2.25, *y1 = -1.25, *y2 = 1.25;

    scanf("%c", s);
    if (s[0] == 'z')
        return;
    *w = randci(s, 0);
    *h = randci(s, -1);

    scanf("%c", s);
    if (s[0] == 'z')
        return;
    t = randci(s, 0);
    if (t >= 1 && t <= 4)
    {
        *x1 = nums[t - 1][0];
        *y1 = nums[t - 1][1];
        *y2 = nums[t - 1][2];
        return;
    }
    *x1 = randcf(s, -1);
    *y1 = randcf(s, -1);
    *y2 = randcf(s, -1);
}
```

## 运行结果截图


## 附录：程序设计源代码
### 主程序
```cpp
//Mand01.cpp
#include <stdio.h>

int main()
{
    printf("(1)发散\n");
    printf("(2)5.0\n");
    printf("(3)A\n");
    printf("(4)%d\n", 160 * 120);
    printf("(5)蓝色\n");
    return 0;
}
```

```cpp
//Mand02.cpp
#define _CRT_SECURE_NO_WARNINGS
#include <stdio.h>
#include <math.h>
struct my_complex
{                // 定义复数结构体
    double real; // 实部
    double imag; // 虚部
};

int chkIteration(struct my_complex c, int n)
{ // 给定c，最多迭代n次，返回收敛或发散情况
    struct my_complex z1, z0 = {0, 0};
    double d;
    int i;
    for (i = 0; i < n; i++)
    { // 每次迭代从z0计算得到z1，复数公式：z1=z0*z0+c
        z1.real = z0.real * z0.real - z0.imag * z0.imag + c.real;
        z1.imag = 2 * z0.real * z0.imag + c.imag;
        printf("(%lg,%lg) ", z1.real, z1.imag);          // 中间结果，%lg格式符
        d = sqrt(z1.real * z1.real + z1.imag * z1.imag); // 计算z1与原点(0,0)的距离，(实部的平方+虚部的平方)再开根
        if (d > 3)                                       // 如果距离超过3，可以认为迭代结果为发散
            return i + 1;                                // 返回迭代次数
        z0 = z1;                                         // 计算得到的z1作为下次迭代的z0
    }
    return -1; // 返回-1表示收敛
}

int main(void)
{
    struct my_complex c;
    int k;
    scanf("%lf%lf", &c.real, &c.imag);
    k = chkIteration(c, 5); // 为简化测试，暂时限制最大迭代5次
    printf("k=%d\n", k);
    return 0;
}
// 输入：0 0，输出：(0,0) (0,0) (0,0) (0,0) (0,0) k=-1
// 输入：2 -1，输出：(2,-1) (5,-5) k=2
// 输入：1 0.5，输出：(1,0.5) (1.75,1.5) (1.8125,5.75) k=3
```
```cpp
//Mand03.cpp
#include "mybmp.h" //包含图像生成资源库
#include <math.h>
// 生成图像文件fn，w列h行，坐标左界x1，右界x2，下界y1，上界y2
void drawPicture(char *fn, int w, int h, double x1, double x2, double y1, double y2)
{
    double i, j, x, y;
    bmpInitial(w, h);       // 调用资源函数，初始化图像宽度和高度信息
    for (i = 0; i < h; i++) // 逐行循环，图像下边对应0行
    {
        y = y1 + i * (y2 - y1) / h; // 计算第i行对应的y坐标
        for (j = 0; j < w; j++)     // 逐列循环，图像左边对应0列
        {
            x = x1 + j * (x2 - x1) / w; // 计算第j列对应的x坐标
            double dis = (x - 1.5) * (x - 1.5) + (y - 1) * (y - 1);
            if (dis >= 2.0 * 2.0)
                bmpSetPixel(i, j, 0, 255, 255); // 青色
            else if (dis >= 1.5 * 1.5)
                bmpSetPixel(i, j, 0, 0, 255); // 蓝色
            else if (dis >= 0.8 * 0.8)
                bmpSetPixel(i, j, 0, 255, 0); // 绿色
            else
                bmpSetPixel(i, j, 255, 0, 0); // 红色
        }
    }
    bmpWriteToFile(fn); // 调用资源函数，生成图像文件
}
int main(void)
{
    int w = 160, h = 120;
    double x1 = -2.5, y1 = -2.5, x2 = 5.5, y2 = 3.5;
    scanf("%d%d", &w, &h);
    drawPicture("Mand03.BMP", w, h, x1, x2, y1, y2);
    printf("fn=Mand03.BMP, w=%d, h=%d x1=-2.5, x2=5.5, y1=-2.5, y2=3.5", w, h);
    return 0;
}
```

```cpp
//Mand04
#include "mybmp.h" //包含图像生成资源库
#include <math.h>

struct my_complex
{                // 定义复数结构体
    double real; // 实部
    double imag; // 虚部
};
typedef struct my_complex my_complex;
int chkIteration(struct my_complex c, int n)
{ // 给定c，最多迭代n次，返回收敛或发散情况
    struct my_complex z1, z0 = {0, 0};
    double d;
    int i;
    for (i = 0; i < n; i++)
    { // 每次迭代从z0计算得到z1，复数公式：z1=z0*z0+c
        z1.real = z0.real * z0.real - z0.imag * z0.imag + c.real;
        z1.imag = 2 * z0.real * z0.imag + c.imag;
        // printf("(%lg,%lg) ", z1.real, z1.imag);    // 中间结果，%lg格式符
        d = z1.real * z1.real + z1.imag * z1.imag; // 计算z1与原点(0,0)的距离，(实部的平方+虚部的平方)再开根
        if (d > 3 * 3)                             // 如果距离超过3，可以认为迭代结果为发散
            return i + 1;                          // 返回迭代次数
        z0 = z1;                                   // 计算得到的z1作为下次迭代的z0
    }
    return -1; // 返回-1表示收敛
}

// 生成图像文件fn，w列h行，坐标左界x1，右界x2，下界y1，上界y2
void drawPicture(char *fn, int w, int h, double x1, double y1, double y2)
{
    int cnt = 0;
    int i, j;
    double x, y, rxy = (y2 - y1) / h, x2 = x1 + w * rxy;
    bmpInitial(w, h);       // 调用资源函数，初始化图像宽度和高度信息
    for (i = 0; i < h; i++) // 逐行循环，图像下边对应0行
    {
        y = y1 + i * (y2 - y1) / h; // 计算第i行对应的y坐标
        for (j = 0; j < w; j++)     // 逐列循环，图像左边对应0列
        {
            x = x1 + j * (x2 - x1) / w; // 计算第j列对应的x坐标
            my_complex cpx = {x, y};
            if (chkIteration(cpx, 256) == -1)
                bmpSetPixel(i, j, 0, 0, 0), cnt++;
            else
                bmpSetPixel(i, j, 255, 255, 255);
        }
    }
    bmpWriteToFile(fn); // 调用资源函数，生成图像文件
    printf("fn=Mand04.BMP, w=%d, h=%d\nx1=%lg, x2=%lg, y1=%lg, y2=%lg, rxy=%lg\ncnt=%d:%lg%%", w, h, x1, x2, y1, y2, rxy, cnt, (double)cnt / (w * h) * 100);
}
int main(void)
{
    int w = 160, h = 120;
    double x1 = -2.25, y1 = -1.25, y2 = 1.25;
    scanf("%d %d", &w, &h);
    drawPicture("Mand04.BMP", w, h, x1, y1, y2);
    return 0;
}
```
```cpp
//Mand05.cpp
#include "mybmp.h" //包含图像生成资源库
#include <math.h>

struct my_complex
{                // 定义复数结构体
    double real; // 实部
    double imag; // 虚部
};
typedef struct my_complex my_complex;
int chkIteration(struct my_complex c, int n)
{ // 给定c，最多迭代n次，返回收敛或发散情况
    struct my_complex z1, z0 = {0, 0};
    double d;
    int i;
    for (i = 0; i < n; i++)
    { // 每次迭代从z0计算得到z1，复数公式：z1=z0*z0+c
        z1.real = z0.real * z0.real - z0.imag * z0.imag + c.real;
        z1.imag = 2 * z0.real * z0.imag + c.imag;
        // printf("(%lg,%lg) ", z1.real, z1.imag);    // 中间结果，%lg格式符
        d = z1.real * z1.real + z1.imag * z1.imag; // 计算z1与原点(0,0)的距离，(实部的平方+虚部的平方)再开根
        if (d > 3 * 3)                             // 如果距离超过3，可以认为迭代结果为发散
            return i + 1;                          // 返回迭代次数
        z0 = z1;                                   // 计算得到的z1作为下次迭代的z0
    }
    return -1; // 返回-1表示收敛
}

// 生成图像文件fn，w列h行，坐标左界x1，右界x2，下界y1，上界y2
void drawPicture(char *fn, int w, int h, double x1, double y1, double y2)
{
    int cnt = 0;
    int i, j;
    int black, red, yellow, green, cyan, blue, purple, white;
    double x, y, rxy = (y2 - y1) / h, x2 = x1 + w * rxy;
    black = red = yellow = green = cyan = blue = purple = white = 0;
    bmpInitial(w, h);       // 调用资源函数，初始化图像宽度和高度信息
    for (i = 0; i < h; i++) // 逐行循环，图像下边对应0行
    {
        y = y1 + i * (y2 - y1) / h; // 计算第i行对应的y坐标
        for (j = 0; j < w; j++)     // 逐列循环，图像左边对应0列
        {
            x = x1 + j * (x2 - x1) / w; // 计算第j列对应的x坐标
            my_complex cpx = {x, y};
            int it = chkIteration(cpx, 256);
            if (it == -1)
                bmpSetPixel(i, j, 0, 0, 0), black++;
            else if (it > 128)
                bmpSetPixel(i, j, 255, 0, 0), red++;
            else if (it > 64)
                bmpSetPixel(i, j, 255, 255, 0), yellow++;
            else if (it > 32)
                bmpSetPixel(i, j, 0, 255, 0), green++;
            else if (it > 16)
                bmpSetPixel(i, j, 0, 255, 255), cyan++;
            else if (it > 8)
                bmpSetPixel(i, j, 0, 0, 255), blue++;
            else if (it > 4)
                bmpSetPixel(i, j, 255, 0, 255), purple++;
            else
                bmpSetPixel(i, j, 255, 255, 255), white++;
        }
    }
    bmpWriteToFile(fn); // 调用资源函数，生成图像文件
    printf("fn=Mand06.BMP, w=%d, h=%d\nx1=%lg, x2=%lg, y1=%lg, y2=%lg, rxy=%lg\ncnt=%d:%lg%%\n", w, h, x1, x2, y1, y2, rxy, cnt, (double)cnt / (w * h) * 100);
    printf("像素计数:黑%d,红%d,黄%d,绿%d,青%d,蓝%d,紫%d,白%d\n", black, red, yellow, green, cyan, blue, purple, white);
}

int randci(char s[], int i)
{
    int ret;
    while (i == -1 || s[i] != ' ')
        scanf("%c", &s[++i]);
    ret = atoi(s);
    for (i = 0; i < 100; ++i)
        s[i] = '\0';
    return ret;
}

double randcf(char s[], int i)
{
    double ret;
    while (i == -1 || s[i] != ' ' && s[i] != '\n')
        scanf("%c", &s[++i]);
    ret = atof(s);
    for (i = 0; i < 100; ++i)
        s[i] = '\0';
    return ret;
}

void read(int *w, int *h, double *x1, double *y1, double *y2)
{
    char s[100];
    *w = 160, *h = 120;
    *x1 = -2.25, *y1 = -1.25, *y2 = 1.25;

    scanf("%c", s);
    if (s[0] == 'z')
        return;
    *w = randci(s, 0);
    *h = randci(s, -1);

    scanf("%c", s);
    if (s[0] == 'z')
        return;
    *x1 = randcf(s, 0);
    *y1 = randcf(s, -1);
    *y2 = randcf(s, -1);
}

int main(void)
{
    int w, h;
    double x1, y1, y2;
    read(&w, &h, &x1, &y1, &y2);
    drawPicture("Mand05.BMP", w, h, x1, y1, y2);
    return 0;
}
```
```cpp
//Mand06.cpp
#include "mybmp.h" //包含图像生成资源库
#include <math.h>

struct my_complex
{                // 定义复数结构体
    double real; // 实部
    double imag; // 虚部
};
typedef struct my_complex my_complex;
int chkIteration(struct my_complex c, int n)
{ // 给定c，最多迭代n次，返回收敛或发散情况
    struct my_complex z1, z0 = {0, 0};
    double d;
    int i;
    for (i = 0; i < n; i++)
    { // 每次迭代从z0计算得到z1，复数公式：z1=z0*z0+c
        z1.real = z0.real * z0.real - z0.imag * z0.imag + c.real;
        z1.imag = 2 * z0.real * z0.imag + c.imag;
        // printf("(%lg,%lg) ", z1.real, z1.imag);    // 中间结果，%lg格式符
        d = z1.real * z1.real + z1.imag * z1.imag; // 计算z1与原点(0,0)的距离，(实部的平方+虚部的平方)再开根
        if (d > 3 * 3)                             // 如果距离超过3，可以认为迭代结果为发散
            return i + 1;                          // 返回迭代次数
        z0 = z1;                                   // 计算得到的z1作为下次迭代的z0
    }
    return -1; // 返回-1表示收敛
}

void map(int it, int *r, int *g, int *b)
{
    int min = 0, max = 256;
    double tmp, step, m, localr;
    int range = max - min + 1, idx;
    if (it < min)
    {
        *r = 0, *g = 0, *b = 0;
        return;
    }
    if (it > max)
    {
        *r = 255, *g = 255, *b = 255;
        return;
    }
    tmp = (double)(it - min) / range;
    if (tmp > 0.2)
        idx = 4, localr = (it - min - range * 0.2) / (range * 0.8);
    else if (tmp > 0.1)
        idx = 3, localr = (range * 0.1 - (it - min - range * 0.1)) / (range * 0.1);
    else if (tmp > 0.05)
        idx = 2, localr = (it - min - range * 0.05) / (range * 0.05);
    else if (tmp > 0.02)
        idx = 1, localr = (range * 0.03 - (it - min - range * 0.02)) / (range * 0.03);
    else
        idx = 0, localr = (it - min) / (range * 0.02);
    switch (idx)
    {
    case 0:
        *r = 0, *g = localr * 255, *b = 255;
        break;
    case 1:
        *r = 0, *g = 255, *b = localr * 255;
        break;
    case 2:
        *r = localr * 255, *g = 255, *b = 0;
        break;
    case 3:
        *r = 255, *g = localr * 255, *b = 0;
        break;
    case 4:
        *r = 0, *g = 255, *b = localr * 255;
        break;
    default:
        break;
    }
}
int t;

// 生成图像文件fn，w列h行，坐标左界x1，右界x2，下界y1，上界y2
void drawPicture(char *fn, int w, int h, double x1, double y1, double y2)
{
    int cnt = 0;
    int i, j;
    double x, y, rxy = (y2 - y1) / h, x2 = x1 + w * rxy;
    bmpInitial(w, h);       // 调用资源函数，初始化图像宽度和高度信息
    for (i = 0; i < h; i++) // 逐行循环，图像下边对应0行
    {
        y = y1 + i * (y2 - y1) / h; // 计算第i行对应的y坐标
        for (j = 0; j < w; j++)     // 逐列循环，图像左边对应0列
        {
            x = x1 + j * (x2 - x1) / w; // 计算第j列对应的x坐标
            my_complex cpx = {x, y};
            int r, g, b;
            int it = chkIteration(cpx, 256);
            map(it, &r, &g, &b);
            bmpSetPixel(i, j, r, g, b);
        }
    }
    bmpWriteToFile(fn); // 调用资源函数，生成图像文件
    if (1 <= t && t <= 4)
        printf("fn=Mand06_%d.BMP, w=%d, h=%d\nx1=%lg, x2=%lg, y1=%lg, y2=%lg, rxy=%lg\n", t, w, h, x1, x2, y1, y2, rxy);
    else
        printf("fn=Mand06.BMP, w=%d, h=%d\nx1=%lg, x2=%lg, y1=%lg, y2=%lg, rxy=%lg\n", w, h, x1, x2, y1, y2, rxy);
}

int randci(char s[], int i)
{
    int ret;
    while (i == -1 || s[i] != ' ')
        scanf("%c", &s[++i]);
    ret = atoi(s);
    for (i = 0; i < 100; ++i)
        s[i] = '\0';
    return ret;
}

double randcf(char s[], int i)
{
    double ret;
    while (i == -1 || s[i] != ' ' && s[i] != '\n')
        scanf("%c", &s[++i]);
    ret = atof(s);
    for (i = 0; i < 100; ++i)
        s[i] = '\0';
    return ret;
}

void read(int *w, int *h, double *x1, double *y1, double *y2)
{
    char s[100];
    double nums[4][3] = {
        {-2, -2, 1},
        {-2.25, -1.5, 0.5},
        {0, 0, 1},
        {0, 0, 0.5}};
    *w = 160, *h = 120;
    *x1 = -2.25, *y1 = -1.25, *y2 = 1.25;

    scanf("%c", s);
    if (s[0] == 'z')
        return;
    *w = randci(s, 0);
    *h = randci(s, -1);

    scanf("%c", s);
    if (s[0] == 'z')
        return;
    t = randci(s, 0);
    if (t >= 1 && t <= 4)
    {
        *x1 = nums[t - 1][0];
        *y1 = nums[t - 1][1];
        *y2 = nums[t - 1][2];
        return;
    }
    *x1 = randcf(s, -1);
    *y1 = randcf(s, -1);
    *y2 = randcf(s, -1);
}

int main(void)
{
    int w, h;
    double x1, y1, y2;
    char pic[15] = "Mand06.BMP";
    read(&w, &h, &x1, &y1, &y2);
    if (1 <= t && t <= 4)
    {
        char pict[] = "Mand06_#.BMP";
        pict[7] = '0' + t;
        drawPicture(pict, w, h, x1, y1, y2);
    }
    else
        drawPicture(pic, w, h, x1, y1, y2);
    return 0;
}
```
### RGB映射函数的过程性源代码
```cpp
//map-1.cpp
#include <stdio.h>
// 数字映射rgb
void map(int it, int *r, int *g, int *b)
{
    int min = 0, max = 256;
    double tmp, step, m, localr;
    it = pow(max - it, 3);
    max = pow(max, 3);
    int range = max - min + 1, idx;
    if (it < min)
    {
        *r = 0, *g = 0, *b = 0;
        return;
    }
    if (it > max)
    {
        *r = 255, *g = 255, *b = 255;
        return;
    }
    tmp = (double)(it - min) / range;
    step = range / 5;
    idx = tmp * 5;
    m = (idx * step + min);
    localr = (it - m) / ((idx + 1) * step + min - m);
    switch (idx)
    {
    case 0:
        *r = 0, *g = localr * 255, *b = 255;
        break;
    case 1:
        *r = 0, *g = 255, *b = localr * 255;
        break;
    case 2:
        *r = localr * 255, *g = 255, *b = 0;
        break;
    case 3:
        *r = 255, *g = localr * 255, *b = 0;
        break;
    case 4:
        *r = 0, *g = 255, *b = localr * 255;
        break;
    default:
        break;
    }
}

int main()
{
    int it, r, g, b;
    scanf("%d", &it);
    map(it, &r, &g, &b);
    printf("%d %d %d", r, g, b);
    return 0;
}
```
```cpp
//map-2.cpp
#include <stdio.h>
// 数字映射rgb
void map(int it, int *r, int *g, int *b)
{
    int min = 0, max = 256;
    double tmp, step, m, localr;
    it = pow(max - it, 4);
    max = pow(max, 4);
    it = max - it;
    int range = max - min + 1, idx;
    if (it < min)
    {
        *r = 0, *g = 0, *b = 0;
        return;
    }
    if (it > max)
    {
        *r = 255, *g = 255, *b = 255;
        return;
    }
    tmp = (it - min) / range;
    step = range / 5;
    idx = tmp * 5;
    m = (idx * step + min);
    localr = (it - m) / ((idx + 1) * step + min - m);
    switch (idx)
    {
    case 0:
        *r = 0, *g = localr * 255, *b = 255;
        break;
    case 1:
        *r = 0, *g = 255, *b = localr * 255;
        break;
    case 2:
        *r = localr * 255, *g = 255, *b = 0;
        break;
    case 3:
        *r = 255, *g = localr * 255, *b = 0;
        break;
    case 4:
        *r = 0, *g = 255, *b = localr * 255;
        break;
    default:
        break;
    }
}

int main()
{
    int it, r, g, b;
    scanf("%d", &it);
    map(it, &r, &g, &b);
    printf("%d %d %d", r, g, b);
    return 0;
}
```
```cpp
//map-3.cpp
#include <stdio.h>
// 数字映射rgb
void map(int it, int *r, int *g, int *b)
{
    int min = 0, max = 256;
    double tmp, step, m, localr;
    int range = max - min + 1, idx;
    if (it < min)
    {
        *r = 0, *g = 0, *b = 0;
        return;
    }
    if (it > max)
    {
        *r = 255, *g = 255, *b = 255;
        return;
    }
    tmp = (double)(it - min) / range;
    if (tmp > 0.4)
        idx = 4, localr = (it - min - range * 0.4) / (range * 0.6);
    else if (tmp > 0.2)
        idx = 3, localr = (it - min - range * 0.2) / (range * 0.2);
    else if (tmp > 0.1)
        idx = 2, localr = (it - min - range * 0.1) / (range * 0.1);
    else if (tmp > 0.05)
        idx = 1, localr = (it - min - range * 0.05) / (range * 0.05);
    else
        idx = 0, localr = (it - min) / (range * 0.05);
    switch (idx)
    {
    case 0:
        *r = 0, *g = localr * 255, *b = 255;
        break;
    case 1:
        *r = 0, *g = 255, *b = localr * 255;
        break;
    case 2:
        *r = localr * 255, *g = 255, *b = 0;
        break;
    case 3:
        *r = 255, *g = localr * 255, *b = 0;
        break;
    case 4:
        *r = 0, *g = 255, *b = localr * 255;
        break;
    default:
        break;
    }
}

int main()
{
    int it, r, g, b;
    scanf("%d", &it);
    map(it, &r, &g, &b);
    printf("%d %d %d", r, g, b);
    return 0;
}
```
```cpp
//map-4.cpp
void map(int it, int *r, int *g, int *b)
{
    int min = 0, max = 256;
    double tmp, step, m, localr;
    int range = max - min + 1, idx;
    if (it < min)
    {
        *r = 0, *g = 0, *b = 0;
        return;
    }
    if (it > max)
    {
        *r = 255, *g = 255, *b = 255;
        return;
    }
    tmp = (double)(it - min) / range;
    if (tmp > 0.2)
        idx = 4, localr = (it - min - range * 0.2) / (range * 0.8);
    else if (tmp > 0.1)
        idx = 3, localr = (it - min - range * 0.1) / (range * 0.1);
    else if (tmp > 0.05)
        idx = 2, localr = (it - min - range * 0.05) / (range * 0.05);
    else if (tmp > 0.02)
        idx = 1, localr = (it - min - range * 0.02) / (range * 0.03);
    else
        idx = 0, localr = (it - min) / (range * 0.02);
    switch (idx)
    {
    case 0:
        *r = 0, *g = localr * 255, *b = 255;
        break;
    case 1:
        *r = 0, *g = 255, *b = localr * 255;
        break;
    case 2:
        *r = localr * 255, *g = 255, *b = 0;
        break;
    case 3:
        *r = 255, *g = localr * 255, *b = 0;
        break;
    case 4:
        *r = 0, *g = 255, *b = localr * 255;
        break;
    default:
        break;
    }
}

int main()
{
    int it, r, g, b;
    scanf("%d", &it);
    map(it, &r, &g, &b);
    printf("%d %d %d", r, g, b);
    return 0;
}
```
```cpp
//map-5.cpp
void map(int it, int *r, int *g, int *b)
{
    int min = 0, max = 256;
    double tmp, step, m, localr;
    int range = max - min + 1, idx;
    if (it < min)
    {
        *r = 0, *g = 0, *b = 0;
        return;
    }
    if (it > max)
    {
        *r = 255, *g = 255, *b = 255;
        return;
    }
    tmp = (double)(it - min) / range;
    if (tmp > 0.2)
        idx = 4, localr = (it - min - range * 0.2) / (range * 0.8);
    else if (tmp > 0.1)
        idx = 3, localr = (range * 0.1 - (it - min - range * 0.1)) / (range * 0.1);
    else if (tmp > 0.05)
        idx = 2, localr = (it - min - range * 0.05) / (range * 0.05);
    else if (tmp > 0.02)
        idx = 1, localr = (range * 0.03 - (it - min - range * 0.02)) / (range * 0.03);
    else
        idx = 0, localr = (it - min) / (range * 0.02);
    switch (idx)
    {
    case 0:
        *r = 0, *g = localr * 255, *b = 255;
        break;
    case 1:
        *r = 0, *g = 255, *b = localr * 255;
        break;
    case 2:
        *r = localr * 255, *g = 255, *b = 0;
        break;
    case 3:
        *r = 255, *g = localr * 255, *b = 0;
        break;
    case 4:
        *r = 0, *g = 255, *b = localr * 255;
        break;
    default:
        break;
    }
}

int main()
{
    int it, r, g, b;
    scanf("%d", &it);
    map(it, &r, &g, &b);
    printf("%d %d %d", r, g, b);
    return 0;
}
```
## 其他
编写使用vscode;\
调试使用devc++;\
编译使用VS2022,工程文件保存为Mandelbrot Set.zip.