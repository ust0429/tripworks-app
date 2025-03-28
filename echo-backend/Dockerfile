FROM node:18-slim

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY dist/ ./dist/

# Cloud Run実行時のユーザーは非特権ユーザー
USER node

CMD [ "node", "dist/index.js" ]