const { Group, Member, Event, Post } = require('../../models/Model');

const entityMap = {
    'group': Group,
    'member': Member,
    'event': Event
}

/**
 * Utility method that checks the data store for the
 * given list of entities, throws 404 for the first entity
 * that is not found.
 *
 * @param  {Array} entities - Array of entity information objects of the form:
 *
 *      { type: 'member | group | event | post', id: ObjectId }
 *
 * @return {Promise} - Promise resolves if all entities are found
 */
function verifyEntitiesExist(entities) {
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

module.exports = verifyEntitiesExist;
