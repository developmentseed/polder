FROM node:20-alpine as build
WORKDIR /src
RUN corepack enable && corepack prepare yarn@stable --activate
COPY . .
RUN yarn install 
RUN yarn build
RUN ls -la .

FROM nginx:alpine
COPY --from=build /src/dist /usr/share/nginx/html
EXPOSE 8080
