---
title: BigDataBigHomework 大数据综合实训
date: 2025-11-20 16:18:20
tags:
---

由于全搬希冀平台的实验细节篇幅过长，因此本篇只起到查漏补缺的作用。

# 实验概述

## 实验步骤5

### 更新maven配置

根据希冀平台的实验步骤创建了三个项目并填入对应的maven配置

观察右上角侧栏发现一个maven按钮，点击即可呼出图片中的maven侧栏。

点击侧栏中最左侧的看起来与浏览器刷新按钮一模一样的按钮点击即可更新maven配置，使得你刚import的包应用在项目中。

之后你会发现下方出现了一项更新maven配置任务，点击详细信息后选择 `always download` 即可。

![1763626719855.png](https://bu.dusays.com/2025/11/20/691ecee278823.png)

### 指令勘误

四个指令有三个是错的，因此建议直接使用下面这个，直接复制粘贴跑即可。

```sh
ssh master
bash /scripts/hadoop/start-hadoop.sh
bash /scripts/hbase/start-hbase.sh
nohup /opt/module/kafka/bin/kafka-server-start.sh /opt/module/kafka/config/server.properties &> output.log &
/opt/module/hbase-1.1.5/bin/hbase-daemon.sh start thrift
```