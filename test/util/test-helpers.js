const MODELS = require('../../service/models/Model'),
      mongoose = require('mongoose');

const testMemberData = {
          name: 'Test',
          email: 'Test@test.com',
          memberGroups: [],
          memberPosts: [],
          memberEvents: [],
          joinDate: Date.now()
      };

const testGroupData = {
          name: 'Test Group',
          description: 'Test Group Description',
          isPublic: true,
          members: [],
          events: [],
          posts: [],
          tags: [ 'test', 'testing' ],
          creationDate: Date.now(),
          lastUpdated: Date.now(),
          owner: mongoose.mongo.ObjectId('5848772a7cc11952f4110e00')
      };

function saveTestMember() {
    return saveTestItem('Member', testMemberData);
}

function saveTestGroup() {
    return saveTestItem('Group', testGroupData);
}

function saveTestItem(modelType, testData) {
    const model = new MODELS[modelType](testData);
    return model
        .save()
        .then(result => {
            return new Promise(resolve => {
                // Hack for tests.  Give mongo enough time to
                // store the saved item.
                setTimeout(() => resolve(result), 0);
            });
        });
}

module.exports = {
    saveTestMember,
    saveTestGroup,
    testMemberData,
    testGroupData
};
