FROM node:19-alpine as build-stage

WORKDIR /usr/src/app

COPY ./package.json .
COPY ./package-lock.json .
COPY ./shared ./shared
COPY ./backend ./backend
COPY ./tsconfig.json .

RUN npm ci

RUN npm run build


FROM node:19-alpine

WORKDIR /usr/src/app

COPY --from=build-stage /usr/src/app/build .

RUN npm ci

EXPOSE 8080

CMD node ./backend/src/index.js
