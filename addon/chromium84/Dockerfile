ARG BUILD_FROM=ghcr.io/home-assistant/base:latest
FROM --platform=$BUILDPLATFORM node:22 AS builder
WORKDIR /app

# Bump the add-on version in config.yaml whenever this pinned revision changes.
ARG FUSION_REVISION=f4df0d76caeb82ee0dec6016859d5f5072776fad
RUN git init --quiet && \
    git fetch --depth 1 https://github.com/hubertpi/ha-fusion.git "${FUSION_REVISION}" && \
    git checkout --quiet --detach FETCH_HEAD

RUN npm install --global pnpm@11.25.0 && \
    pnpm install --frozen-lockfile && \
    pnpm build && \
    pnpm prune --prod

FROM ${BUILD_FROM}
WORKDIR /rootfs

RUN apk add --no-cache nodejs-current && ln -s /data ./data
COPY --from=builder /app/build ./build
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/server.js /app/package.json ./
COPY --chmod=755 run.sh /run.sh

ENV PORT=8099 NODE_ENV=production ADDON=true
CMD ["/run.sh"]
