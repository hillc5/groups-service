const { Member, Group } = require('../models/Model'),
      logger = require('../util/logger'),

      DATA_NAME = 'GROUP_DATA';

function saveGroup(groupData) {
    const group = new Group(groupData);

    let groupId,
        result;

    logger.info(`${DATA_NAME} - now saving group, ${groupData.name} for owner ${groupData.owner}`);
    return group.save()
            .then(group => {
                groupId = group._id;
                result = group;
                return Member.findOne({ _id: groupData.owner }).exec()
            })
            .then(member => {
                member.memberGroups.push({ _id: groupId });
                member.save();
                return result;
            });
}

module.exports = {
    saveGroup
};
