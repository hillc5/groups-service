const MODELS = require('../../service/models/Model'),
      mongoose = require('mongoose'),

      chai = require('chai')
      chaiHttp = require('chai-http')

      service = require('../../service/models/Model');

chai.use(chaiHttp);

const testMemberData = {
          name: 'Test',
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
    return `Test${Math.floor(Math.random() * 100)}@test.com`;
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
                let groupData = Object.assign({ owner: result.body._id }, testGroupData);
                return groupsService()
                        .post('/group')
                        .send(groupData);
            })
            .then(result => {
                return result.body;
            });
}

module.exports = {
    saveTestMember,
    saveTestGroup,
    groupsService,
    testMemberData,
    testGroupData
};
