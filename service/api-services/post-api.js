const validateRequest = require('./util/api-validation'),
      handleError = require('./util/api-error-handler'),
      postData = require('../data-services/post-data');

function createPost(req, res) {
    const bodyOptions = [ 'name', 'text', 'memberId', 'groupId', 'eventId' ];

    validateRequest({ req, bodyOptions })
        .then(() => {
            const {
                name,
                text,
                memberId: owner,
                groupId: group,
                eventId: event } = req.body,

                newPost = {
                    text,
                    name,
                    owner,
                    group,
                    event,
                    replies: [],
                    postDate: new Date()
                };

            return postData.savePost(newPost);
        })
        .then(result => {
            res.status(201).send(result);
        })
        .catch(handleError(res));
}

function addReply(req, res) {
    const paramOptions = [ 'postId' ],
          bodyOptions = [ 'name', 'text', 'memberId', 'groupId', 'eventId' ];

    validateRequest({ req, bodyOptions, paramOptions })
        .then(() => {
            const {
                name,
                text,
                memberId: owner,
                groupId: group,
                eventId: event
            } = req.body,

            newPost = {
                text,
                name,
                owner,
                group,
                event,
                replies: [],
                postDate: new Date()
            };

            return postData.savePost(newPost);
        })
        .then(post => {
            const { _id: replyId } = post,
                  { postId } = req.params;

            return postData.addReplyToPost(postId, replyId);
        })
        .then(result => {
            res.status(200).send(result);
        })
        .catch(handleError(res));
}


module.exports = {
    createPost,
    addReply
};
