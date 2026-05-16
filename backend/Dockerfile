# Backend Dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install --only=production
COPY . .

FROM node:20-alpine
WORKDIR /app
RUN addgroup -g 1001 -S nodejs && adduser -S nodeuser -u 1001
COPY --from=builder /app .
USER nodeuser
EXPOSE 5000
HEALTHCHECK --interval=30s --timeout=3s CMD wget -q --spider http://localhost:5000/api/health || exit 1
CMD ["node", "src/server.js"]
