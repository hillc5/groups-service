const mongoose = require('mongoose'),
      config = require('config'),

      logger = require('./util/logger');

function connect() {
    return new Promise((resolve, reject) => {

        logger.info('Connecting to DB...');
        let connection = mongoose.connect(config.database.host).connection;
        connection.on('open', resolve(connection));
        connection.on('error', reject('Connection Error'));

    });
}

module.exports = connect;
