const express = require('express'),
      expressValidator = require('express-validator'),
      bodyParser = require('body-parser'),
      morgan = require('morgan'),

      config = require('config'),

      logger = require('./util/logger'),
      connect = require('./db'),

      groupAPI = require('./api-services/group-api'),
      eventAPI = require('./api-services/event-api'),
      postAPI = require('./api-services/post-api'),
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

    // Member API
    app.post('/member', memberAPI.createMember);
    app.get('/member/:memberId', memberAPI.findMemberById);
    app.get('/member/:memberId/groups', memberAPI.getAllMemberGroups);
    app.get('/member/:memberId/events', memberAPI.getAllMemberEvents);
    app.get('/member/:memberId/posts', memberAPI.getAllMemberPosts);

    // Group API
    app.post('/group', groupAPI.createGroup);
    app.get('/group/:groupId', groupAPI.findGroupById);
    app.get('/group/:groupId/events', groupAPI.getAllGroupEvents);
    app.get('/group/:groupId/posts', groupAPI.getAllGroupPosts);
    app.post('/group/:groupId/member', groupAPI.addMemberToGroup);
    app.get('/group/', groupAPI.findGroupsByTags);

    // Event API
    app.post('/event', eventAPI.createEvent);
    app.get('/event/:eventId', eventAPI.getEventById);
    app.get('/event/:eventId/posts', eventAPI.getAllEventPosts);
    app.post('/event/:eventId/invite', eventAPI.memberInvite);
    app.post('/event/:eventId/attend', eventAPI.memberAttend);

    // Post API
    app.post('/post', postAPI.createPost);
    app.post('/post/:postId/reply', postAPI.createAndAddReply);

    app.listen(9000);
    logger.info('Now listening on port 9000');
}

module.exports = app;
