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

function saveGroupV2(groupData) {
    const group = new Group(groupData);

    logger.info(`${DATA_NAME} - now saving group, ${groupData.name} for owner ${groupData.owner}`);
    return group.save();
}

function addMemberToGroup(groupId, memberId) {
    const query = { _id: groupId },
          update = { $addToSet: { members: memberId }},
          options = { new: true };

    return Group.findOneAndUpdate(query, update, options).exec()
            .then(group => {
                if (!group) {
                    throw { status: 404, message: `No group found for id: ${groupId}` };
                }
                const memberQuery = { _id: memberId },
                      memberUpdate = { $addToSet: { memberGroups: groupId }};

                Member.findOneAndUpdate(memberQuery, memberUpdate).exec();
                return group;
            });
}

function addMemberToGroupV2(groupId, memberId) {
    const memberQuery = { _id: memberId };

    return Member.findOne(memberQuery)
            .then(member => {
                if (!member) {
                    throw { status: 404, message: `No Member found for id: ${memberId}`};
                }

                const groupQuery = { _id: groupId },
                      update = { $addToSet: { members: memberId }},
                      options = { new: true }

                return Group.findOneAndUpdate(groupQuery, update, options)
            })
            .then(group => {
                if (!group) {
                    throw { status: 404, message: `No group found for id: ${groupId}` };
                }

                return group;
            })
}

function findGroups(query, fields, refOptions) {
    let groupQuery = Group.find(query)
                        .select(fields)
                        .populate(refOptions);


    logger.info(`${DATA_NAME} - find groups by ${JSON.stringify(query)}`);
    return groupQuery.exec();
}

function findGroup(query, fields, refOptions) {
    let groupQuery = Group.findOne(query)
                        .select(fields)
                        .populate(refOptions);

    logger.info(`${DATA_NAME} - find group by ${JSON.stringify(query)}`);
    return groupQuery.exec();
}

module.exports = {
    saveGroup,
    saveGroupV2,
    addMemberToGroup,
    addMemberToGroupV2,
    findGroup,
    findGroups
};
