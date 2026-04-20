FROM node:20-slim

# Dependencias del sistema para chrome-headless-shell (Remotion)
RUN apt-get update && apt-get install -y \
  libnspr4 libnss3 libatk1.0-0 libatk-bridge2.0-0 \
  libcups2 libdrm2 libxkbcommon0 libxcomposite1 \
  libxdamage1 libxfixes3 libxrandr2 libgbm1 \
  libpango-1.0-0 libcairo2 libasound2 libexpat1 \
  libx11-6 libx11-xcb1 libxcb1 libxext6 \
  fonts-liberation ca-certificates \
  --no-install-recommends && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY package*.json ./
RUN npm install

COPY . .

RUN mkdir -p public out

EXPOSE 3001
CMD ["node", "server/app.js"]
