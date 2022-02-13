FROM node:latest

WORKDIR /app

COPY package.json .

RUN yarn install

COPY . .

EXPOSE 6000

CMD [ "yarn","run","dev"]
