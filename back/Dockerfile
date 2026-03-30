FROM node:24-alpine
RUN mkdir /app
COPY . /app
WORKDIR /app
RUN npm i && npm i -g nodemon
CMD ["nodemon", "server.js"]
