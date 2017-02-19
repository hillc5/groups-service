const MODELS = require('../../service/models/Model'),
      mongoose = require('mongoose'),

      chai = require('chai')
      chaiHttp = require('chai-http')

      service = require('../../service/models/Model');

chai.use(chaiHttp);

const testMemberData = {
          name: 'Test Guy',
          email: getRandomEmailAddress(),
          joinDate: new Date()
      };

const testGroupData = {
          name: 'Test Group',
          description: 'Test Group Description',
          isPublic: true,
          tags: 'test, testing'
      };

function groupsService() {
    return chai.request(service);
}

function getRandomEmailAddress() {
    return `Test${Math.floor(Math.random() * 1e10)}@test.com`;
}

function saveTestMember() {
    return groupsService()
            .post('/member')
            .send(testMemberData)
            .then(result => {
                return result.body;
            });
}

function saveTestGroup() {
    const memberData = {
        name: 'Test Guy',
        email: getRandomEmailAddress()
    };

    return groupsService()
            .post('/member')
            .send(memberData)
            .then(result => {
                const { _id: memberId } = result.body;
                testGroupData.memberId = memberId;
                return groupsService()
                        .post('/group')
                        .send(testGroupData);
            })
            .then(result => {
                return result.body;
            });
}

function clearSavedTestData(done) {
  const { Member, Event, Group, Post } = MODELS;

  Member.remove({})
    .then(() => Group.remove({}))
    .then(() => Event.remove({}))
    .then(() => Post.remove({}))
    .then(() => done());
}

module.exports = {
    saveTestMember,
    saveTestGroup,
    groupsService,
    testMemberData,
    testGroupData,
    clearSavedTestData
};
