FROM node:22-bookworm-slim

# Build context must be the repo root (see render.yaml).
# Layout:
#   /app          → server package (WORKDIR)
#   /shared       → Vision prompt/schema single source of truth
# From /app/src, import '../../shared/...' resolves to /shared/...

WORKDIR /app

# Native deps for @imgly/background-removal-node (onnxruntime)
RUN apt-get update \
  && apt-get install -y --no-install-recommends ca-certificates \
  && rm -rf /var/lib/apt/lists/*

COPY server/package.json server/package-lock.json ./
RUN npm ci

COPY server/src ./src
COPY shared /shared

ENV NODE_ENV=production
ENV PORT=8787

EXPOSE 8787

CMD ["npm", "start"]
