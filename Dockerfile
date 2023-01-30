FROM node:alpine

WORKDIR /app

ENV NODE_ENV=prod

COPY ./package.json ./

RUN yarn install

COPY . .

CMD  ["yarn","start:prod"]