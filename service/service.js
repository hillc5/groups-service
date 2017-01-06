const express = require('express'),
      expressValidator = require('express-validator'),
      bodyParser = require('body-parser'),
      morgan = require('morgan'),

      config = require('config'),

      logger = require('./util/logger'),
      connect = require('./db'),

      groupAPI = require('./api-services/group-api'),
      eventAPI = require('./api-services/event-api'),
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

    // TODO
    // Rewrite APIs to emphasize body parameters
    // rather than request parameters
    // e.g. POST - group/:groupId/member/:memberId/event
    // becomes POST - /event with groupId and memberId in
    // body parameters.
    //
    // Should result in a much cleaner API

    // Member API
    app.post('/member', memberAPI.createMember);
    app.get('/member/:id', memberAPI.findMemberById);

    // Group API
    app.post('/member/:id/group', groupAPI.createGroup);
    app.get('/member/:id/group', groupAPI.getAllMemberGroups);
    app.get('/group/:id', groupAPI.findGroupById);
    app.post('/group/:id/member/:memberId', groupAPI.addMemberToGroup);
    app.get('/group/', groupAPI.findGroupsByTags);

    // Event API
    app.post('/group/:groupId/member/:memberId/event', eventAPI.createEvent);
    app.get('/event/:id', eventAPI.getEventById);
    app.get('/member/:memberId/event', eventAPI.getAllMemberCreatedEvents);
    app.get('/group/:groupId/event', eventAPI.getAllGroupEvents);

    app.listen(9000);
    logger.info('Now listening on port 9000');
}

module.exports = app;
