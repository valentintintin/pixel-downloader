FROM node:12-alpine AS BUILD_IMAGE
RUN apk update && apk add python make g++ && rm -rf /var/cache/apk/*

WORKDIR /app/api
COPY ./api/package*.json ./
RUN npm ci
COPY ./api/. .
RUN npm run build && npm prune --production

WORKDIR /app/ui
COPY ./pixel-downloader/package*.json ./
RUN npm ci
COPY ./pixel-downloader .
RUN npm run build && npm prune --production


FROM node:12-alpine

WORKDIR /app
COPY --from=BUILD_IMAGE /app/api/dist ./dist
COPY --from=BUILD_IMAGE /app/api/public ./public
COPY --from=BUILD_IMAGE /app/api/node_modules ./node_modules

EXPOSE 3000
CMD [ "node", "./dist/index.js" ]
