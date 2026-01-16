---
title: picgoCLI+piclist 在vscode-markdown文件中直接导入图床上图片
date: 2025-12-16 11:45:26
tags:
cover: https://bu.dusays.com/2026/01/16/696a47447c841.jpg
---

使用 `picgo`(cli) + `piclist`(vscode plugin) 实现在vscode-markdown文件中直接导入图床上图片

```sh
npm install picgo -g
```

在 `~/.picgo/config.json` 中完善配置

```json
{
  "picBed": {
    "current": "smms",
    "uploader": "lankong",
    "lankong": {
      "lskyProVersion": "V2",
      "server": "https://server_url",
      "token": "Bearer Token",
      "strategyId": "",
      "albumId": "",
      "permission": "private(default)",
      "ignoreCertErr": false,
      "syncDelete": false
    }
  },
  "picgoPlugins": {
    "picgo-plugin-lankong": true
  }
}
```

在vscode中搜索 `piclist` 并安装即可，在md文件插入位置按下 `Crtl+Alt+U`
