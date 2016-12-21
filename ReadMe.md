### Running the service

```bash
# In dev
# If no data dir or db file:
mkdir data && mkdir data/db
# start mongo @default port 27017
mongod --dbpath=data/db
# start the service
npm run service
```

### Running the tests
```bash
# make sure service is not running
# if mongo not running you need to start it
# mkdir data && mkdir data/db if they don't exist
# mongod --dbpath=data/db
npm run test
```
