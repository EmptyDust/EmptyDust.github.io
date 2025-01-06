---
title: transformer_replication
date: 2024-12-28 17:15:46
tags: '机器学习'
---

# 复现transformer

## day1 配置环境&下载数据集

```shell
conda create --name transformer python=3.8 -y
conda activate transformer
pip install torch torchvision torchaudio
```

```sh
pip install datasets
```

如果没有安装上

```sh
conda install -c conda-forge datasets
```

然后配置环境变量修改到国内镜像
```sh
pip install -U huggingface_hub
export HF_ENDPOINT=https://hf-mirror.com
```

数据集：https://huggingface.co/datasets/wmt/wmt14

运行代码下载
```py
from datasets import load_dataset


ds = load_dataset("wmt/wmt14", "de-en")

print(ds)

print(ds['train'][0:5])
```

数据集下载在了
```
~/.cache/huggingface/datasets/wmt___wmt14/
```

[本地配置](https://blog.csdn.net/CoolBoySilverBullet/article/details/123365452)

## day2 

# inference
[hf-mirror （huggingface 的国内镜像）](https://blog.csdn.net/weixin_40959890/article/details/140319652)
