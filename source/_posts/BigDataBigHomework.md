---
title: BigDataBigHomework 大数据综合实训
date: 2025-11-20 16:18:20
tags: 大数据
cover: https://bu.dusays.com/2026/01/16/696a4754c5099.jpg
---

由于全搬希冀平台的实验细节篇幅过长，因此本篇只起到查漏补缺的作用。

建议作业时间大约在 4 小时。

# 常用指令

master
```sh
java -Xms4096m -jar elec-producer.jar ./household_power_consumption.txt ./output.txt
flume-ng agent -c /opt/module/flume/conf/ -n a1 -f /support/flume-2-kafka.conf
```

slave1
```sh
kafka-console-consumer.sh --zookeeper slave1:2181 --topic eleclog
```

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

# 数据采集-生产者模块

## 实验步骤1

### 文件存放位置
这个问题是因为你的 Java 文件所在的文件夹没有被 IntelliJ IDEA 识别为**源代码根目录 (Source Root)**。

从截图左侧的项目结构可以看出，`bean` 文件夹直接位于模块 `elec-producer` 的根目录下，与 `src` 和 `pom.xml` 平级。

在标准的 Maven 项目结构中，Java 代码必须放在 `src/main/java` 目录下才能被正确识别和编译。

这里有两种解决方法，**强烈推荐第一种**：

#### 方法一：移动文件到正确的位置（推荐）

这是符合 Maven 规范的做法。

1.  在左侧项目视图中，展开 `elec-producer` -> `src` -> `main`。
2.  你应该能看到一个 `java` 文件夹（如果也是灰色的，右键点击 `java` -> Mark Directory as -> Sources Root）。
3.  在 `java` 文件夹下，根据你的包名声明（代码第1行：`package com.educg.elec.common.bean;`），你需要建立对应的目录结构：`com/educg/elec/common`。
4.  将截图中的整个 `bean` 文件夹（或者里面的文件）**拖拽/移动**到 `src/main/java/com/educg/elec/common/` 目录下。
5.  移动后，IDEA 会自动识别这些文件，红色警告就会消失，文件名也会变成正常的 Java 类图标（通常是蓝色 C 图标）。

#### 方法二：强制标记文件夹（不推荐）

如果你不想移动文件（这会导致 Maven 打包时可能忽略这些代码），你可以强制告诉 IDEA 这个文件夹是源码目录：

1.  在左侧项目树中，右键点击 `bean` 文件夹。
2.  选择 **Mark Directory as** (将目录标记为)。
3.  选择 **Sources Root** (源代码根目录)。

**注意：** 虽然方法二能暂时消除 IDE 的报错，但如果这是一个 Maven 项目，打包时 Maven 默认只会去 `src/main/java` 找代码，这会导致你在这个位置写的代码在构建时丢失。所以请尽量使用**方法一**。

[source-gemini3pro](https://aistudio.google.com/app/prompts?state=%7B%22ids%22:%5B%221rJL9BH9T5D4WzhF5ts8CY8_7JclCBlj-%22%5D,%22action%22:%22open%22,%22userId%22:%22116888671330409460116%22,%22resourceKeys%22:%7B%7D%7D&usp=sharing)

#### 结果
![1763969368536.png](https://bu.dusays.com/2025/11/24/6924095a62499.png)

## 实验步骤2

### 文件目录结构及胜利结算画面

![1763971344603.png](https://bu.dusays.com/2025/11/24/69241117803ea.png)

# 数据采集-Flume采集模块

![1763972186807.png](https://bu.dusays.com/2025/11/24/6924145cd461d.png)

# 数据消费-消费者程序

## 代码缺失问题
请直接根据代码中的package确定位置。
```java

package com.educg.elec.common.bean;

public interface Val {
    public void setValue( Object val );
    public Object getValue();
}
```

## 胜利结算画面
![1763974389841.png](https://bu.dusays.com/2025/11/24/69241cf85349a.png)

# 数据存储
这个实验查错误真的是查死人了……

## 实验步骤2: 案例实现
注意这里的代码都应放在 `elec-consumer` 子项目下。

## hbase初始化错误
在将所有代码复制进入虚拟机并放在指定位置后，运行发现没有输出，经调试发现 `dao.init()` 阻塞，以下是解决方法：

[source-gemini2.5pro](https://aistudio.google.com/app/prompts?state=%7B%22ids%22:%5B%221Ej4ecOnwxOW3eGCOp10CV1JhHYAWjsz_%22%5D,%22action%22:%22open%22,%22userId%22:%22116888671330409460116%22,%22resourceKeys%22:%7B%7D%7D&usp=sharing)

在consumer的resource中放入以下文件

- hbase-site.xml
```xml
<?xml version="1.0"?>
<?xml-stylesheet type="text/xsl" href="configuration.xsl"?>
<!--
/**
 *
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
-->
<configuration>
	<property>
		<name>hbase.rootdir</name>
		<value>hdfs://master:9000/hbase-1.1.5/data</value>
	</property>
	<property>
                <name>hbase.cluster.distributed</name>
                <value>true</value>
        </property>
	<property>
		<name>hbase.zookeeper.property.dataDir</name>
		<value>/opt/module/zookeeper-3.4.10/zkData</value>
	</property>
	<property>
                <name>hbase.zookeeper.quorum</name>
<value>master:2181,slave1:2181,slave2:2181,slave3:2181</value>
        </property>
	<property>
                <name>hbase.security.authorization</name>
                <value>false</value>
        </property>

        <property>
                <name>hbase.coprocessor.master.classes</name>
                <value>org.apache.hadoop.hbase.security.access.AccessController</value>
        </property>

        <property>
                <name>hbase.coprocessor.region.classes</name>
                <value>org.apache.hadoop.hbase.security.token.TokenProvider,org.apache.hadoop.hbase.security.access.AccessController</value>
        </property>
</configuration>

```

另外作者还将 master 节点中的 `/opt/module/hbase-1.1.5/conf/hbase-site.xml` 同步成上述形式(修改了安全验证)，但这很可能不是必需的。

## hbase shell
```sh
ssh master
cd /opt/module/hbase-1.1.5/bin/
hbase shell
scan 'elec:eleclog'
```

## 胜利结算画面

请以我的输出为准，请勿相信希冀平台上错误的输出格式。

![1763982788637.png](https://bu.dusays.com/2025/11/24/69243dc666900.png)

# 数据清洗与数据分析

## 创建项目

使用自选的解释器
![1763983762339.png](https://bu.dusays.com/2025/11/24/69244207dafa2.png)

## 运行小寄巧
如图
![1763984568650.png](https://bu.dusays.com/2025/11/24/692444ba9e44d.png)

## 胜利结算画面
![1763983977461.png](https://bu.dusays.com/2025/11/24/6924426c054b7.png)
![1763984187059.png](https://bu.dusays.com/2025/11/24/6924433d55de7.png)
![1763984278421.png](https://bu.dusays.com/2025/11/24/69244398c1965.png)
20061220无数据，以下使用20061230
![1763984413972.png](https://bu.dusays.com/2025/11/24/6924441fce039.png)
![1763984517653.png](https://bu.dusays.com/2025/11/24/692444889f783.png)

# 后话
累死我了，有用的话请夸奖我，谢谢。