# 皮皮 AI 中台上线清单

本项目通过 Docker 在服务器本机 `127.0.0.1:8787` 运行，由 Nginx 负责 HTTPS、域名与安全响应头。不要把容器端口直接暴露到公网。

## 1. 上线前必填环境变量

从 `.env.example` 复制为服务器上的私有 `.env`。以下项必须替换成真实值，且不要提交或打包进代码仓库：

- `PIPI_AUTH_SECRET`：随机长字符串，建议执行 `openssl rand -hex 32` 生成。
- `PIPI_BOOTSTRAP_ADMIN_PASSWORD`：至少 12 位的管理员初始密码。
- `PIPI_ACCOUNT_DELETION_PASSWORD`：后台删除非管理员账号时必须输入的独立确认密码。
- `SILICONFLOW_API_KEY`、`ARK_API_KEY`、`TIKHUB_API_KEY`：按实际启用服务填写。
- `PIPI_ALLOWED_ORIGINS`：正式域名，例如 `https://ai.pyshanxingtianxia.com`。
- `PIPI_DATA_DIR=/app/data`：容器内持久化目录。

自助注册已设为开启状态：新注册账号没有任何 AI 功能权限，需要管理员在后台开通。注册接口有基础的 IP 频率限制。

## 2. 构建与启动

在服务器的发布目录执行：

```bash
sudo docker build -t pipi-ai-center:release .
sudo docker rm -f pipi-ai-center || true
sudo docker run -d --name pipi-ai-center --restart unless-stopped \
  --env-file /home/ubuntu/pipi-ai-center.env \
  -p 127.0.0.1:8787:8787 \
  -v /home/ubuntu/pipi-data:/app/data \
  pipi-ai-center:release
```

发布前请将 `/home/ubuntu/pipi-ai-center.env` 权限设为仅管理员可读，例如 `chmod 600 /home/ubuntu/pipi-ai-center.env`。

## 3. Nginx

将站点反向代理到 `http://127.0.0.1:8787`，并在 HTTPS server 块引入 `NGINX-HARDENING.md` 中的安全片段。还需要设置：

```nginx
client_max_body_size 32m;
proxy_set_header Host $host;
proxy_set_header X-Real-IP $remote_addr;
proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
proxy_set_header X-Forwarded-Proto $scheme;
```

## 4. 发布后验收

```bash
curl -fsS http://127.0.0.1:8787/api/health
sudo docker ps --filter name=pipi-ai-center
sudo docker logs --tail 80 pipi-ai-center
curl -sSI https://ai.pyshanxingtianxia.com/
```

确认健康接口返回 `code: 0`、容器状态为 `healthy`，再验证：管理员登录、自助注册、管理员开通权限、图片上传识图、任一文案智能体、销售模拟与素材库链接。

## 5. 回滚

上线前保留当前镜像标签和 `/home/ubuntu/pipi-data` 的压缩备份。出现异常时，用上一镜像标签重新执行第 2 步即可；不要删除持久化数据目录。
