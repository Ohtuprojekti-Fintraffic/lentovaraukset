FROM node:19-alpine AS build-stage

WORKDIR /usr/src/app

COPY ./package.json .
COPY ./package-lock.json .
COPY ./shared ./shared
COPY ./frontend ./frontend

RUN npm ci

WORKDIR /usr/src/app/frontend

ENV BASE_PATH=/lentovaraukset

RUN npm run build 


FROM nginx:1.20-alpine

COPY --from=build-stage /usr/src/app/frontend/dist /usr/share/nginx/html