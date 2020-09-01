FROM node:14-alpine

RUN mkdir -p /home/node/app/node_modules && chown -R node:node /home/node/app

WORKDIR /home/node/app

COPY package*.json ./

USER node

RUN npm install

COPY --chown=node:node . .

# configuration, TODO: user docker configuration management
RUN echo "PORT=8080" > .env
RUN echo "MONGO_DB_URL=mongodb://mongo:27017/InfoLearn" >> .env
#RUN echo "MONGO_TEST_DB_URL=mongodb://mongo:27017:27017/InfoLearn-test #test db" >> .env
RUN echo "DEBUG=true #show error messages or not" >> .env
RUN echo "JWT_SECRET=secret123 #JWT pass phrase" >> .env

EXPOSE 8080

CMD [ "npm", "start" ]