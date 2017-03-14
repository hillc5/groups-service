const mongoose = require('mongoose'),
      { Member, Group } = require('../../service/models/Model'),
      { clearSavedTestData, groupsService, saveTestMember, saveTestGroup, testGroupData, testMemberData } = require('../util/test-helpers'),

      chai = require('chai'),

      service = require('../../service/service'),
      expect = chai.expect;

describe('group-api integration tests', () => {
    afterEach(done => {
       clearSavedTestData(done);
    });

    describe('#createGroup', () => {

        it('should return 400 for incorrect owner id', done => {
            const newGroup = {
                      name: 'Test',
                      memberId: 'wrongId',
                      isPublic: true
                  };

            groupsService()
                .post('/group')
                .send(newGroup)
                .then(res => {
                    // Fail if we hit this spot
                    expect(false).to.be.true;
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

        it('should return 400 if a name is not supplied', done => {
            const newGroup = {
                      name: '',
                      memberId: '585d851c1b865511bb0543d2',
                      isPublic: true
                  };

            groupsService()
                .post('/group')
                .send(newGroup)
                .then(res => {
                    // Fail if we hit this spot
                    expect(false).to.be.true;
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

        it('should return 400 if a isPublic is not supplied', done => {
            const newGroup = {
                      name: 'Test',
                      memberId: '585d851c1b865511bb0543d2'
                  };

            groupsService()
                .post('/group')
                .send(newGroup)
                .then(res => {
                    // Fail if we hit this spot
                    expect(false).to.be.true;
                    done();
                })
                .catch(err => {
                    const [ error ] = JSON.parse(err.response.text);
                    expect(err.status).to.be.eql(400);
                    expect(error.parameter).to.not.be.undefined;
                    expect(error.parameter).to.be.eql('isPublic');
                    done();
                });
        });

        it('should return 404 if there is no member for the given owner', done => {
            const newGroup = {
                    memberId: '585d851c1b865511bb0543d2',
                    name: 'Test',
                    isPublic: true
                  };

            groupsService()
                .post('/group')
                .send(newGroup)
                .then(() => {
                    // Fail if we hit this spot
                    expect(false).to.be.true;
                })
                .catch(err => {
                    const [ error ] = JSON.parse(err.response.text);
                    expect(err.status).to.be.eql(404);
                    expect(error.message).to.be.eql('No member found for 585d851c1b865511bb0543d2');
                    done();
                });
        })

        it('should return 201 on success', done => {
            const newGroup = {
                      name: 'Test',
                      isPublic: true
                  };

            saveTestMember()
                .then(member => {
                    newGroup.memberId = member._id;
                    return groupsService()
                        .post('/group')
                        .send(newGroup)
                })
                .then(res => {
                    expect(res.status).to.be.eql(201);
                    done();
                });
        });

        it('should add the owner to the members array', done => {
            const newGroup = {
                    name: 'Test',
                    isPublic: true
                };

            saveTestMember()
                .then(member => {
                    newGroup.memberId = member._id;
                    return groupsService()
                            .post('/group')
                            .send(newGroup);
                })
                .then(res => {
                    const { owner, members } = res.body,
                          member = members[0];

                    expect(member).to.be.eql(newGroup.memberId);
                    done();
                })
        })

        it('should return the full group on successful creation', done => {
            const newGroup = {
                      name: 'Test',
                      memberId: '585d851c1b865511bb0543d2',
                      isPublic: true
                  };

            saveTestMember()
                .then(member => {
                    newGroup.memberId = member._id;
                    return groupsService()
                        .post('/group')
                        .send(newGroup);
                })
                .then(res => {
                    const { _id, __v, owner, name, isPublic, description, members, tags, creationDate } = res.body;
                    expect(res.status).to.be.eql(201);
                    expect(_id).to.not.be.undefined;
                    expect(__v).to.be.eql(0);
                    expect(name).to.be.eql(newGroup.name);
                    expect(owner).to.be.eql(newGroup.memberId);
                    expect(isPublic).to.be.eql(newGroup.isPublic);
                    expect(description).to.be.a('string');
                    expect(members).to.be.an('array');
                    expect(members.length).to.be.eql(1);
                    expect(tags).to.be.an('array');
                    expect(tags.length).to.be.eql(0);
                    expect(creationDate).to.be.a('string');
                    // make sure test fails if Member schema is updated
                    expect(Object.keys(res.body).length).to.be.eql(9);
                    done();
                });
        });

        it('should create an empty array for tags when no tags are supplied', done => {
            const newGroup = {
                name: 'Test',
                isPublic: true
            };

            saveTestMember()
                .then(member => {
                    newGroup.memberId = member._id;
                    return groupsService()
                        .post('/group')
                        .send(newGroup)
                })
                .then(res => {
                    const { tags } = res.body;
                    expect(tags).to.be.an('array');
                    expect(tags.length).to.be.eql(0);
                    done();
                });
        });

        it('should split the tags strings on comma', done => {
            const newGroup = {
                name: 'Test',
                isPublic: true,
                tags: 'one, two, three'
            };

            saveTestMember()
                .then(member => {
                    newGroup.memberId = member._id;
                    return groupsService()
                        .post('/group')
                        .send(newGroup)
                })
                .then(res => {
                    const { tags } = res.body;
                    expect(tags).to.be.an('array');
                    expect(tags.length).to.be.eql(3);
                    expect(tags.includes('one')).to.be.true;
                    expect(tags.includes('two')).to.be.true;
                    expect(tags.includes('three')).to.be.true;
                    done();
                });
        });
    });

    describe('#addMemberToGroup', () => {
        it('should return 400 for incorrect format for groupId', done => {
            groupsService()
                .put(`/group/wrongId/member`)
                .then(result => {
                    // Fail if we hit this spot
                    expect(false).to.be.true;
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

        it('should return 400 for incorrect format for memberId', done => {
            groupsService()
                .put(`/group/585d851c1b865511bb0543d2/member`)
                .send({ memberId: 'wrongId' })
                .then(result => {
                    // Fail if we hit this spot
                    expect(false).to.be.true;
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

        it('should return 404 if the group does not exist for the given groupId', done => {

            saveTestMember()
                .then(member => {
                    return groupsService()
                        .put('/group/585d85e81b865511bb0543d5/member')
                        .send({ memberId: member._id })
                })
                .then(() => {
                    // Fail if we hit this spot
                })
                .catch(err => {
                    const [ error ] = JSON.parse(err.response.text);
                    expect(err.status).to.be.eql(404);
                    expect(error.message).to.be.eql('No group found for 585d85e81b865511bb0543d5')
                    done();
                })
        })

        it('should return 404 if the member does not exist for the given memberId', done => {
            saveTestGroup()
                .then(group => {
                    return groupsService()
                            .put(`/group/${group._id}/member`)
                            .send({ memberId: '585d851c1b865511bb0543d2'});
                })
                .then(() => {
                    // Fail if we hit this spot
                    expect(false).to.be.true;
                    done();
                })
                .catch(err => {
                    const [ error ] = JSON.parse(err.response.text);
                    expect(err.status).to.be.eql(404);
                    expect(error.message).to.be.eql('No member found for 585d851c1b865511bb0543d2')
                    done();
                });
        });

        it('should return 200 for successful save', done => {
            let memberId;

            saveTestMember()
                .then(member => {
                    memberId = member._id;
                    return saveTestGroup();
                })
                .then(group => {
                    return groupsService()
                            .put(`/group/${group._id}/member`)
                            .send({ memberId });
                })
                .then(result => {
                    expect(result.status).to.be.eql(200);
                    done();
                });
        })

        it('should return the group with the member added in the members array', done => {
            let memberId;

            saveTestMember()
                .then(member => {
                    memberId = member._id;
                    return saveTestGroup();
                })
                .then(group => {
                    return groupsService()
                            .put(`/group/${group._id}/member`)
                            .send({ memberId });
                })
                .then(result => {
                    const { members } = result.body;
                    expect(members.length).to.be.eql(2);
                    expect(members[1]).to.be.eql(memberId);
                    done();
                });
        });
    });

    describe('#removeMemberFromGroup', () => {
        it('should return 400 if an invalid group id is given', done => {
            const validMemberId = '585d851c1b865511bb0543d2';

            groupsService()
                .delete(`/group/wrongId/member/${validMemberId}`)
                .then(respnose => {
                    // Should fail if we hit here
                    expect(false).to.be.true;
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

        it('should return 400 if an invalid member id is given', done => {
            const validGroupId = '585d851c1b865511bb0543d2';

            groupsService()
                .delete(`/group/${validGroupId}/member/wrongId`)
                .then(respnose => {
                    // Should fail if we hit here
                    expect(false).to.be.true;
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

        it('should return 404 if the group does not exist for the given groupId', done => {
            const missingGroupId = '585d851c1b865511bb0543d2';

            saveTestMember()
                .then(member => {
                    return groupsService()
                            .delete(`/group/${missingGroupId}/member/${member._id}`)
                })
                .then(respnose => {
                    // Should fail if we hit here
                    expect(false).to.be.true;
                    done();
                })
                .catch(err => {
                    const [ error ] = JSON.parse(err.response.text);
                    expect(err.status).to.be.eql(404);
                    expect(error.message).to.be.eql(`No group found for ${missingGroupId}`);
                    done();
                });
        });

        it('should return 404 if the member does not exist for the given memberId', done => {
            const missingMemberId = '585d851c1b865511bb0543d2';

            saveTestGroup()
                .then(group => {
                    return groupsService()
                            .delete(`/group/${group._id}/member/${missingMemberId}`)
                })
                .then(respnose => {
                    // Should fail if we hit here
                    expect(false).to.be.true;
                    done();
                })
                .catch(err => {
                    const [ error ] = JSON.parse(err.response.text);
                    expect(err.status).to.be.eql(404);
                    expect(error.message).to.be.eql(`No member found for ${missingMemberId}`);
                    done();
                });
        });

        it('should return 200 for a successful delete', done => {
            let memberId, groupId;

            saveTestMember()
                .then(member => {
                    memberId = member._id;

                    return saveTestGroup();
                })
                .then(group => {
                    groupId = group._id;
                    return groupsService()
                            .put(`/group/${groupId}/member`)
                            .send({ memberId });
                })
                .then(() => {
                    return groupsService()
                            .delete(`/group/${groupId}/member/${memberId}`);
                })
                .then(result => {
                    expect(result.status).to.be.eql(200);
                    done();
                });
        });

        it('should return the group with the member removed from the members array', done => {
            let memberId, groupId;

            saveTestMember()
                .then(member => {
                    memberId = member._id;

                    return saveTestGroup();
                })
                .then(group => {
                    groupId = group._id;
                    return groupsService()
                            .put(`/group/${groupId}/member`)
                            .send({ memberId });
                })
                .then(result => {
                    const { members } = result.body;
                    expect(members).to.contain(memberId);
                    return groupsService()
                            .delete(`/group/${groupId}/member/${memberId}`);
                })
                .then(result => {
                    const { members } = result.body
                    expect(result.status).to.be.eql(200);
                    expect(members).to.not.contain(memberId);
                    done();
                });
        });
    })

    describe('#findGroupById', () => {
        it('should return 400 if an invalid group id is given', done => {
            groupsService()
                .get('/group/wrongId')
                .then(response => {
                    // Should fail if we hit here
                    expect(false).to.be.true;
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

        it('should return 404 if no group is found for the given id', done => {
            groupsService()
                .get('/group/585d85e81b865511bb0543d5')
                .then(response => {
                    // Should fail if we hit here
                    expect(false).to.be.true;
                    done();
                })
                .catch(err => {
                   const [ error ] = JSON.parse(err.response.text);
                    expect(err.status).to.be.eql(404);
                    expect(error.message).to.be.eql('No group found for 585d85e81b865511bb0543d5');
                    done();
                });
        });

        it('should return 200 for a valid group id', done => {
            const groupData = {
                      name: 'Test',
                      isPublic: true
                  }
            saveTestMember()
                .then(member => {
                    groupData.memberId = member._id;
                    return groupsService()
                            .post('/group')
                            .send(groupData);
                })
                .then(response => {
                    const { _id: groupId } = response.body;
                    return groupsService()
                            .get(`/group/${groupId}`);
                })
                .then(response => {
                    expect(response.status).to.be.eql(200);
                    done();
                });
        });

        it('should return the members populated with their name', done => {
            const groupData = {
                      name: 'Test',
                      isPublic: true
                  }
            saveTestMember()
                .then(member => {
                    groupData.memberId = member._id
                    return groupsService()
                            .post('/group')
                            .send(groupData);
                })
                .then(response => {
                    const { _id: groupId } = response.body;
                    return groupsService()
                            .get(`/group/${groupId}`);
                })
                .then(response => {
                    const { members } = response.body;
                    expect(members.length).to.be.eql(1);
                    expect(members[0].name).to.not.be.undefined;
                    done();
                });
        });

        it('should return the owner with name, email, and joinDate populated', done => {
            const groupData = {
                      name: 'Test',
                      isPublic: true
                  };

            saveTestMember()
                .then(member => {
                    groupData.memberId = member._id;
                    return groupsService()
                            .post('/group')
                            .send(groupData);
                })
                .then(response => {
                    const { _id: groupId } = response.body;
                    return groupsService()
                            .get(`/group/${groupId}`);
                })
                .then(response => {
                    const { owner } = response.body,
                          { name, email } = testMemberData;

                    expect(owner.name).to.be.eql(name);
                    expect(owner.email).to.be.eql(email);
                    expect(owner.joinDate).to.not.be.undefined;
                    done();
                });
        });
    });

    describe('#getAllGroupEvents', () => {
        it('should return 400 if an invalid groupId is given', done => {
            groupsService()
                .get('/group/wrongId/events')
                .then(response => {
                    // Should fail if we hit here
                    expect(false).to.be.true;
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

        it('should return 200 if call is successful', done => {
            saveTestGroup()
                .then(group => {
                    return groupsService()
                            .get(`/group/${group._id}/events`);
                })
                .then(result => {
                    expect(result.status).to.be.eql(200);
                    done();
                });
        });

        it('should return an empty array if no events are associated with the group', done => {
            saveTestGroup()
                .then(group => {
                    return groupsService()
                            .get(`/group/${group._id}/events`);
                })
                .then(result => {
                    const { body: events } = result;
                    expect(events).to.be.eql([]);
                    done();
                });
        });

        it('should return a single event if only one has been saved', done => {
            const testEvent = {
                      name: 'Test Event',
                      startDate: new Date(),
                      endDate: new Date()
                  }

            let groupId;

            saveTestGroup()
                .then(group => {
                    groupId = group._id;
                    testEvent.groupId = groupId;
                    testEvent.memberId = group.owner;
                    return groupsService()
                            .post('/event')
                            .send(testEvent);
                })
                .then(result => {
                    return groupsService()
                            .get(`/group/${groupId}/events`);
                })
                .then(result => {
                    const { body: events } = result;
                    expect(events.length).to.be.eql(1);
                    expect(events[0].name).to.be.eql(testEvent.name);
                    done();
                })
        });

        it('should return multiple events if they have been saved for a group', done => {
            const newEventOne = {
                      name: 'Test Event One',
                      startDate: new Date(),
                      endDate: new Date()
                  },
                  newEventTwo = {
                      name: 'Test Event Two',
                      startDate: new Date(),
                      endDate: new Date()
                  };

            let memberId, groupId;

            saveTestGroup()
                .then(group => {
                    memberId = group.owner;
                    groupId = group._id;

                    newEventOne.memberId = memberId;
                    newEventTwo.memberId = memberId;

                    newEventOne.groupId = groupId;
                    newEventTwo.groupId = groupId;

                    return groupsService()
                            .post('/event')
                            .send(newEventOne);
                })
                .then(() => {
                    return groupsService()
                            .post('/event')
                            .send(newEventTwo);
                })
                .then(() => {
                    return groupsService()
                            .get(`/group/${groupId}/events`);
                })
                .then(result => {
                    const { body: events } = result;
                    expect(result.status).to.be.eql(200);
                    expect(events.length).to.be.eql(2);

                    const [ savedEventOne, savedEventTwo ] = events;
                    expect(savedEventOne.name).to.be.eql(newEventOne.name);
                    expect(savedEventTwo.name).to.be.eql(newEventTwo.name);
                    done();
                });
        });

        it('should return all events for a group across multiple members', done => {
            const newMemberOne = {
                      name: 'Test Member One',
                      email: 'TestOne@Test.com'
                  },
                  newMemberTwo = {
                      name: 'Test Member Two',
                      email: 'TestTwo@Test.com'
                  },
                  newGroup = {
                      name: 'Test Group',
                      isPublic: true
                  },
                  newEventOne = {
                      name: 'Test Event One',
                      startDate: new Date(),
                      endDate: new Date()
                  },
                  newEventTwo = {
                      name: 'Test Event Two',
                      startDate: new Date(),
                      endDate: new Date()
                  };

            let memberOne, memberTwo, groupId;

            groupsService()
                .post('/member')
                .send(newMemberOne)
                .then(result => {
                    memberOne = result.body;
                    newGroup.memberId = memberOne._id;
                    newEventOne.memberId = memberOne._id;
                    return groupsService()
                            .post('/group')
                            .send(newGroup);
                })
                .then(result => {
                    groupId = result.body._id;
                    newEventOne.groupId = groupId;
                    newEventTwo.groupId = groupId;
                    return groupsService()
                            .post('/event')
                            .send(newEventOne);
                })
                .then(() => {
                    return groupsService()
                            .post('/member')
                            .send(newMemberTwo);
                })
                .then(result => {
                    memberTwo = result.body;
                    newEventTwo.memberId = memberTwo._id;
                    let member = {
                        memberId: memberTwo._id
                    };
                    return groupsService()
                            .put(`/group/${groupId}/member`)
                            .send(member);
                })
                .then(() => {
                    return groupsService()
                            .post('/event')
                            .send(newEventTwo);
                })
                .then(() => {
                    return groupsService()
                            .get(`/group/${groupId}/events`);
                })
                .then(result => {
                    const { body: events } = result;
                    expect(events.length).to.be.eql(2);
                    const [ savedEventOne, savedEventTwo ] = events;
                    expect(savedEventOne.name).to.be.eql(newEventOne.name);
                    expect(savedEventOne.owner.name).to.be.eql(memberOne.name);
                    expect(savedEventTwo.name).to.be.eql(newEventTwo.name);
                    expect(savedEventTwo.owner.name).to.be.eql(memberTwo.name);
                    done();
                });
        });

    });

    describe('#getAllGroupPosts', () => {
        it('should return 400 if groupId is an invalid ObjectId', done => {
            groupsService()
                .get('/group/wrongId/posts')
                .then(result => {
                    // Fail if we hit this spot
                    expect(false).to.be.true;
                    done();
                })
                .catch(err => {
                    const [ error ] = JSON.parse(err.response.text);
                    expect(err.status).to.be.eql(400);
                    expect(error.parameter).to.be.eql('groupId');
                    done();
                });
        });

        it('should return 200 if call is successful', done => {
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
                    return groupsService()
                            .get(`/group/${groupId}/posts`);
                })
                .then(result => {
                    const { body: posts } = result;
                    expect(result.status).to.be.eql(200);
                    expect(posts[0].group._id).to.be.eql(groupId);
                    done();
                });
        });

        it('should return an empty array if there are no posts for the given memberId', done => {
            saveTestGroup()
                .then(group => {
                    return groupsService()
                            .get(`/member/${group._id}/posts`);
                })
                .then(result => {
                    const { body: posts } = result;
                    expect(result.status).to.be.eql(200);
                    expect(posts).to.be.an.array;
                    expect(posts.length).to.be.eql(0);
                    done();
                })
        });

        it('should return multiple events when they have been saved', done => {
            const newPostOne = {
                      name: 'Test Post One',
                      text: 'One'
                  },
                  newPostTwo = {
                      name: 'Test Post Two',
                      text: 'Two'
                  };

            let groupId, memberId;

            saveTestGroup()
                .then(group => {
                    memberId = group.owner,
                    groupId = group._id;

                    newPostOne.memberId = memberId;
                    newPostTwo.memberId = memberId;
                    newPostOne.groupId = groupId;
                    newPostTwo.groupId = groupId;

                    return groupsService()
                            .post('/post')
                            .send(newPostOne);
                })
                .then(result => {
                    return groupsService()
                            .post('/post')
                            .send(newPostTwo);
                })
                .then(result => {
                    return groupsService()
                            .get(`/group/${groupId}/posts`);
                })
                .then(result => {
                    const { body: posts } = result;
                    const [ postOne, postTwo ] = posts;
                    expect(posts.length).to.be.eql(2);
                    expect(postOne.text).to.be.eql(newPostOne.text);
                    expect(postOne.group._id).to.be.eql(groupId);
                    expect(postTwo.group._id).to.be.eql(groupId);
                    expect(postTwo.text).to.be.eql(newPostTwo.text);
                    done();
                })
        });

        it('should return posts for groups and events', done => {
            const eventPost = {
                      name: 'Event Post',
                      text: 'This is an event post'
                  },
                  groupPost = {
                      name: 'Group Post',
                      text: 'This is a group post'
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

                    groupPost.memberId = memberId;
                    groupPost.groupId = groupId;

                    eventPost.memberId = memberId;
                    eventPost.groupId = groupId;

                    return groupsService()
                            .post('/event')
                            .send(newEvent);
                })
                .then(result => {
                    const { body: event } = result;
                    eventId = event._id;
                    eventPost.eventId = eventId;

                    return groupsService()
                            .post('/post')
                            .send(eventPost);
                })
                .then(result => {
                    return groupsService()
                            .post('/post')
                            .send(groupPost);
                })
                .then(result => {
                    return groupsService()
                            .get(`/group/${groupId}/posts`);
                })
                .then(result => {
                    const { body: posts } = result;
                    expect(result.status).to.be.eql(200);
                    expect(posts.length).to.be.eql(2);

                    const [ eventPost, groupPost ] = posts;

                    expect(eventPost.event._id).to.be.eql(eventId);
                    expect(eventPost.group._id).to.be.eql(groupId);
                    expect(eventPost.owner._id).to.be.eql(memberId);

                    expect(groupPost.group._id).to.be.eql(groupId);
                    expect(groupPost.event).to.be.undefined;
                    expect(groupPost.owner._id).to.be.eql(memberId);
                    done();
                });
        });

        it('should return owner name and email', done => {
            const newPost = {
                      name: 'Test Post',
                      text: 'This is a test post',

                  };

            let memberId, groupId, memberName, memberEmail;

            saveTestGroup()
                .then(group => {
                    const { owner, _id } = group
                    memberId = owner,
                    groupId = _id;

                    newPost.memberId = memberId;
                    newPost.groupId = groupId;

                    return groupsService()
                            .post('/post')
                            .send(newPost);
                })
                .then(result => {
                    return groupsService()
                            .get(`/group/${groupId}/posts`);
                })
                .then(result => {
                    const { body: posts } = result,
                          [ post ] = posts,
                          { _id, name, email } = post.owner;

                    expect(result.status).to.be.eql(200);
                    expect(_id).to.be.eql(memberId);
                    expect(name).to.not.be.undefined;
                    expect(email).to.not.be.undefined;
                    expect()
                    done();
                });
        });


        it('should return the group name', done => {
            const newPost = {
                      name: 'Test Post',
                      text: 'This is a test post',

                  };

            let memberId, groupId, memberName, memberEmail;

            saveTestGroup()
                .then(group => {
                    const { owner, _id } = group
                    memberId = owner,
                    groupId = _id;

                    newPost.memberId = memberId;
                    newPost.groupId = groupId;

                    return groupsService()
                            .post('/post')
                            .send(newPost);
                })
                .then(result => {
                    return groupsService()
                            .get(`/group/${groupId}/posts`);
                })
                .then(result => {
                    const { body: posts } = result,
                          [ post ] = posts,
                          { _id, name } = post.group;

                    expect(result.status).to.be.eql(200);
                    expect(_id).to.be.eql(groupId);
                    expect(name).to.be.eql(testGroupData.name);
                    expect()
                    done();
                });
        });

        it('should return an undefined event if not an event level post', done => {
            const newPost = {
                      name: 'Test Post',
                      text: 'This is a test post',

                  };

            let memberId, groupId, memberName, memberEmail;

            saveTestGroup()
                .then(group => {
                    const { owner, _id } = group
                    memberId = owner,
                    groupId = _id;

                    newPost.memberId = memberId;
                    newPost.groupId = groupId;

                    return groupsService()
                            .post('/post')
                            .send(newPost);
                })
                .then(result => {
                    return groupsService()
                            .get(`/group/${groupId}/posts`);
                })
                .then(result => {
                    const { body: posts } = result,
                          [ post ] = posts,
                          { event } = post;

                    expect(result.status).to.be.eql(200);
                    expect(event).to.be.undefined;
                    expect()
                    done();
                });
        });

        it('should return event name if post is event level', done => {
            const eventPost = {
                      name: 'Event Post',
                      text: 'This is an event post'
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

                    eventPost.memberId = memberId;
                    eventPost.groupId = groupId;

                    return groupsService()
                            .post('/event')
                            .send(newEvent);
                })
                .then(result => {
                    const { body: event } = result;
                    eventId = event._id;
                    eventPost.eventId = eventId;

                    return groupsService()
                            .post('/post')
                            .send(eventPost);
                })
                .then(result => {
                    return groupsService()
                            .get(`/group/${groupId}/posts`);
                })
                .then(result => {
                    const { body: posts } = result,
                          [ post ] = posts,
                          { event } = post;

                    expect(result.status).to.be.eql(200);
                    expect(event.name).to.be.eql(newEvent.name);
                    done();
                });
        })
    });

    describe('#findGroupByTags', () => {
        it('should return an empty array if no tags are supplied', done => {
            saveTestGroup()
                .then(group => {
                    return groupsService()
                            .get('/group/?tags');
                })
                .then(response => {
                    expect(response.status).to.be.eql(200);
                    expect(response.body).to.be.an('array');
                    expect(response.body.length).to.be.eql(0);
                    done();
                });
        });

        it('should return an empty array if no groups have the given tags', done => {
            // testGroup tags = 'test' and 'testing'
            saveTestGroup()
                .then(group => {
                    return groupsService()
                            .get('/group/?tags=foo&tags=bar');
                })
                .then(response => {
                    expect(response.status).to.be.eql(200);
                    expect(response.body).to.be.an('array');
                    expect(response.body.length).to.be.eql(0);
                    done();
                });
        });

        it('should return an array with a single group if only 1 group matches any of the tags', done => {
            const groupOneData = {
                      name: 'Test',
                      isPublic: true,
                      tags: 'test, testing'
                  },
                  groupTwoData = {
                      name: 'Test Again',
                      isPublic: true,
                      tags: 'notest, testing'
                  };

            saveTestMember()
                .then(member => {
                    groupOneData.memberId = member._id;
                    groupTwoData.memberId = member._id;
                    return groupsService()
                            .post('/group')
                            .send(groupOneData);
                })
                .then(() => {
                    return groupsService()
                            .post('/group')
                            .send(groupTwoData);
                })
                .then(() => {
                    return groupsService()
                            .get('/group/?tags=test&tags=bar');
                })
                .then(response => {
                    expect(response.status).to.be.eql(200);
                    expect(response.body).to.be.an('array');
                    expect(response.body.length).to.be.eql(1);
                    done();
                });
        });

        it('should return an array with all groups matching a tag', done => {
            const groupOneData = {
                      name: 'Test',
                      isPublic: true,
                      tags: 'test, testing'
                  },
                  groupTwoData = {
                      name: 'Test Again',
                      isPublic: true,
                      tags: 'notest, testing'
                  };

            saveTestMember()
                .then(member => {
                    groupOneData.memberId = member._id;
                    groupTwoData.memberId = member._id;
                    return groupsService()
                            .post('/group')
                            .send(groupOneData);
                })
                .then(() => {
                    return groupsService()
                            .post('/group')
                            .send(groupTwoData);
                })
                .then(() => {
                    return groupsService()
                            .get('/group/?tags=testing&tags=bar');
                })
                .then(response => {
                    expect(response.status).to.be.eql(200);
                    expect(response.body).to.be.an('array');
                    expect(response.body.length).to.be.eql(2);
                    done();
                });
        });

        it('should return an array with all groups matching any of the tags listed', done => {
            const groupOneData = {
                      name: 'Test',
                      isPublic: true,
                      tags: 'test, testing'
                  },
                  groupTwoData = {
                      name: 'Test Again',
                      isPublic: true,
                      tags: 'notest, testing'
                  },
                  groupThreeData = {
                      name: 'Test Thrice',
                      isPublic: true,
                      tags: 'test, notesting'
                  };

            saveTestMember()
                .then(member => {
                    groupOneData.memberId = member._id;
                    groupTwoData.memberId = member._id;
                    groupThreeData.memberId = member._id;
                    return groupsService()
                            .post('/group')
                            .send(groupOneData);
                })
                .then(() => {
                    return groupsService()
                            .post('/group')
                            .send(groupTwoData);
                })
                .then(() => {
                    return groupsService()
                            .post('/group')
                            .send(groupThreeData);
                })
                .then(() => {
                    return groupsService()
                            .get('/group/?tags=testing&tags=test');
                })
                .then(response => {
                    expect(response.status).to.be.eql(200);
                    expect(response.body).to.be.an('array');
                    expect(response.body.length).to.be.eql(3);
                    done();
                });
        });

        it('should only return public groups matching any of the tags listed', done => {
            const groupOneData = {
                      name: 'Test',
                      isPublic: true,
                      tags: 'test, testing'
                  },
                  groupTwoData = {
                      name: 'Test Again',
                      isPublic: true,
                      tags: 'notest, testing'
                  },
                  groupThreeData = {
                      name: 'Test Thrice',
                      isPublic: false,
                      tags: 'test, notesting'
                  };

            saveTestMember()
                .then(member => {
                    groupOneData.memberId = member._id;
                    groupTwoData.memberId = member._id;
                    groupThreeData.memberId = member._id;
                    return groupsService()
                            .post('/group')
                            .send(groupOneData);
                })
                .then(() => {
                    return groupsService()
                            .post('/group')
                            .send(groupTwoData);
                })
                .then(() => {
                    return groupsService()
                            .post('/group')
                            .send(groupThreeData);
                })
                .then(() => {
                    return groupsService()
                            .get('/group/?tags=testing&tags=test');
                })
                .then(response => {
                    expect(response.status).to.be.eql(200);
                    expect(response.body).to.be.an('array');
                    expect(response.body.length).to.be.eql(2);
                    done();
                });
        });

    });
});
