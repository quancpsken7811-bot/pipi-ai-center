FROM node:20-bookworm-slim

WORKDIR /app

COPY package.json ./
RUN npm install --omit=dev

# 该解密模块由服务端启动时直接 require；显式复制以避免构建上下文规则变动时遗漏。
COPY wechat-video-decrypt.js ./
COPY . ./

ENV NODE_ENV=production \
    PIPI_API_HOST=0.0.0.0 \
    PIPI_API_PORT=8787 \
    PIPI_LEGACY_PORTS=0

EXPOSE 8787

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:8787/api/health').then(r => process.exit(r.ok ? 0 : 1)).catch(() => process.exit(1))"

CMD ["npm", "start"]
