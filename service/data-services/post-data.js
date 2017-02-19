const { Post } = require('../models/Model'),
      verifyEntitiesExist = require('./util/data-utils'),
      logger = require('../util/logger'),

      DATA_NAME = 'POST_DATA';

function savePost(postData) {
    const { owner, group, event } = postData,
          entities = [
              { type: 'member', id: owner },
              { type: 'group', id: group }
          ];

    if (event) {
        entities.push({ type: 'event', id: event });
    }

    return verifyEntitiesExist(entities)
            .then(() => {
                const post = new Post(postData);

                logger.info(`${DATA_NAME} - now saving post, ${postData.name}`);
                return post.save();
            });
}

function findPosts(query={}, fields='', refOptions=[]) {
    let postQuery = Post.find(query)
                        .select(fields)
                        .populate(refOptions);

    logger.info(`${DATA_NAME} - find posts by ${JSON.stringify(query)}`);
    return postQuery.exec();
}

module.exports = {
    savePost,
    findPosts
}
