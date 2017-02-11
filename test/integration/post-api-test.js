const mongoose = require('mongoose'),
    { Member, Group, Event, Post } = require('../../service/models/Model'),
    { groupsService, saveTestGroup, clearSavedTestData } = require('../util/test-helpers'),

    chai = require('chai'),

    service = require('../../service/service'),
    expect = chai.expect;

chai.use(chaiHttp);

describe('post-api integration tests', () => {
    afterEach(done => {
        clearSavedTestData(done);
    });

    describe('#createPost', () => {
        it('should return 400 if name is not provided', done => {
            const newPost = {
                // no name
                text: 'This is a test post'
            };

            saveTestGroup()
                .then(group => {
                    newPost.memberId = group.owner;
                    newPost.groupId = group._id;

                    return groupsService()
                            .post('/post')
                            .send(newPost);
                })
                .then(() => {
                    // Should fail the test if we reach this block
                    expect(true).to.be.false;
                    done();
                })
                .catch(err => {
                    const { text } = err.response,
                          errTxt = JSON.parse(text);

                    expect(err.status).to.be.eql(400);
                    expect(errTxt.name.msg).to.be.eql('Name is required');
                    done();
                });
        });

        it('should return 400 if text is not provided', done => {
            const newPost = {
                // no text
                name: 'Test Post'
            };

            saveTestGroup()
                .then(group => {
                    newPost.memberId = group.owner;
                    newPost.groupId = group._id;

                    return groupsService()
                            .post('/post')
                            .send(newPost);
                })
                .then(() => {
                    // Should fail the test if we reach this block
                    expect(true).to.be.false;
                    done();
                })
                .catch(err => {
                    const { text } = err.response,
                          errTxt = JSON.parse(text);

                    expect(err.status).to.be.eql(400);
                    expect(errTxt.text.msg).to.be.eql('Text is required');
                    done();
                });
        });

        it('should return 400 if memberId is not valid', done => {
            const newPost = {
                name: 'Test Post',
                text: 'This is a test post'
            };

            saveTestGroup()
                .then(group => {
                    newPost.memberId = 'WrongId';
                    newPost.groupId = group._id;

                    return groupsService()
                            .post('/post')
                            .send(newPost);
                })
                .then(() => {
                    // Should fail the test if we reach this block
                    expect(true).to.be.false;
                    done();
                })
                .catch(err => {
                    const { text } = err.response,
                          errTxt = JSON.parse(text);

                    expect(err.status).to.be.eql(400);
                    expect(errTxt.memberId.msg).to.be.eql('memberId must be a valid MongoDB ObjectId');
                    done();
                });
        });

        it('should return 400 if groupId is not valid', done => {
            const newPost = {
                name: 'Test Post',
                text: 'This is a test post'
            };

            saveTestGroup()
                .then(group => {
                    newPost.memberId = group.owner;
                    newPost.groupId = 'WrongId';

                    return groupsService()
                            .post('/post')
                            .send(newPost);
                })
                .then(() => {
                    // Should fail the test if we reach this block
                    expect(true).to.be.false;
                    done();
                })
                .catch(err => {
                    const { text } = err.response,
                          errTxt = JSON.parse(text);

                    expect(err.status).to.be.eql(400);
                    expect(errTxt.groupId.msg).to.be.eql('groupId must be a valid MongoDB ObjectId');
                    done();
                });
        });

        it('should return 400 if eventId is not valid', done => {
            const newPost = {
                name: 'Test Post',
                text: 'This is a test post'
            };

            saveTestGroup()
                .then(group => {
                    newPost.memberId = group.owner;
                    newPost.groupId = group._id;
                    newPost.eventId = 'WrongId';

                    return groupsService()
                            .post('/post')
                            .send(newPost);
                })
                .then(() => {
                    // Should fail the test if we reach this block
                    expect(true).to.be.false;
                    done();
                })
                .catch(err => {
                    const { text } = err.response,
                          errTxt = JSON.parse(text);

                    expect(err.status).to.be.eql(400);
                    expect(errTxt.eventId.msg).to.be.eql('eventId must be a valid MongoDB ObjectId');
                    done();
                });
        });

        it('should return 404 if there is no Member associated with given memberId', done => {
            const newPost = {
                      name: 'Test Post',
                      text: 'This is a test post'
                  },
                  noMemberId = '585d851c1b865511bb0543d2';

            saveTestGroup()
                .then(group => {
                    newPost.memberId = noMemberId;
                    newPost.groupId = group._id;

                    return groupsService()
                            .post('/post')
                            .send(newPost);
                })
                .then(() => {
                    // Should fail the test if we reach this block
                    expect(true).to.be.false;
                    done();
                })
                .catch(err => {
                    const { text } = err.response,
                          errTxt = JSON.parse(text);

                    expect(err.status).to.be.eql(404);
                    expect(errTxt.message).to.be.eql(`No member found for ${noMemberId}`);
                    done();
                });
        });

        it('should return 404 if there is no Group associated with given groupId', done => {
            const newPost = {
                      name: 'Test Post',
                      text: 'This is a test post'
                  },
                  noGroupId = '585d851c1b865511bb0543d2';

            saveTestGroup()
                .then(group => {
                    newPost.memberId = group.owner;
                    newPost.groupId = noGroupId;

                    return groupsService()
                            .post('/post')
                            .send(newPost);
                })
                .then(() => {
                    // Should fail the test if we reach this block
                    expect(true).to.be.false;
                    done();
                })
                .catch(err => {
                    const { text } = err.response,
                          errTxt = JSON.parse(text);

                    expect(err.status).to.be.eql(404);
                    expect(errTxt.message).to.be.eql(`No group found for ${noGroupId}`);
                    done();
                });
        });

        it('should return 404 if there is no Event associated with given eventId', done => {
                const newPost = {
                      name: 'Test Post',
                      text: 'This is a test post'
                  },
                  noEventId = '585d851c1b865511bb0543d2';

            saveTestGroup()
                .then(group => {
                    newPost.memberId = group.owner;
                    newPost.groupId = group._id;
                    newPost.eventId = noEventId;

                    return groupsService()
                            .post('/post')
                            .send(newPost);
                })
                .then(() => {
                    // Should fail the test if we reach this block
                    expect(true).to.be.false;
                    done();
                })
                .catch(err => {
                    const { text } = err.response,
                          errTxt = JSON.parse(text);

                    expect(err.status).to.be.eql(404);
                    expect(errTxt.message).to.be.eql(`No event found for ${noEventId}`);
                    done();
                });
        });

        it('should return 201 on successful Group level post', done => {
            const newPost = {
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
                });
        })
    })
})
