FROM node:22-alpine AS builder
WORKDIR /api
COPY api/package*.json ./
RUN npm ci
COPY api/ .
RUN npm run build

FROM node:22-alpine
WORKDIR /api
COPY --from=builder /api/package*.json ./
COPY --from=builder /api/dist ./dist 

RUN npm ci --omit=dev

EXPOSE 3000
CMD ["npm", "run", "start:prod"]