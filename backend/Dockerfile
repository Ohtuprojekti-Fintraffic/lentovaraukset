FROM node:19-alpine

WORKDIR /usr/src/app

COPY ./package.json .
COPY ./package-lock.json .
COPY ./shared ./shared
COPY ./backend ./backend

RUN npm ci

WORKDIR /usr/src/app/backend

RUN npm run build

EXPOSE 8080

CMD node build/app.js