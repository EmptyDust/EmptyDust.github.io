---
title: bochs 调试基本指令大全
date: 2025-05-21 22:26:36
tags: 操作系统
cover: https://bu.dusays.com/2025/04/17/6801139b3a847.jpg
---

# bochs 调试基本指令大全

| 功能                        | 指令         | 举例             |
| :-------------------------- | :----------- | :--------------- |
| 在某物理地址设置断点        | b addr       | b 0x90000        |
| 运行到断点位置              | c            | c                |
| 单步运行 (遇到函数则进入)   | s            | s                |
| 单步运行 (遇到函数跳过)     | n            | n                |
| 继续运行上调指令            | 回车         | 回车             |
| 显示当前所有断点信息        | info break   | info break       |
| 显示所有使用的寄存器值      | r            | r                |
| 显示段寄存器值              | sreg         | sreg             |
| 显示控制寄存器值            | creg         | creg             |
| 显示 CPU 状态信息           | info cpu     | info cpu         |
| 显示浮点寄存器值            | fp           | fp               |
| 退出调试模式                | q            | q                |
| 查看堆栈                    | print-stack  | print-stack      |
| 每执行一条指令就打印CPU信息 | trace-reg    | trace-reg on     |
| 查看内存物理地址内容        | xp /nuf addr | xp /40bx 0x9013e |
| 查看线性地址内容            | x /nuf addr  | x /40bx 0x13e    |
| 反汇编一段内存              | u start end  | u 0x30400 0x304D |
| 反汇编执行的每条指令        | trace-on     | trace-on         |
| 查看 bochs 基本命令         | help         | help             |

# 使用方法

```shell
./dbg-asm
```