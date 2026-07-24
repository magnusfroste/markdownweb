FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --legacy-peer-deps

COPY . .

ENV NITRO_PRESET=node-server

RUN npm run build

FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=3000
ENV DATA_DIR=/data

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 markdownweb

RUN mkdir -p /data && chown -R markdownweb:nodejs /data

COPY --from=builder /app/.output ./.output

VOLUME ["/data"]

USER markdownweb

EXPOSE 3000

CMD ["node", ".output/server/index.mjs"]
