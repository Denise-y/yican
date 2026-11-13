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
ENV TZ=Asia/Shanghai
EXPOSE 80
CMD ["sh", "-c", "YICAN_PORT=${PORT:-80} exec npx tsx server/index.ts"]
