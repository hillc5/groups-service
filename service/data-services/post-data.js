const { Post, Member, Group, Event } = require('../models/Model'),
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

    return checkExistenceById(entities)
            .then(() => {
                const post = new Post(postData);

                logger.info(`${DATA_NAME} - now saving post, ${postData.name}`);
                return post.save();
            });
}

const entityMap = {
    'group': Group,
    'member': Member,
    'event': Event
}

function checkExistenceById(entities) {
    const entityPromises =
        entities
            .map(entity => entityMap[entity.type].findOne({ _id: entity.id }));

    return Promise.all(entityPromises)
            .then(results => {
                results.forEach((result, index) => {
                    if (!result) {
                        const entity = entities[index];
                        throw { status: 404, message: `No ${entity.type} found for ${entity.id}`};
                    }
                });
            });
}

module.exports = {
    savePost
}
