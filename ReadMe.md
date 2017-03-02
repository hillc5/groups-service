### Running the service in Dev mode

```bash
# In dev
# If no data dir or db file:
mkdir data && mkdir data/db
# start mongo @default port 27017
npm run start-dev-mongo
# start the service
npm run service
```

### Running the tests
```bash
# make sure service is not running
# mkdir data && mkdir data/db if they don't exist
# if mongo not running you need to start
npm run start-test-mongo
# then
npm run test
```
