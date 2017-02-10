const mongoose = require('mongoose'),
    { Member, Group, Event, Post } = require('../../service/models/Model'),
    { groupsService, saveTestMember, saveTestGroup, testGroupData } = require('../util/test-helpers'),

    chai = require('chai'),

    service = require('../../service/service'),
    expect = chai.expect;

chai.use(chaiHttp);

describe('post-api', () => {
    afterEach(done => {
        Member.remove({})
            .then(() => Group.remove({}))
            .then(() => Event.remove({}))
            .then(() => Post.remove({}))
            .then(done());
    });

    describe('#createPost', () => {
        it('should return 201 on successful Group level post', done => {
            const newEvent = {
                      name: 'Test Event',
                      startDate: new Date(),
                      endDate: new Date()
                  },
                  newPost = {
                      name: 'Test Post',
                      text: 'This is a test post',

                  };

            let memberId, groupId;

            saveTestGroup()
                .then(group => {
                    memberId = group.owner,
                    groupId = group._id;

                    newPost.memberId = memberId;
                    newPost.groupId = groupId;

                    return groupsService()
                            .post('/post')
                            .send(newPost);
                })
                .then(result => {
                    const { body: post } = result;
                    expect(result.status).to.be.eql(201);
                    expect(post.group).to.be.eql(groupId);
                    expect(post.owner).to.be.eql(memberId);
                    done();
                })
                .catch(err => console.log(err));
        })
    })
})
