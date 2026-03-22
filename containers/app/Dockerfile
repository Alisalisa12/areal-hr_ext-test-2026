FROM node:22-alpine AS builder

WORKDIR /app

COPY app/package*.json ./

RUN npm ci --ignore-scripts

COPY app/ .

RUN npm run build

FROM nginx:stable-alpine

COPY --from=builder /app/dist/spa /usr/share/nginx/html

COPY containers/app/nginx.conf /etc/nginx/conf.d/default.conf


EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]