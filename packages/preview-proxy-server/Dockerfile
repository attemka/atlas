FROM node:18

WORKDIR /app

COPY . .

RUN yarn --immutable
RUN yarn proxy-server:build

EXPOSE 8080
CMD [ "node", "dist/main.js" ]