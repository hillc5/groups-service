const bunyan = require('bunyan');

module.exports = bunyan.createLogger({ name: 'groups-service', level: 'info' });
