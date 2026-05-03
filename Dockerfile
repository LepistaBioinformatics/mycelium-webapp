# syntax=docker/dockerfile:1
# Build context: mycelium-webapp repo root

# ---------------------------------------------------------------------------
# Stage 1 — builder
# ---------------------------------------------------------------------------
FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

COPY . .

ARG VITE_MYCELIUM_API_URL=https://api.lepista.io
ENV VITE_MYCELIUM_API_URL=${VITE_MYCELIUM_API_URL}

RUN yarn build

# ---------------------------------------------------------------------------
# Stage 2 — runner
# ---------------------------------------------------------------------------
FROM nginx:1.27-alpine AS runner

RUN rm -rf /usr/share/nginx/html/*

COPY --from=builder /app/dist/ /usr/share/nginx/html/

COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
