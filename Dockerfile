FROM node:24-slim
WORKDIR /app
COPY server/package.json ./package.json
RUN npm install --omit=dev
COPY server ./server
COPY src ./src
COPY content ./content
COPY public ./public
ENV YICAN_HOST=0.0.0.0
ENV YICAN_DATA_DIR=/data
EXPOSE 3000
CMD ["sh", "-c", "YICAN_PORT=${PORT:-3000} exec npx tsx server/index.ts"]
