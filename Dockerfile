# Etapa de build
FROM node:22-bullseye-slim AS builder

WORKDIR /usr/src/app

# Update and upgrade system packages to patch vulnerabilities
RUN apt-get update && apt-get upgrade -y && apt-get clean

COPY package*.json ./
COPY . .

RUN npm install --frozen-lockfile \
  && npm run build

FROM node:22-bullseye-slim

WORKDIR /usr/src/app

# Update and upgrade system packages to patch vulnerabilities
RUN apt-get update && apt-get upgrade -y && apt-get clean

COPY --from=builder /usr/src/app/package*.json ./
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/migrations ./migrations
COPY --from=builder /usr/src/app/typeOrm.config.ts ./typeOrm.config.ts

EXPOSE 3000

CMD ["node", "dist/main.js"]