---
title: os-homework-7-地址映射与共享
date: 2025-05-21 14:19:57
tags: os
cover: https://bu.dusays.com/2025/04/17/6801139c15a01.jpg
---

该实验报告基本按照参考文献，但改正了一些笔误/错误并按照我实际运行结果修改了部分值。

## 实验目的
- 深入理解操作系统的段、页式内存管理，深入理解段表、页表、逻辑地址、线性地址、物理地址等概念；
- 实践段、页式内存管理的地址映射过程；
- 编程实现段、页式内存管理上的内存共享，从而深入理解操作系统的内存管理。

## 实验任务

1. 用 Bochs 调试工具跟踪 Linux 0.11 的地址翻译（地址映射）过程，了解 IA-32 和 Linux 0.11 的内存管理机制；
2. 在 Ubuntu 上编写多进程的生产者—消费者程序，用共享内存做缓冲区；
3. 在信号量实验的基础上，为 Linux 0.11 增加共享内存功能，并将生产者—消费者程序移植到 Linux 0.11。


| 文件名                            | 介绍                                             |
| --------------------------------- | ------------------------------------------------ |
| hit-操作系统实验指导书.pdf        | 哈工大OS实验指导书                               |
| Linux内核完全注释(修正版v3.0).pdf | 赵博士对Linux v0.11 OS进行了详细全面的注释和说明 |
| file1615.pdf                      | BIOS 涉及的中断数据手册                          |
| hit-oslab-linux-20110823.tar.gz   | hit-oslab 实验环境                               |
| gcc-3.4-ubuntu.tar.gz             | Linux v0.11 所使用的编译器                       |
| Bochs 汇编级调试指令              | bochs 基本调试指令大全                           |
| 最全ASCII码对照表0-255            | 屏幕输出字符对照的 ASCII 码                      |
| x86_64 常用寄存器大全             | x86_64 常用寄存器大全                            |

## 实验内容

### IA-32 的地址翻译过程
1. 启动调试器
- 将 `test.c` 测试程序拷贝到 linux0.11 系统下

```shell
cd oslab_Lab6
sudo ./mount-hdc
cp test.c hdc/usr/root/
sudo umount hdc
// 启动 linux-0.11
./dbg-asm
c              // 运行到断点位置
```

2. 编译并运行 `test.c`
- `linux-0.11` 系统下编译运行 `test.c`
```shell
gcc -o test test.c
./test
```

![](https://bu.dusays.com/2025/05/21/682d7285075f3.png)

3. 暂停
- 在命令行窗口按 `Ctrl+c`，`Bochs` 会暂停运行态。绝大多数情况下都会停在 `test` 内。
- 其中的 `000f` 如果是 `0008`，则说明中断在了内核里。那么就要 c，然后再 `Ctrl+c`，直到变为 `000f` 为止。
- 如果显示的下一条指令不是 `cmp` ...（这里指语句以 `cmp` 开头），就用 `n` 命令单步运行几步，直到停在 `cmp` 。

![](https://bu.dusays.com/2025/05/21/682d72862d441.png)

- 使用命令 `u /8`，显示从当前位置开始 `8` 条指令的反汇编代码。
- 这就是 `test.c` 中从 `while` 开始一直到 `return` 的汇编代码。变量 `i` 保存在 `ds:0x3004` 这个地址，并不停地和 `0` 进行比较，直到它为 `0`，才会跳出循环。

4. 使用`sreg` 指令查段表，计算 DS 线性地址
- `ds:0x3004` 是虚拟地址，应用程序都有一个段表，叫 LDT。
- `ldtr` 寄存器表示 LDT表存放在 GDT 表的位置。

![](https://bu.dusays.com/2025/05/21/682d728665725.png)

- `0x0068 = 0000000001101000`，则存放在 GDT 表的 1101（二进制）=13（十进制）号位置

逻辑地址由**段选择子（Segment Selector）和段内偏移（Offset）组成。段选择子是一个 16 位的值，它并不直接是内存地址，而是用于在描述符表**中查找对应的**段描述符**。


| 位数范围 | 字段名称                            | 功能说明                                                                                                   |
| :------- | :---------------------------------- | :--------------------------------------------------------------------------------------------------------- |
| 15-3     | **索引 (Index)**                    | 在 GDT 或 LDT 中查找段描述符的索引号。由于每个描述符占 8 字节，所以实际地址是 `索引 * 8`。                 |
| 2        | **TI (Table Indicator)**            | **表指示器**。`TI = 0` 表示在**全局描述符表 (GDT)** 中查找；`TI = 1` 表示在**局部描述符表 (LDT)** 中查找。 |
| 1-0      | **RPL (Requester Privilege Level)** | **请求特权级**。表示当前段的请求者特权级，用于特权级检查。数值 00（最高特权级）到 11（最低特权级）。       |

5. 在 GDT 表中查找 LDT 表
- GDT 表中的每一项占 64 位（8 个字节），所以我们要查找的项的地址是 `0x00005cb8+13*8`。xp 是用于查看内存内容的调试指令，w表示显示两个字（b-BYTE, h-WORD, w-DWORD, g-DWORD64）
- `xp /2w 0x00005cb8+13*8`
![](https://bu.dusays.com/2025/05/21/682d72855879a.png)
> 此时可以发现，和前面sreg指令中ldtr后面的dl和dh值一样（这是Bochs 调试器自动计算出的）

6. 利用 GDT 表中描述符计算 LDT 表线性地址
- 描述符为“0x52d00068 0x000082fd”，-> 0x 00 fd 52d0 （前面32位对应下面行，后面32位对应上面行）


**段描述符结构：**

段描述符是一个 64 位（8 字节）的数据结构，存储着段的详细信息。它决定了段的**基地址（Base Address）**、**限长（Limit）以及各种属性（Attributes）**。

| 位数范围 | 字段名称                                         | 功能说明                                                                                                                              |
| :------- | :----------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------ |
| 63-56    | **Base**                                         | 段基地址的最高 8 位。                                                                                                                 |
| 55       | **G (Granularity)**                              | **粒度位**。`G = 0` 表示限长以字节为单位；`G = 1` 表示限长以 4KB 为单位。                                                             |
| 54-52    | **D/B / L (Default Operation Size / Long Mode)** | **操作数大小/长模式位**。对于代码段和数据段，`D = 1` 表示 32 位操作，`D = 0` 表示 16 位操作。在 64 位模式下，`L=1` 表示 64 位代码段。 |
| 51-48    | **AVL (Available for System Software)**          | 系统软件可用位。                                                                                                                      |
| 47       | **P (Present)**                                  | **存在位**。`P = 1` 表示段在内存中；`P = 0` 表示段不在内存中，会引发缺页中断。                                                        |
| 46-45    | **DPL (Descriptor Privilege Level)**             | **描述符特权级**。段的特权级，数值 00（最高）到 11（最低）。                                                                          |
| 44       | **S (Descriptor Type)**                          | **描述符类型**。`S = 1` 表示代码或数据段描述符；`S = 0` 表示系统段描述符（如 LDT、TSS）。                                             |
| 43-40    | **Type**                                         | **段类型**。详细描述段的类型和权限（如可读、可写、可执行、向上/向下扩展等）。                                                         |
| 39-24    | **Base [23:0]**                                  | 段基地址的低 24 位。                                                                                                                  |
| 23-20    | **Limit**                                        | 段限长的高 4 位。                                                                                                                     |
| 19-0     | **Limit [15:0]**                                 | 段限长的低 16 位。                                                                                                                    |



- 根据该地址，找到了 LDT 表位置。
- xp /8w 0x00fd52d0

![](https://bu.dusays.com/2025/05/21/682d728665725.png)

7. 段寄存器（段选择子） DS 从 LDT 表获取段描述符

- `sreg` 指令获取 DS 寄存器内容

```shell
<bochs:8> sreg
ds:s=0x0017, dl=0x00003fff, dh=0x10c0f300, valid=3
```


逻辑地址由**段选择子（Segment Selector）和段内偏移（Offset）组成。段选择子是一个 16 位的值，它并不直接是内存地址，而是用于在描述符表**中查找对应的**段描述符**。

| 位数范围 | 字段名称                            | 功能说明                                                                                                   |
| :------- | :---------------------------------- | :--------------------------------------------------------------------------------------------------------- |
| 15-3     | **索引 (Index)**                    | 在 GDT 或 LDT 中查找段描述符的索引号。由于每个描述符占 8 字节，所以实际地址是 `索引 * 8`。                 |
| 2        | **TI (Table Indicator)**            | **表指示器**。`TI = 0` 表示在**全局描述符表 (GDT)** 中查找；`TI = 1` 表示在**局部描述符表 (LDT)** 中查找。 |
| 1-0      | **RPL (Requester Privilege Level)** | **请求特权级**。表示当前段的请求者特权级，用于特权级检查。数值 00（最高特权级）到 11（最低特权级）。       |

例如，在实验中，DS 寄存器的值为 `0x0017`。
`0x0017` 的二进制表示为 `0000 0000 0001 0111`。

  * **索引**：`0000 0000 00010` (位 3-15) = `00010` (二进制) = `2` (十进制)。这表示 DS 段描述符在 LDT 中是第 2 项（从 0 开始计数，即第三个描述符）。
  * **TI**：`1` (位 2)。这表示 DS 段描述符在 **LDT** 中查找。
  * **RPL**：`11` (位 0-1) = `3` (十进制)。表示请求特权级为 3（用户态）。

> RPL：即如果 RPL 的数值大于 CPL（数值越大，权限越小），则用 RPL 的值覆盖 CPL 的值，即 CPR, RPL ≤ DPL
> TI：TI=0，在 GDT 表中查； TI = 1，在 LDT 表中查。
- ds = 0x0017 = 0001 0111，即RPL = 11， TI = 1，索引 = 10，即在 LDT 表中索引为 2 的描述符（即第三个），即`0x00003fff 0x10c0f300` 为搜寻很久的 DS 段描述符了。
> 此时可以发现，和前面`sreg`指令中`ds`后面的`dl`和`dh`值一样（这是Bochs 调试器自动计算出的）

> 根据段选择子ldtr在GDT表中找到了LDT表中的段描述符，计算线性地址，该线性地址其实bochs调试器在ldtr寄存器后面的dh、dl中已经计算好了，可以供我们验证；
> 根据段选择子DS在LDT表中找到DS的段描述符，计算线性地址，该线性地址其实bochs调试器在DS寄存器后面的dh、dl中已经计算好了，可以供我们验证。

8. 利用 LDT 表中段描述符计算 DS 线性地址（段基址）

- 由段描述符 `0x00003fff 0x10c0f300` 可以计算得到段基址为 `0x 10 00 0000`，所以 `ds:0x3004` 的线性地址为 `0x10003004`。

段描述符是一个 64 位（8 字节）的数据结构，存储着段的详细信息。它决定了段的**基地址（Base Address）**、**限长（Limit）以及各种属性（Attributes）**。

| 位数范围 | 字段名称                                         | 功能说明                                                                                                                              |
| :------- | :----------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------ |
| 63-56    | **Base**                                         | 段基地址的最高 8 位。                                                                                                                 |
| 55       | **G (Granularity)**                              | **粒度位**。`G = 0` 表示限长以字节为单位；`G = 1` 表示限长以 4KB 为单位。                                                             |
| 54-52    | **D/B / L (Default Operation Size / Long Mode)** | **操作数大小/长模式位**。对于代码段和数据段，`D = 1` 表示 32 位操作，`D = 0` 表示 16 位操作。在 64 位模式下，`L=1` 表示 64 位代码段。 |
| 51-48    | **AVL (Available for System Software)**          | 系统软件可用位。                                                                                                                      |
| 47       | **P (Present)**                                  | **存在位**。`P = 1` 表示段在内存中；`P = 0` 表示段不在内存中，会引发缺页中断。                                                        |
| 46-45    | **DPL (Descriptor Privilege Level)**             | **描述符特权级**。段的特权级，数值 00（最高）到 11（最低）。                                                                          |
| 44       | **S (Descriptor Type)**                          | **描述符类型**。`S = 1` 表示代码或数据段描述符；`S = 0` 表示系统段描述符（如 LDT、TSS）。                                             |
| 43-40    | **Type**                                         | **段类型**。详细描述段的类型和权限（如可读、可写、可执行、向上/向下扩展等）。                                                         |
| 39-24    | **Base [23:0]**                                  | 段基地址的低 24 位。                                                                                                                  |
| 23-20    | **Limit**                                        | 段限长的高 4 位。                                                                                                                     |
| 19-0     | **Limit [15:0]**                                 | 段限长的低 16 位。                                                                                                                    |

在实验中，DS 的段描述符为 `0x00003fff 0x10c0f300`。我们将其拆分为高 32 位和低 32 位进行分析：

  * **高 32 位：`0x10c0f300`**
      * `Base [31:24]`：`0x10` (位 24-31)
      * `G`：取决于具体的位，例如 `1`
      * `D/B`：取决于具体的位，例如 `1`
      * `P`：`1` (位 47)，表示段存在。
      * `DPL`：`11` (位 45-46)，即 3。
      * `S`：`1` (位 44)，表示这是一个代码或数据段。
      * `Type`：`C0` 部分决定，例如 `1010` (可写数据段)。
  * **低 32 位：`0x00003fff`**
      * `Base [15:0]`：`0x0000` (位 0-15)
      * `Limit [15:0]`：`0x3fff` (位 0-15)

将**段基地址**的三个部分 (`Base [31:24]`, `Base [23:16]`, `Base [15:0]`) 组合起来，可以得到完整的 32 位段基地址。
例如，`0x00003fff 0x10c0f300` 经过组合，其段基地址为 `0x10000000`。
加上段内偏移 `0x3004`，最终计算得到的**线性地址**为 `0x10000000 + 0x3004 = 0x10003004`。

9. 查页表，由线性地址计算物理地址
> 页目录号（10位）、页表号（10位）和页内偏移（12位）
- 线性地址 `0x10003004`：页目录号 = `64`， 页号 = `3`， 页内偏移 = `4`

**线性地址结构：**

| 位数范围 | 字段名称                            | 功能说明                                               |
| :------- | :---------------------------------- | :----------------------------------------------------- |
| 31-22    | **页目录号 (Page Directory Index)** | 用于在页目录表中查找对应的**页目录项 (PDE)**。         |
| 21-12    | **页表号 (Page Table Index)**       | 用于在页目录项指向的页表中查找对应的**页表项 (PTE)**。 |
| 11-0     | **页内偏移 (Offset within Page)**   | 在最终物理页内部的偏移量，表示数据在该页中的具体位置。 |

例如，线性地址 `0x10003004` 的二进制表示为 `0001 0000 0000 0000 0011 0000 0000 0100`。

  * **页目录号**：`0001 0000 00` (位 22-31) = `01000000` (二进制) = `64` (十进制)。
  * **页表号**：`00 0000 0011` (位 12-21) = `0000000011` (二进制) = `3` (十进制)。
  * **页内偏移**：`0000 0000 0100` (位 0-11) = `0x004` (十六进制)。

- 页目录表的位置由 CR3 寄存器指引, `creg` 命令可以查看：

![](https://bu.dusays.com/2025/05/21/682d72854e8ae.png)

- 说明页目录表的基址为 0
- 页目录表和页表中的内容很简单，是 1024 （2^10）个 32 位数，表大小刚好为4K。用以下指令可以在页目录表中查找到页目录项


```cpp
xp /w 0+64*4
```


**页目录项 (PDE) 和 页表项 (PTE) 结构：**

页目录项和页表项都是 32 位（4 字节）的数据结构，它们指向下一级页表或最终的物理页。

| 位数范围 | 字段名称                                  | 功能说明                                                                                          |
| :------- | :---------------------------------------- | :------------------------------------------------------------------------------------------------ |
| 31-12    | **页框地址 (Page Frame Address)**         | 指向 4KB 对齐的页表或物理页的起始物理地址。                                                       |
| 11       | **\<br\> (Reserved)**                     | 保留位，Linux 0.11 中通常为 0。                                                                   |
| 10-9     | **Avail (Available for System Software)** | 系统软件可用位。                                                                                  |
| 8        | **G (Global)**                            | **全局位**。`G = 1` 表示该页不进行 TLB 冲刷，用于内核等全局页。                                   |
| 7        | **PS (Page Size)**                        | **页大小位**。`PS = 1` 表示 4MB 大页；`PS = 0` 表示 4KB 小页。在 Linux 0.11 中通常为 0 (4KB 页)。 |
| 6        | **D (Dirty)**                             | **脏位**。`D = 1` 表示页被写入过；`D = 0` 表示页未被写入。                                        |
| 5        | **A (Accessed)**                          | **访问位**。`A = 1` 表示页被访问过（读或写）。                                                    |
| 4        | **PCD (Page Cache Disable)**              | **页缓存禁止**。`PCD = 1` 禁止该页的缓存。                                                        |
| 3        | **PWT (Page Write-Through)**              | **页写穿**。`PWT = 1` 启用写穿缓存策略。                                                          |
| 2        | **U/S (User/Supervisor)**                 | **用户/管理特权级**。`U/S = 1` 允许所有特权级访问；`U/S = 0` 只允许特权级 0-2 访问。              |
| 1        | **R/W (Read/Write)**                      | **读/写权限**。`R/W = 1` 允许读写；`R/W = 0` 只允许读。                                           |
| 0        | **P (Present)**                           | **存在位**。`P = 1` 表示页在内存中；`P = 0` 表示页不在内存中，会引发缺页中断。                    |

  * **查找页目录表**：

      * `CR3` 寄存器存储**页目录表的物理基地址**，在实验中显示为 `0x00000000`。
      * 通过 `xp /w 0 + 64 * 4`，我们查找页目录表中索引为 64 的页目录项。结果是 `0x00fa5027`。
      * 从这个页目录项中，提取**页表物理地址**：`0x00fa5000` (高 20 位)。`0x27` 是属性位（`P=1`，`R/W=1`，`U/S=0` 等）。

  * **查找页表**：

      * 页表物理地址是 `0x00fa5000`。
      * 通过 `xp /w 0x00fa5000 + 3 * 4`，我们查找页表中索引为 3 的页表项。结果是 `0x00fa3067`。
      * 从这个页表项中，提取**物理页框号**：`0x00fa3000` (高 20 位)。同样，`0x67` 是属性位。

  * **计算物理地址**：

      * 将物理页框号 `0x00fa3000` 与页内偏移 `0x004` 相加，最终得到变量 `i` 的**物理地址**：`0x00fa3000 + 0x004 = 0x00fa3004`。

可以通过两种方式验证：
基于线性地址 `0x10003004` ，使用 `page` 指令：
```shell
page 0x10003004
linear page 0x10003000 maps to physical page 0x00fa3000
```
基于物理地址 `0x00fa3004`，使用 `xp` 指令查看地址中存放的一个字节：
```shell
xp /w 0x00fa3004
0x00fa3004 : 0x12345678
```

10.  修改内存来改变 i 的值，使程序退出循环
- 将从 `0x00fa3004` 地址开始的 4 个字节都设为 0
```shell
setpmem 0x00fa3004 4 0
```
- 然后再用 `c` 命令继续 Bochs 的运行，可以看到 test 退出了，说明 i 的修改成功了，此项实验结束。

![](https://bu.dusays.com/2025/05/21/682d72850062c.png)

### 在 Linux 0.11 中实现共享内存
本次实验将在 `Lab6 信号量的实现和应用` 实验的基础上，使用共享内存替换文件缓冲区，来完成生产者和消费者两个程序。
> Linux 中，将不同进程的虚拟地址空间通过页表映射到物理内存的同一区域，实现共享内存。

![](https://bu.dusays.com/2025/05/21/682da9528434d.png)

1. 新建文件kernel/shm.c，实现共享内存

![](https://bu.dusays.com/2025/05/21/682dac40cf0a7.png)

```c
#include <asm/segment.h>
#include <linux/kernel.h>
#include <linux/sched.h>
#include <linux/mm.h>
#include <errno.h>

#define _SHM_NUM 20

/* 共享内存结构体 */
struct shm_tables
{
    int key;                /* 共享内存标识 */
    int size;                /* 共享内存大小 */
    unsigned long page;        /* 共享内存地址 */
} shm_tables[_SHM_NUM];


/* 获取一块空闲的物理页面来创建共享内存 */
int sys_shmget(int key, int size)
{
    int i;
    unsigned long page;        /* 存放共享内存地址 */

    /* 查看 key 对应的共享内存是否已存在 */
    for (i = 0; i < _SHM_NUM; i++) 
        if(shm_tables[i].key == key)
            return i;
    
    /* 内存大小超过一页 */
    if (size > PAGE_SIZE) 
        return -EINVAL;

    /* 获取一块空闲物理内存页面，返回起始物理地址 */
    page = get_free_page(); 
    if(!page)
        return -ENOMEM;

    /* 记录到共享内存表中 */
    for (i = 0; i < _SHM_NUM; i++) {
        if(shm_tables[i].key == 0) {
            shm_tables[i].key = key;
            shm_tables[i].size = size;
            shm_tables[i].page = page;
            return i;
        }
    }
    return -1;  /* 共享内存数量已满 */
}

/* 将指定物理页面映射到当前进程的虚拟内存空间 */
void * sys_shmat(int shmid)
{
    int i;
    unsigned long data_base;

    /* 判断共享内存 shmid 是否越界 及 共享内存是否存在 */
    if (shmid < 0 || shmid >= _SHM_NUM || shm_tables[shmid].key == 0)
        return -EINVAL;
    
    /* 把物理页面映射到进程的虚拟内存空间，映射到代码段+数据段后，堆栈段前 */
    put_page(shm_tables[shmid].page, current->brk + current->start_code);
    /* 修改总长度，brk为代码段和数据段的总长度 */
    current->brk += PAGE_SIZE;
    return (void*)(current->brk - PAGE_SIZE);
}
```

- `brk` 为代码段和数据段的总长度，`brk + start_code` 即为代码段+数据段结束的位置；`start_stack` 为栈的起始地址。
- 因此，将物理内存映射到虚拟内存处，`brk` 和 `start_stack` 之间的空间为栈准备，栈底是闲置的（栈是往低地址方向扩展的），可将共享内存映射到这块空间。

![](https://bu.dusays.com/2025/05/21/682daa3eb5708.png)

2. 修改文件 `include/unistd.h` ，新增全局函数

![](https://bu.dusays.com/2025/05/21/682dacfbecb4d.png)

```c
#define __NR_shmget     76
#define __NR_shmat      77
```

3. 修改 `/kernel/system_call.s` ，需要修改总的系统调用数
```c
nr_system_calls = 78
```

4. 修改 `/include/linux/sys.h` ，声明全局新增函数
```c
/* 实验6 */
extern int sys_sem_open();
extern int sys_sem_wait();
extern int sys_sem_post();
extern int sys_sem_unlink();
/* 实验7 */
extern int sys_shmget();
extern int sys_shmat();

fn_ptr sys_call_table[] = {
//...sys_setreuid,sys_setregid,sys_whoami,sys_iam,
sys_sem_open,sys_sem_wait,sys_sem_post,sys_sem_unlink, /* 实验6 */
sys_shmget, sys_shmat   /* 实验7 */
};
```

5. 修改 `linux-0.11/kernel/Makefile`，添加 `sem.c` 编译规则
```c
OBJS  = sched.o system_call.o traps.o asm.o fork.o \
	panic.o printk.o vsprintf.o sys.o exit.o \
	signal.o mktime.o who.o sem.o
// ...
### Dependencies:
sem.s sem.o: sem.c ../include/linux/sem.h ../include/linux/kernel.h \
../include/unistd.h
```

6. 实现生产者程序 `producer.c` 和 消费者程序 `consumer.c`
> 为了确保对共享内存操作的互斥，仍需要使用一个信号量在每次读写的时候进行限制；同理，还需要两个信号量来保证共享内存中缓冲区大小为 10

`producer.c`
```c
#define __LIBRARY__ 
#include <stdio.h>
#include <stdlib.h>
#include <linux/sem.h>
#include <unistd.h>
#include <fcntl.h>

#define SIZE 10
#define M 510

/* add */
_syscall2(int,sem_open,const char*,name,unsigned int,value)
_syscall1(int,sem_wait,sem_t *,sem)
_syscall1(int,sem_post,sem_t *,sem)
_syscall1(int,sem_unlink,const char *,name)
_syscall2(int,shmget,int,key,int,size)
_syscall1(int, shmat, int, shmid)

int main()
{
    int shm_id;
    int count = 0;
    int *p;
    int curr;
    
    sem_t *sem_empty, *sem_full, *sem_shm;  /*3个信号量*/
    sem_empty = sem_open("empty", SIZE);
    sem_full = sem_open("full", 0);
    sem_shm = sem_open("shm", 1);

    shm_id = shmget(2521, SIZE);    /* 获取一块空闲的物理页面来创建共享内存 */
    p = (int *)shmat(shm_id);       /* 将指定物理页面映射到当前进程的虚拟内存空间 */

    /*生产多少个产品就循环几次*/
    while (count <= M) {
        /*empty大于0,才能生产*/
        sem_wait(sem_empty);    /* empty-- */
        sem_wait(sem_shm);      /* mutex-- */

        /*从上次位置继续向文件缓冲区写入一个字符*/
        curr = count % SIZE;    /*更新写入缓冲区位置，保证在0-9之间，缓冲区最大为10*/
        *(p + curr) = count;
        printf("Producer: %d\n", *(p + curr));
        fflush(stdout);

        sem_post(sem_shm);      /* mutex++ */
        sem_post(sem_full);     /* full++，唤醒消费者线程 */
        count++;
    }
    printf("producer end.\n");
    fflush(stdout);
    return 0;
}
```

`consumer.c`
```c
#define __LIBRARY__  
#include <stdio.h>
#include <stdlib.h>
#include <linux/sem.h>
#include <unistd.h>
#include <fcntl.h>

#define SIZE 10
#define M 510

/* add */
_syscall2(int,sem_open,const char*,name,unsigned int,value)
_syscall1(int,sem_wait,sem_t *,sem)
_syscall1(int,sem_post,sem_t *,sem)
_syscall1(int,sem_unlink,const char *,name)
_syscall2(int,shmget,int,key,int,size)
_syscall1(int, shmat, int, shmid)

int main()
{
    int shm_id;
    int count = 0;
    int *p;
    int curr;

    sem_t *sem_empty, *sem_full, *sem_shm;  /*3个信号量*/
    sem_empty = sem_open("empty", SIZE);
    sem_full = sem_open("full", 0);
    sem_shm = sem_open("shm", 1);

    shm_id = shmget(2521, SIZE);    /* 获取一块空闲的物理页面来创建共享内存 */
    p = (int *)shmat(shm_id);       /* 将指定物理页面映射到当前进程的虚拟内存空间 */

    /*生产多少个产品就循环几次*/
    while(count <= M) {
        /* full大于0，才能消费 */
        sem_wait(sem_full); /* full-- */
        sem_wait(sem_shm);  /* mutex-- */

        /*从上次位置继续向文件缓冲区写入一个字符*/
        curr = count % SIZE;    /*更新写入缓冲区位置，保证在0-9之间，缓冲区最大为10*/
        printf("%d:%d\n", getpid(), *(p + curr));
        fflush(stdout);

        sem_post(sem_shm);      /* mutex++ */
        sem_post(sem_empty);    /* empty++，唤醒生产者进程 */
        count++;
    }
    printf("consumer end.\n");
    fflush(stdout);
    /*释放信号量*/
    sem_unlink("empty");
    sem_unlink("full");
    sem_unlink("shm");
    return 0;
}
```

### 在linux0.11环境下编译运行
1. 将已经修改的 `consumer.c`、`producer.c` 和 `unistd.h`、`sem.h` 文件拷贝到`linux-0.11` 系统中
```shell
cd oslab_Lab6
sudo ./mount-hdc
cp ./consumer.c ./hdc/usr/root/
cp ./producer.c ./hdc/usr/root/
cp ./linux-0.11/include/unistd.h ./hdc/usr/include/ 
cp ./linux-0.11/include/linux/sem.h ./hdc/usr/include/linux/
sudo umount hdc
```

2. 编译及运行Bochs
```shell
cd oslab_Lab6/linux-0.11
make all
../run
```

![](https://bu.dusays.com/2025/05/21/682db0526a7c6.png)

3. 在linux0.11的Bochs中编译运行生产者-消费者程序
```shell
gcc -o producer producer.c
gcc -o consumer consumer.c
sync
./producer > p.txt & ./consumer > c.txt
```

![屏幕截图 2025-05-21 200212.png](https://bu.dusays.com/2025/05/21/682dc106b14f4.png)

4. 在Ubuntu中挂载`hdc`，将linux0.11输出的文件移动到Ubuntu中
```shell
sudo ./mount-hdc
cd /hdc/usr/root/
sudo cp ./p.txt ../../..
sudo cp ./c.txt ../../..
```

5. 实验结果
![屏幕截图 2025-05-21 202355.png](https://bu.dusays.com/2025/05/21/682dc5f974137.png)

![屏幕截图 2025-05-21 202505.png](https://bu.dusays.com/2025/05/21/682dc63c96149.png)

## 参考资料
1. [【哈工大_操作系统实验】Lab7 地址映射与共享](https://joker001014.github.io/blog/016_HIT_OS_Lab7/)
