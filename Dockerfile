FROM node:latest

ENV PORT=3000
ENV ACCESS_TOKEN_SECRET=your_access_token_secret_here
ENV REFRESH_TOKEN_SECRET=your_refresh_token_secret_here
ENV ACCESS_TOKEN_LIFE=15m
ENV REFRESH_TOKEN_LIFE=7d
ENV MONGO_URI=mongodb://mongo:27017/matcher-app
ENV REDIS_URI=redis-13659.c13.us-east-1-3.ec2.cloud.redislabs.com
ENV REDIS_PASS=QLDDNqxqZdQWdPgZZY3TR2pVcfeD4wZF
ENV REDIS_PORT=13659
ENV NODEMAILER_EMAIL=productionsastek@gmail.com
ENV NODEMAILER_PASS=zwetwgnezvtorpbk

WORKDIR /usr/src/app

COPY package.json ./
RUN npm install

RUN npm install -g nodemon

COPY . .

USER node

EXPOSE 3000

CMD [ "nodemon", "app.js" ]