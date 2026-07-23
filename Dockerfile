FROM oven/bun:1-alpine AS builder

WORKDIR /app

COPY package.json bun.lockb ./
RUN bun install --frozen-lockfile

COPY . .

ENV NITRO_PRESET=node-server

RUN bun run build

FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=3000

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 markdownweb

COPY --from=builder /app/.output ./.output

USER markdownweb

EXPOSE 3000

CMD ["node", ".output/server/index.mjs"]
