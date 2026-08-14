FROM node:20-bookworm-slim

WORKDIR /app

COPY package.json ./
RUN npm install --omit=dev

COPY . ./

ENV NODE_ENV=production \
    PIPI_API_HOST=0.0.0.0 \
    PIPI_API_PORT=8787 \
    PIPI_LEGACY_PORTS=0

EXPOSE 8787

CMD ["npm", "start"]
