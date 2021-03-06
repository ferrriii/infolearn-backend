# InfoLearn Backend
InfoLearn is a social network for learning. You can publish short texts and InfoLearn repeats these texts for you to memorize them.

This repository is the backend code in Nodejs. it proivdes all APIs for frontend.

![](resources/infolearn-demo.gif)

## Setup
Create an `.env` file in the root with below contents.
You also need a running MongoDB to connect.
```
PORT=80 #api port
MONGO_DB_URL=mongodb://localhost:27017/InfoLearn #database url
MONGO_TEST_DB_URL=mongodb://localhost:27017/InfoLearn-test #test db
DEBUG=true #show error messages or not
JWT_SECRET=secret123 #JWT pass phrase
```
then
```
npm install
```
See [InfoLearn frontend repositry](https://github.com/ferrriii/infolearn-frontend) for frontend.


### Run
Make sure mongo server is up and then:
```
npm run start
```
### OR Use Docker
```
docker-compose up
```

### Test
```
npm run test
```
### Check with Flow
```
npm run flow
```