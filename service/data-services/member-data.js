const { Member } = require('../models/Model'),
      logger = require('../util/logger');


function saveMember(memberData) {
    const member = new Member(memberData);

    logger.info('Now saving member %s', member.name);
    return member.save();
}

function findMember(query, fields, refOptions) {
    let memberQuery = Member.findOne(query).select(fields);

    refOptions.forEach(option => {
        memberQuery.populate(option);
    });

    return Promise.resolve(memberQuery.exec());

}

module.exports = {
    saveMember,
    findMember
};
