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
    app.get('/member/:memberId', memberAPI.findMemberById);

    // Group API
    app.post('/group', groupAPI.createGroup);
    app.get('/group/member/:memberId', groupAPI.getAllMemberGroups);
    app.get('/group/:groupId', groupAPI.findGroupById);
    app.post('/group/:groupId/member', groupAPI.addMemberToGroup);
    app.get('/group/', groupAPI.findGroupsByTags);

    // Event API
    app.post('/event', eventAPI.createEvent);
    app.get('/event/:eventId', eventAPI.getEventById);
    app.get('/event/member/:memberId', eventAPI.getAllMemberCreatedEvents);
    app.get('/event/group/:groupId', eventAPI.getAllGroupEvents);

    app.listen(9000);
    logger.info('Now listening on port 9000');
}

module.exports = app;
