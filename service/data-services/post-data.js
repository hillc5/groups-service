const { Post } = require('../models/Model'),
      logger = require('../util/logger'),

      DATA_NAME = 'POST_DATA';

function savePost(postData) {
    const post = new Post(postData);

    logger.info(`${DATA_NAME} - now saving post, ${postData.name}`);
    return post.save();
}

module.exports = {
    savePost
}
