const { Member } = require('../models/Model'),
      logger = require('../util/logger'),

      DATA_NAME = 'MEMBER_DATA';


function saveMember(memberData) {
    const member = new Member(memberData);

    logger.info(`${DATA_NAME} - now saving member, ${memberData.name}`);
    return member.save();
}

function findMember(query, fields, refOptions) {
    let memberQuery = Member.findOne(query)
                        .select(fields)
                        .populate(refOptions);


    logger.info(`${DATA_NAME} - find member by ${JSON.stringify(query)}`);
    return memberQuery.exec();
}

module.exports = {
    saveMember,
    findMember
};
