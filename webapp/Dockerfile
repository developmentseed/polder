FROM node:alpine
WORKDIR /app
RUN corepack enable && corepack prepare yarn@stable --activate
COPY package.json /app
RUN yarn install
COPY . /app
CMD ["yarn", "run", "start"]
