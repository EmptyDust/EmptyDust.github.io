---
title: os-8
date: 2025-05-22 08:32:18
tags:
---

## 实验目的
- 加深对操作系统设备管理基本原理的认识，实践键盘中断、扫描码等概念；
- 通过实践掌握 Linux 0.11 对键盘终端和显示器终端的处理过程。

## 实验任务
- 本实验的基本内容是修改 Linux 0.11 的终端设备处理代码，对键盘输入和字符显示进行非常规的控制。 在初始状态，一切如常。用户按一次 F12 后，把应用程序向终端输出所有字母都替换为*。用户再按一次 F12，又恢复正常。第三次按F12，再进行输出替换。依此类推。

## 实验资料
| 文件名                                                                            | 介绍                                             |
| --------------------------------------------------------------------------------- | ------------------------------------------------ |
| hit-操作系统实验指导书.pdf                                                        | 哈工大OS实验指导书                               |
| Linux内核完全注释(修正版v3.0).pdf                                                 | 赵博士对Linux v0.11 OS进行了详细全面的注释和说明 |
| file1615.pdf                                                                      | BIOS 涉及的中断数据手册                          |
| hit-oslab-linux-20110823.tar.gz                                                   | hit-oslab 实验环境                               |
| gcc-3.4-ubuntu.tar.gz                                                             | Linux v0.11 所使用的编译器                       |
| [Bochs 汇编级调试指令](https://www.emptydust.com/2025/05/21/bochs-debug-commend/) | bochs 基本调试指令大全                           |
| 最全ASCII码对照表0-255                                                            | 屏幕输出字符对照的 ASCII 码                      |
| x86_64 常用寄存器大全                                                             | x86_64 常用寄存器大全                            |

## 实验内容
### 键盘输入处理
键盘中断发生步骤：

1. 键盘 I/O 是典型的中断驱动，在 `kernel/chr_drv/console.c` 文件中将键盘中断响应函数设为 `keyboard_interrupt`。每次按键有动作，`keyboard_interrupt` 函数就会被调用，函数定义在文件 `kernel/chr_drv/keyboard.S`中；
2. 根据扫描码，查 `key_table` 表进行扫描码处理，表中定义了相关所有扫描码对应键的处理函数，比如`f1-f12`键的处理则要先运行一段处理函数func；
3. 将扫描码放到键盘输入队列中，调用`do_tty_interrupt`函数进行处理。

> 为了实现按`F12`实现切换，只需要定义一个切换函数，并将其放在`ket_table`中`F12`对应的处理函数位置即可。

1. 修改文件`linux-0.11/kernel/chr_drv/tty_io.c`，定义标志位，实现每按下一次F12标志位就会变化。
```c
int switch_show_char_flag = 0;
void press_F12_handle(void)
{
    switch_show_char_flag = switch_show_char_flag ? 0 : 1;
}
```

2、修改 `linux-0.11/include/linux/tty.h` 文件，将标志位和函数声明为全局。
```c
extern int switch_show_char_flag;
void press_F12_handle(void);
```

3、修改`linux-0.11/kernel/chr_drv/keyboard.S`文件中`key_table`中`F12`对应的处理函数。
```c
key_table:
    /* .long func,none,none,none         58-5B f12 ? ? ? */
    .long press_F12_handle,none,none,none /* 58-5B f12 ? ? ? */
```

### 屏幕输出控制

屏幕输出过程：

1. 输出字符到屏幕，系统调用`write`函数来进行；
2. `write`函数则会调用`sys_write`系统调用来实现字符输出；
3. 然后再调用`tty_write`函数；
4. 最终调用`con_write`函数将字符输出。
5. 故只需要修改`con_write`最终写到显存中的字符就可以了。具体修改文件`linux-0.11/kernel/chr_drv/console.c`，修改如下：
```c
void con_write(struct tty_struct * tty)
{
//  ....
        switch(state) {
            case 0:
                if (c>31 && c<127) {
                    if (x>=video_num_columns) {
                        x -= video_num_columns;
                        pos -= video_size_row;
                        lf();
                    }
					// 新增代码，若扫描码为大小写字母或者数字，则改为*
                    if(switch_show_char_flag) {
                        if((c>='A'&&c<='Z')||(c>='a'&&c<='z')||(c>='0'&&c<='9'))
                            c = '*';
                    }
                }
        }
}
```

1. 编译并运行
```c
cd oslab_Lab7/linux-0.11
make all
../run
```
2. 测试结果

在 Bochs 中进行测试：

- 若没有按下F12，输出为正常显示；
- 若按下F12，则数字和字母的回显变为*；
- 且再次按下F12，显示将恢复正常。


![2.png](https://bu.dusays.com/2025/05/22/682e7ad76f7c1.png)