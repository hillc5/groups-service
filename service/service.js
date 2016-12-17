const express = require('express'),
      expressValidator = require('express-validator'),
      bodyParser = require('body-parser'),
      morgan = require('morgan'),

      config = require('config'),

      logger = require('./util/logger'),
      connect = require('./db'),

      groupAPI = require('./api-services/group-api'),
      memberAPI = require('./api-services/member-api');


const app = express();
connect().then(startService);

function startService() {
    logger.info('DB connection successful');
    if (config.util.getEnv('NODE_ENV') !== 'test') {
        app.use(morgan('dev'));
    }

    // body parser parses body and url params and places them on the req
    // object as simple attributes
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true }));

    // Adds validation methods to req object
    app.use(expressValidator());

    app.post('/member', memberAPI.createMember);
    app.get('/member/:id', memberAPI.findMemberById);

    app.post('/member/:id/group', groupAPI.createGroup);
    app.get('/member/:id/group', groupAPI.getAllMemberGroups);
    app.get('/group/:id', groupAPI.findGroupById);
    app.post('/group/:id/member/:memberId', groupAPI.addMemberToGroup);
    app.get('/group/', groupAPI.findGroupsByTags);

    app.listen(9000);
    logger.info('Now listening on port 9000');
}

module.exports = app;
