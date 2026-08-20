FROM node:22-bookworm-slim AS build

WORKDIR /app
ENV DATABASE_URL=postgresql://build:build@localhost:5432/build

RUN apt-get update \
  && apt-get install -y --no-install-recommends openssl ca-certificates \
  && rm -rf /var/lib/apt/lists/*

COPY package.json package-lock.json ./
COPY apps/api/package.json apps/api/package.json
COPY packages/mard-palette/package.json packages/mard-palette/package.json
COPY packages/pattern-engine/package.json packages/pattern-engine/package.json
COPY packages/shared-types/package.json packages/shared-types/package.json
RUN npm ci

COPY . .
RUN node node_modules/prisma/build/index.js generate --schema apps/api/prisma/schema.prisma \
  && npm run build:engine \
  && npm run build:api \
  && chmod +x deploy/entrypoint.sh

FROM node:22-bookworm-slim AS runtime

WORKDIR /app
ENV NODE_ENV=production

RUN apt-get update \
  && apt-get install -y --no-install-recommends openssl ca-certificates \
  && rm -rf /var/lib/apt/lists/* \
  && useradd --system --uid 10001 --create-home appuser

COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/apps/api/dist ./apps/api/dist
COPY --from=build /app/apps/api/prisma ./apps/api/prisma
COPY --from=build /app/packages ./packages
COPY --from=build /app/deploy/entrypoint.sh ./deploy/entrypoint.sh

RUN mkdir -p /data/patterns && chown -R appuser:appuser /app /data/patterns
USER appuser

EXPOSE 3000
ENTRYPOINT ["/app/deploy/entrypoint.sh"]
