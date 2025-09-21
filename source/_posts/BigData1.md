---
title: BigData-1 HDFS Command
date: 2025-09-21 18:45:55
tags: 大数据
cover: https://bu.dusays.com/2025/06/05/6840f476db804.png
---

## 步骤3 

### ssh连接hadoop服务器

```sh
ssh master
ssh slave1
ssh slave2
ssh slave3
```

建议开启五个tab，最后一个是主机，不执行任何ssh命令

### terminal开启更多tab

左上角file->open tab

## 步骤4

在master的tab中执行：

```sh
bash /scripts/hadoop/start-hadoop.sh
```

在主机tab中执行：
```sh
mkdir -p ~/Desktop/workspace/hdfs_op
cd ~/Desktop/workspace/hdfs_op
```

## 步骤5

如果需要创建多层目录，可以使用参数“-p”

主机tab:

查看目录列表
```sh
hadoop fs -ls /
```

创建目录
```sh
hadoop fs -mkdir /newDir
```

删除目录
```sh
hadoop fs -rm -r /newDir
```

## 步骤6

查看当前目录位置
```sh
pwd
```

创建hello.txt
```sh
echo "hello" > hello.txt
```

将文件放入数据库
```sh
hadoop fs -put hello.txt /newDir
```

查看数据库文件
```sh
hadoop fs -cat /newDir/hello.txt
```

从数据库下载文件hello_get.txt
```sh
hadoop fs -get /newDir/hello.txt hello_get.txt
```

本地查看文件
```sh
cat hello_get.txt
```

查看文件大小
> 上面这个是本地
> 下面这个是数据库
```sh
ls -l hello.txt
hadoop fs -du /newDir
```

复制文件
```sh
hadoop fs -cp /newDir/hello.txt /newDir/hello_cp.txt
```

移动文件
> 也可以用来重命名
```sh
hadoop fs -mv /newDir/hello.txt /newDir/hello_mv.txt
```

权限管理
```sh
hadoop fs -chmod 777 /newDir/hello_mv.txt
```

删除文件
```sh
hadoop fs -rm /newDir/hello_mv.txt
```

## 步骤7
查看文件系统信息
```sh
hadoop fs -df -h
```

## 步骤8 习题
均在master tab完成
```sh
hadoop fs -mkdir /mydir
echo "hello" > number.txt
hadoop fs -put number.txt /mydir
hadoop fs -ls /mydir
hadoop fs -cat /mydir/number.txt
hadoop fs -mv /mydir/number.txt /mydir/homework.txt
hadoop fs -ls /mydir
hadoop fs -chmod 600 /mydir/homework.txt
hadoop fs -ls /mydir
```