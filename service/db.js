const mongoose = require('mongoose'),
      { url } = require('./service.config');

function connect() {
    return new Promise((resolve, reject) => {
        // Set mongoose to use native Promises
        mongoose.Promise = global.Promise;

        let connection = mongoose.connect(url).connection;
        connection.on('open', resolve(connection));
        connection.on('error', reject('Connection Error'));
    });
}

module.exports = connect;
