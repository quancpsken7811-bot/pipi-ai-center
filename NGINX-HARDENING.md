# 生产站点 Nginx 加固

此配置只用于生产域名 `ai.pyshanxingtianxia.com` 的 HTTPS `server` 块，
不会影响本机 `localhost` 开发入口。

创建服务器文件 `/etc/nginx/snippets/pipi-ai-center-security.conf`，内容如下：

```nginx
gzip on;
gzip_vary on;
gzip_proxied any;
gzip_comp_level 5;
gzip_min_length 1024;
gzip_types text/plain text/css application/javascript application/json application/manifest+json image/svg+xml;

add_header X-Frame-Options "DENY" always;
add_header X-Content-Type-Options "nosniff" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
add_header Permissions-Policy "camera=(), microphone=(), geolocation=()" always;
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
add_header Content-Security-Policy "default-src 'self'; base-uri 'self'; object-src 'none'; frame-ancestors 'none'; form-action 'self'; img-src 'self' data: blob: https:; media-src 'self' blob: https:; style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-inline'; connect-src 'self'; font-src 'self' data:; worker-src 'self' blob:;" always;
```

然后在该站点 `listen 443 ssl` 对应的 `server {}` 内加入：

```nginx
include /etc/nginx/snippets/pipi-ai-center-security.conf;
```

仅在 `sudo nginx -t` 成功后才可执行 `sudo systemctl reload nginx`。

不要为了隐藏版本号而盲目更换 Ubuntu 自带的 Nginx 主版本；保持系统安全更新即可。
若要隐藏版本号，可在 `/etc/nginx/nginx.conf` 的 `http {}` 中加入：

```nginx
server_tokens off;
```
