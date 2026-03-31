# Rainyun 部署说明

这个仓库已经改成：

- `master` 保存站点代码、主题配置、GitHub Actions 工作流
- `content` 保存文章和页面内容
- GitHub Actions 在 `master` 或 `content` 更新后自动构建，并把 `public/` 同步到 Rainyun

## 1. 准备 Rainyun 服务器

推荐使用一台 Linux 云服务器，并保证：

- 可以通过 SSH 登录
- 已安装 `nginx`
- 已安装 `rsync`
- 站点目录已经创建，例如 `/var/www/emptydust`

Rainyun 官方文档：

- 连接服务器: https://www.rainyun.com/docs/rgs/detail/connect/
- 管理实例与绑定域名入口: https://www.rainyun.com/docs/rgs/detail/manage/
- 如果你想用面板，也可以直接预装 1Panel: https://www.rainyun.com/docs/guide/cloud/1panel/

## 2. 服务器初始化

以 Ubuntu/Debian 为例：

```bash
sudo apt update
sudo apt install -y nginx rsync
sudo mkdir -p /var/www/emptydust
sudo chown -R $USER:$USER /var/www/emptydust
```

## 3. Nginx 配置示例

把下面内容保存为 `/etc/nginx/sites-available/emptydust.conf`：

```nginx
server {
  listen 80;
  server_name example.com www.example.com;

  root /var/www/emptydust;
  index index.html;

  location / {
    try_files $uri $uri/ =404;
  }

  location = /search.json {
    add_header Cache-Control "no-cache";
  }
}
```

启用配置：

```bash
sudo ln -sf /etc/nginx/sites-available/emptydust.conf /etc/nginx/sites-enabled/emptydust.conf
sudo nginx -t
sudo systemctl reload nginx
```

如果已经绑定域名并准备上 HTTPS，再额外配置证书即可。

## 4. GitHub Secrets

在 GitHub 仓库里配置以下 Secrets：

- `RAINYUN_HOST`
- `RAINYUN_PORT`
- `RAINYUN_USER`
- `RAINYUN_TARGET_DIR`
- `RAINYUN_SSH_KEY`
- `RAINYUN_POST_DEPLOY` 可选
- `SITE_URL` 可选
- `SITE_ROOT` 可选

推荐值示例：

```text
RAINYUN_HOST=1.2.3.4
RAINYUN_PORT=22
RAINYUN_USER=root
RAINYUN_TARGET_DIR=/var/www/emptydust
RAINYUN_POST_DEPLOY=sudo systemctl reload nginx
SITE_URL=https://example.com/
SITE_ROOT=/
```

`RAINYUN_SSH_KEY` 使用 GitHub Actions 专用私钥，对应公钥要加入服务器：

```bash
mkdir -p ~/.ssh
chmod 700 ~/.ssh
cat >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys
```

把公钥粘进去保存即可。

## 5. 触发部署

部署会在这些情况下自动执行：

- push 到 `master`
- push 到 `content`
- 手动触发 `workflow_dispatch`

工作流会执行：

1. checkout `master`
2. 拉取并导入 `content`
3. 安装主题与依赖
4. `hexo clean && hexo bangumi -u && hexo generate`
5. `rsync --delete` 上传 `public/` 到 Rainyun

## 6. 本地核对点

如果线上访问异常，优先检查：

- `SITE_URL` 是否和最终域名一致
- `RAINYUN_TARGET_DIR` 是否就是 Nginx 的 `root`
- SSH 端口和用户是否正确
- 服务器是否安装了 `rsync`
- Nginx 是否已 reload
