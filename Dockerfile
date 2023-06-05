FROM node:alpine

RUN npm install yarn

RUN apt -y update

RUN apt -y install python3-pip

WORKDIR /app

ENV NODE_ENV=prod

COPY ./package.json ./

RUN yarn install

COPY . .

CMD  ["yarn","start:dev"]