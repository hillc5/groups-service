const bunyan = require('bunyan')
      logger = bunyan.createLogger({ name: 'groups-service', level: 'info' });

if (process.env.NODE_ENV === 'test') {
    logger.level('error');
}

module.exports = logger;
