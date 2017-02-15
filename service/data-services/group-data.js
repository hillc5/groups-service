const { Member, Group } = require('../models/Model'),
      verifyEntitiesExist = require('./util/data-utils'),
      logger = require('../util/logger'),

      DATA_NAME = 'GROUP_DATA';

function saveGroup(groupData) {
    const entities = [
            { type: 'member', id: groupData.owner }
    ];

    return verifyEntitiesExist(entities)
            .then(() => {
                const group = new Group(groupData);

                logger.info(`${DATA_NAME} - now saving group, ${groupData.name} for owner ${groupData.owner}`);
                return group.save();
            });


}

function addMemberToGroup(groupId, memberId) {
    const entities = [
            { type: 'member', id: memberId },
            { type: 'group', id: groupId }
    ];

    return verifyEntitiesExist(entities)
            .then(() => {
                const groupQuery = { _id: groupId },
                          update = { $addToSet: { members: memberId }},
                          options = { new: true }

                    return Group.findOneAndUpdate(groupQuery, update, options);
            });
}

function findGroups(query={}, fields='', refOptions=[]) {
    let groupQuery = Group.find(query)
                        .select(fields)
                        .populate(refOptions);


    logger.info(`${DATA_NAME} - find groups by ${JSON.stringify(query)}`);
    return groupQuery.exec();
}

function findGroup(query={}, fields='', refOptions=[]) {
    let groupQuery = Group.findOne(query)
                        .select(fields)
                        .populate(refOptions);

    logger.info(`${DATA_NAME} - find group by ${JSON.stringify(query)}`);
    return groupQuery.exec();
}

module.exports = {
    saveGroup,
    addMemberToGroup,
    findGroup,
    findGroups
};
