const express = require('express'),
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

    app.post('/member', memberAPI.createMember);
    app.get('/member/:id', memberAPI.findMemberById);

    app.post('/member/:id/group', groupAPI.createGroup);
}

