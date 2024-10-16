FROM node:alpine
WORKDIR /app
COPY webapp/package.json /app
RUN yarn install
COPY webapp/. /app
CMD ["yarn", "run", "start"]