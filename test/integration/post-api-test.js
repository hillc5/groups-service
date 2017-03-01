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
                    const [ error ] = JSON.parse(err.response.text);
                    expect(err.status).to.be.eql(400);
                    expect(error.parameter).to.not.be.undefined;
                    expect(error.parameter).to.be.eql('name');
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
                    const [ error ] = JSON.parse(err.response.text);
                    expect(err.status).to.be.eql(400);
                    expect(error.parameter).to.not.be.undefined;
                    expect(error.parameter).to.be.eql('text');
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
                    const [ error ] = JSON.parse(err.response.text);
                    expect(err.status).to.be.eql(400);
                    expect(error.parameter).to.not.be.undefined;
                    expect(error.parameter).to.be.eql('memberId');
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
                    const [ error ] = JSON.parse(err.response.text);
                    expect(err.status).to.be.eql(400);
                    expect(error.parameter).to.not.be.undefined;
                    expect(error.parameter).to.be.eql('groupId');
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
                    const [ error ] = JSON.parse(err.response.text);
                    expect(err.status).to.be.eql(400);
                    expect(error.parameter).to.not.be.undefined;
                    expect(error.parameter).to.be.eql('eventId');
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
                    const [ error ] = JSON.parse(err.response.text);
                    expect(err.status).to.be.eql(404);
                    expect(error.message).to.be.eql(`No member found for ${noMemberId}`);
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
                    const [ error ] = JSON.parse(err.response.text);
                    expect(err.status).to.be.eql(404);
                    expect(error.message).to.be.eql(`No group found for ${noGroupId}`);
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
                   const [ error ] = JSON.parse(err.response.text);
                    expect(err.status).to.be.eql(404);
                    expect(error.message).to.be.eql(`No event found for ${noEventId}`);
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
        });

        it('should return 201 on a successful Event level post', done => {
            const newPost = {
                      name: 'Test Post',
                      text: 'This is a test post'
                  },
                  newEvent = {
                      name: 'Test Event',
                      startDate: new Date(),
                      endDate : new Date()
                  };

            let memberId, groupId, eventId;

            saveTestGroup()
                .then(group => {
                    groupId = group._id;
                    memberId = group.owner;

                    newEvent.groupId = groupId;
                    newEvent.memberId = memberId;
                    newPost.memberId = memberId;
                    newPost.groupId = groupId;

                    return groupsService()
                            .post('/event')
                            .send(newEvent);
                })
                .then(result => {
                    const { body: event } = result;
                    eventId = event._id;
                    newPost.eventId = eventId;

                    return groupsService()
                            .post('/post')
                            .send(newPost);
                })
                .then(result => {
                    const { body: post } = result;
                    expect(result.status).to.be.eql(201);
                    expect(post.owner).to.be.eql(memberId);
                    expect(post.group).to.be.eql(groupId);
                    expect(post.event).to.be.eql(eventId);
                    done();
                });

        });
    });

    describe('#addReply', () => {
        it('should return 400 if the reply name is missing', done => {
            const newPost = {
                      name: 'Test Post',
                      text: 'This is a test post'
                  },
                  newReply = {
                      // name: 'Missing Name',
                      text: 'This is a test reply'
                  };

            saveTestGroup()
                .then(group => {
                    newPost.memberId = group.owner;
                    newReply.memberId = group.owner;
                    newPost.groupId = group._id;
                    newReply.groupId = group._id;

                    return groupsService()
                            .post('/post')
                            .send(newPost);
                })
                .then(result => {
                    const { _id: postId } = result.body;
                    return groupsService()
                            .post(`/post/${postId}/reply`)
                            .send(newReply);
                })
                .then(() => {
                    // Should fail the test if we reach this block
                    expect(true).to.be.false;
                    done();
                })
                .catch(err => {
                    const [ error ] = JSON.parse(err.response.text);
                    expect(err.status).to.be.eql(400);
                    expect(error.parameter).to.not.be.undefined;
                    expect(error.parameter).to.be.eql('name');
                    done();
                });
        });

        it('should return 400 if the reply text is missing', done => {
            const newPost = {
                      name: 'Test Post',
                      text: 'This is a test post'
                  },
                  newReply = {
                      name: 'Test Reply',
                      // text: 'This is a missing test reply'
                  };

            saveTestGroup()
                .then(group => {
                    newPost.memberId = group.owner;
                    newReply.memberId = group.owner;
                    newPost.groupId = group._id;
                    newReply.groupId = group._id;

                    return groupsService()
                            .post('/post')
                            .send(newPost);
                })
                .then(result => {
                    const { _id: postId } = result.body;
                    return groupsService()
                            .post(`/post/${postId}/reply`)
                            .send(newReply);
                })
                .then(() => {
                    // Should fail the test if we reach this block
                    expect(true).to.be.false;
                    done();
                })
                .catch(err => {
                    const [ error ] = JSON.parse(err.response.text);
                    expect(err.status).to.be.eql(400);
                    expect(error.parameter).to.not.be.undefined;
                    expect(error.parameter).to.be.eql('text');
                    done();
                });
        });

        it('should return 400 if the memberId is invalid', done => {
            const newPost = {
                      name: 'Test Post',
                      text: 'This is a test post'
                  },
                  newReply = {
                      name: 'Test Reply',
                      text: 'This is a missing test reply'
                  };

            saveTestGroup()
                .then(group => {
                    newPost.memberId = group.owner;
                    newReply.memberId = 'WrongId';
                    newPost.groupId = group._id;
                    newReply.groupId = group._id;

                    return groupsService()
                            .post('/post')
                            .send(newPost);
                })
                .then(result => {
                    const { _id: postId } = result.body;
                    return groupsService()
                            .post(`/post/${postId}/reply`)
                            .send(newReply);
                })
                .then(() => {
                    // Should fail the test if we reach this block
                    expect(true).to.be.false;
                    done();
                })
                .catch(err => {
                    const [ error ] = JSON.parse(err.response.text);
                    expect(err.status).to.be.eql(400);
                    expect(error.parameter).to.not.be.undefined;
                    expect(error.parameter).to.be.eql('memberId');
                    done();
                });
        });

        it('should return 400 if the groupId is invalid', done => {
            const newPost = {
                      name: 'Test Post',
                      text: 'This is a test post'
                  },
                  newReply = {
                      name: 'Test Reply',
                      text: 'This is a missing test reply'
                  };

            saveTestGroup()
                .then(group => {
                    newPost.memberId = group.owner;
                    newReply.memberId = group.owner;
                    newPost.groupId = group._id;
                    newReply.groupId = 'WrongId';

                    return groupsService()
                            .post('/post')
                            .send(newPost);
                })
                .then(result => {
                    const { _id: postId } = result.body;
                    return groupsService()
                            .post(`/post/${postId}/reply`)
                            .send(newReply);
                })
                .then(() => {
                    // Should fail the test if we reach this block
                    expect(true).to.be.false;
                    done();
                })
                .catch(err => {
                    const [ error ] = JSON.parse(err.response.text);
                    expect(err.status).to.be.eql(400);
                    expect(error.parameter).to.not.be.undefined;
                    expect(error.parameter).to.be.eql('groupId');
                    done();
                });
        });

        it('should return 400 if the optional eventId is invalid', done => {
            const newPost = {
                      name: 'Test Post',
                      text: 'This is a test post'
                  },
                  newReply = {
                      name: 'Test Reply',
                      text: 'This is a missing test reply'
                  };

            saveTestGroup()
                .then(group => {
                    newPost.memberId = group.owner;
                    newReply.memberId = group.owner;
                    newPost.groupId = group._id;
                    newReply.groupId = group._id;
                    newReply.eventId = 'WrongId'

                    return groupsService()
                            .post('/post')
                            .send(newPost);
                })
                .then(result => {
                    const { _id: postId } = result.body;
                    return groupsService()
                            .post(`/post/${postId}/reply`)
                            .send(newReply);
                })
                .then(() => {
                    // Should fail the test if we reach this block
                    expect(true).to.be.false;
                    done();
                })
                .catch(err => {
                    const [ error ] = JSON.parse(err.response.text);
                    expect(err.status).to.be.eql(400);
                    expect(error.parameter).to.not.be.undefined;
                    expect(error.parameter).to.be.eql('eventId');
                    done();
                });
        });

        it('should return 404 if there is no member associated with the given memberId', done => {
            const newPost = {
                      name: 'Test Post',
                      text: 'This is a test post'
                  },
                  newReply = {
                      name: 'Test Reply',
                      text: 'This is a test reply'
                  },
                  missingMemberId = '585d851c1b865511bb0543d2';

            saveTestGroup()
                .then(group => {
                    newPost.memberId = group.owner;
                    newReply.memberId = missingMemberId;
                    newPost.groupId = group._id;
                    newReply.groupId = group._id;

                    return groupsService()
                            .post('/post')
                            .send(newPost);
                })
                .then(result => {
                    const { _id: postId } = result.body;
                    return groupsService()
                            .post(`/post/${postId}/reply`)
                            .send(newReply);
                })
                .then(() => {
                    // Should fail the test if we reach this block
                    expect(true).to.be.false;
                    done();
                })
                .catch(err => {
                    const [ error ] = JSON.parse(err.response.text);
                    expect(err.status).to.be.eql(404);
                    expect(error.message).to.be.eql(`No member found for ${missingMemberId}`);
                    done();
                });
        });

        it('should return 404 if there is no group associated with the given groupId', done => {
            const newPost = {
                      name: 'Test Post',
                      text: 'This is a test post'
                  },
                  newReply = {
                      name: 'Test Reply',
                      text: 'This is a test reply'
                  },
                  missingGroupId = '585d851c1b865511bb0543d2';

            saveTestGroup()
                .then(group => {
                    newPost.memberId = group.owner;
                    newReply.memberId = group.owner;
                    newPost.groupId = group._id;
                    newReply.groupId = missingGroupId;

                    return groupsService()
                            .post('/post')
                            .send(newPost);
                })
                .then(result => {
                    const { _id: postId } = result.body;
                    return groupsService()
                            .post(`/post/${postId}/reply`)
                            .send(newReply);
                })
                .then(() => {
                    // Should fail the test if we reach this block
                    expect(true).to.be.false;
                    done();
                })
                .catch(err => {
                    const [ error ] = JSON.parse(err.response.text);
                    expect(err.status).to.be.eql(404);
                    expect(error.message).to.be.eql(`No group found for ${missingGroupId}`);
                    done();
                });
        });

        it('should return 404 if there is no event associated with the given eventId', done => {
            const newPost = {
                      name: 'Test Post',
                      text: 'This is a test post'
                  },
                  newReply = {
                      name: 'Test Reply',
                      text: 'This is a test reply'
                  },
                  missingEventId = '585d851c1b865511bb0543d2';

            saveTestGroup()
                .then(group => {
                    newPost.memberId = group.owner;
                    newReply.memberId = group.owner;
                    newPost.groupId = group._id;
                    newReply.groupId = group._id;
                    newReply.eventId = missingEventId;

                    return groupsService()
                            .post('/post')
                            .send(newPost);
                })
                .then(result => {
                    const { _id: postId } = result.body;
                    return groupsService()
                            .post(`/post/${postId}/reply`)
                            .send(newReply);
                })
                .then(() => {
                    // Should fail the test if we reach this block
                    expect(true).to.be.false;
                    done();
                })
                .catch(err => {
                    const [ error ] = JSON.parse(err.response.text);
                    expect(err.status).to.be.eql(404);
                    expect(error.message).to.be.eql(`No event found for ${missingEventId}`);
                    done();
                });
        });

        it('should return 404 if there is no post associated with the given postId', done => {
            const newPost = {
                      name: 'Test Post',
                      text: 'This is a test post'
                  },
                  newReply = {
                      name: 'Test Reply',
                      text: 'This is a test reply'
                  },
                  missingPostId = '585d851c1b865511bb0543d2';

            saveTestGroup()
                .then(group => {
                    newReply.memberId = group.owner;
                    newReply.groupId = group._id;

                    return groupsService()
                            .post(`/post/${missingPostId}/reply`)
                            .send(newReply);
                })
                .then(() => {
                    // Should fail the test if we reach this block
                    expect(true).to.be.false;
                    done();
                })
                .catch(err => {
                    const [ error ] = JSON.parse(err.response.text);
                    expect(err.status).to.be.eql(404);
                    expect(error.message).to.be.eql(`No post found for ${missingPostId}`);
                    done();
                });
        });

        it('should return 200 on successful reply', done => {
            const newPost = {
                      name: 'Test Post',
                      text: 'This is a test post'
                  },
                  newReply = {
                      name: 'Test Reply',
                      text: 'This is a test reply'
                  },
                  missingEventId = '585d851c1b865511bb0543d2';

            saveTestGroup()
                .then(group => {
                    newPost.memberId = group.owner;
                    newReply.memberId = group.owner;
                    newPost.groupId = group._id;
                    newReply.groupId = group._id;

                    return groupsService()
                            .post('/post')
                            .send(newPost);
                })
                .then(result => {
                    const { _id: postId } = result.body;
                    return groupsService()
                            .post(`/post/${postId}/reply`)
                            .send(newReply);
                })
                .then(result => {
                    expect(result.status).to.be.eql(200);
                    done();
                });
        });

        it('should return the original post with the reply stored on success', done => {
            const newPost = {
                      name: 'Test Post',
                      text: 'This is a test post'
                  },
                  newReply = {
                      name: 'Test Reply',
                      text: 'This is a test reply'
                  },
                  missingEventId = '585d851c1b865511bb0543d2';

            saveTestGroup()
                .then(group => {
                    newPost.memberId = group.owner;
                    newReply.memberId = group.owner;
                    newPost.groupId = group._id;
                    newReply.groupId = group._id;

                    return groupsService()
                            .post('/post')
                            .send(newPost);
                })
                .then(result => {
                    const { _id: postId } = result.body;
                    return groupsService()
                            .post(`/post/${postId}/reply`)
                            .send(newReply);
                })
                .then(result => {
                    const { body: post } = result;

                    expect(result.status).to.be.eql(200);
                    expect(post.replies.length).to.be.eql(1);
                    expect(post.name).to.be.eql(newPost.name);
                    expect(post.text).to.be.eql(newPost.text);
                    done();
                });
        });
    })
})
