FROM node:22-bookworm-slim

WORKDIR /app

# Native deps for @imgly/background-removal-node (onnxruntime)
RUN apt-get update \
  && apt-get install -y --no-install-recommends ca-certificates \
  && rm -rf /var/lib/apt/lists/*

COPY package.json package-lock.json ./
RUN npm ci

COPY src ./src

ENV NODE_ENV=production
ENV PORT=8787

EXPOSE 8787

CMD ["npm", "start"]
