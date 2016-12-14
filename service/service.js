const express = require('express'),
      expressValidator = require('express-validator'),
      bodyParser = require('body-parser'),
      morgan = require('morgan'),

      logger = require('./util/logger'),
      connect = require('./db'),

      groupAPI = require('./api-services/group-api'),
      memberAPI = require('./api-services/member-api');


connect().then(startService);

function startService() {
    const app = express();

    app.listen(9000);
    logger.info('Now listening on port 9000');

    app.use(morgan('dev'));
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
    app.get('/group/', groupAPI.findGroupsByTags);
}

