const mongoose = require('mongoose'),
      { Member } = require('../../service/models/Model'),
      { groupsService, saveTestMember, saveTestGroup, testMemberData } = require('../util/test-helpers'),

      chai = require('chai'),

      service = require('../../service/service'),
      expect = chai.expect;

describe('member-api', () => {

    afterEach(done => {
        Member.remove({}).then(done());
    });

    describe('#createMember', () => {

        it('should return 404 if name is missing', done => {
            const newMember = {
                name: '',
                email: 'Test@test.com'
            };

            groupsService()
                .post('/member')
                .send(newMember)
                .then(res => {
                    //Fail if we hit this spot
                    expect(false).to.be.true;
                    done();
                })
                .catch(err => {
                    const error = JSON.parse(err.response.text);
                    expect(err.status).to.be.eql(400);
                    expect(error.name).to.not.be.undefined;
                    expect(error.name.param).to.be.eql('name');
                    done();
                });
        });

        it('should return 404 if email is missing', done => {
            const newMember = {
                name: 'Test',
                email: ''
            };

            groupsService()
                .post('/member')
                .send(newMember)
                .then(res => {
                    //Fail if we hit this spot
                    expect(false).to.be.true;
                    done();
                })
                .catch(err => {
                    const error = JSON.parse(err.response.text);
                    expect(err.status).to.be.equal(400);
                    expect(error.email).to.not.be.undefined;
                    expect(error.email.param).to.be.eql('email');
                    done();
                });
        });

        it('should return 201 on successful creation', done => {
            const newMember = {
                name: 'Test',
                email: 'Test@test.com'
            };

            groupsService()
                .post('/member')
                .send(newMember)
                .then(res => {
                    expect(res.status).to.be.eql(201);
                    done();
            });
        });

        it('should return full member on successful creation', done => {
            const newMember = {
                name: 'Test',
                email: 'Test@test.com'
            };

            groupsService()
                .post('/member')
                .send(newMember)
                .then(res => {
                    const { _id, __v, name, email, joinDate } = res.body;
                    expect(res.status).to.be.eql(201);
                    expect(_id).to.not.be.undefined;
                    // initial create version === 0
                    expect(__v).to.be.eql(0);
                    expect(name).to.be.eql(newMember.name);
                    expect(email).to.be.eql(newMember.email);
                    expect(joinDate).to.be.a('string');
                    expect(new Date(joinDate)).to.be.an.instanceOf(Date);
                    // make sure test fails if Member schema is updated
                    expect(Object.keys(res.body).length).to.be.eql(5);
                    done();
            });
        });
    });

    describe('#findMemberById', () => {
        it('should return 400 if invalid id sent', done => {
            groupsService()
                .get('/member/wrongID')
                .then(res => {
                    // Fail if we hit this spot
                    expect(false).to.be.true;
                    done();
                })
                .catch(err => {
                    const error = JSON.parse(err.response.text);
                    expect(err.status).to.be.eql(400);
                    expect(error.memberId).to.not.be.undefined;
                    expect(error.memberId.param).to.be.eql('memberId');
                    done();
                });
        });

        it('should return 404 if no member found with given id', done => {
            const id = '5848772a7cc11952f4110e00'
            groupsService()
                .get(`/member/${id}`)
                .then(res => {
                    // Fail if we hit this spot
                    expect(false).to.be.true;
                    done();
                })
                .catch(err => {
                    const error = JSON.parse(err.response.text);
                    expect(error.status).to.be.eql(404);
                    expect(error.message).to.be.eql(`No member found with id ${id}`);
                    done();
                })
        });

        it('should return 200 when member is found', done => {
            saveTestMember()
                .then(member => {
                    groupsService()
                        .get(`/member/${member._id}`)
                        .then(res => {
                            expect(res.status).to.be.eql(200);
                            done();
                        });
                });

        });

        it('should return the correct data when member is found', done => {
            let memberId;

            saveTestMember()
                .then(member => {
                    memberId = member._id;
                    return groupsService().get(`/member/${memberId}`)
                })
                .then(res => {
                    const { _id, name, email, joinDate } = res.body
                    expect(res.status).to.be.eql(200);
                    expect(_id).to.be.eql(memberId);
                    expect(name).to.be.eql(testMemberData.name);
                    expect(email).to.be.eql(testMemberData.email);;
                    expect(joinDate).to.not.be.undefined;
                    done();
                });

        });
    });

    describe('#getAllMemberGroups', () => {
        it('should return 400 if incorrect memberId is given', done => {
            groupsService()
                .get('/member/wrongId/groups')
                .then(result => {
                    // Fail if we hit this spot
                    expect(false).to.be.true;
                    done();
                })
                .catch(err => {
                    expect(err.status).to.be.eql(400);
                    done();
                })
        });

        it('should return 200 if call is successful', done => {
            saveTestGroup()
                .then(group => {
                    return groupsService()
                            .get(`/member/${group.owner}/groups`);
                })
                .then(result => {
                    expect(result.status).to.be.eql(200);
                    done();
                });
        });

        it('should return an empty array if the member has no groups', done => {
            saveTestMember()
                .then(member => {
                    return groupsService()
                            .get(`/member/${member._id}/groups`);
                })
                .then(result => {
                    expect(result.status).to.be.eql(200);
                    expect(result.body).to.be.eql([]);
                    done();
                });
        });

        it('should return all groups that a member owns', done => {
            const groupData = {
                    name: 'Test Group',
                    isPublic: true
                };

            saveTestMember()
                .then(member => {
                    groupData.owner = member._id;
                    return groupsService()
                            .post('/group')
                            .send(groupData);
                })
                .then(result => {
                    return groupsService()
                            .post('/group')
                            .send(groupData);
                })
                .then(result => {
                    return groupsService()
                            .get(`/member/${groupData.owner}/groups`);
                })
                .then(result => {
                    const groups = result.body;
                    expect(groups.length).to.be.eql(2);
                    expect(groups[0]._id).to.not.be.eql(groups[1]._id);
                    done();
                });
        });

        it('should return all groups to which a member belongs', done => {
            let memberId,
                ownerData = {
                    name: 'Owner',
                    email: 'Owner@owner.com'
                },
                groupOneData = {
                    name: 'group one',
                    isPublic: true
                },
                groupTwoData = {
                    name: 'group two',
                    isPublic: true
                },
                groupOneId, groupTwoId;

            saveTestMember()
                .then(member => {
                    memberId = member._id;
                    return groupsService()
                            .post('/member')
                            .send(ownerData);
                })
                .then(result => {
                    groupOneData.owner = result.body._id;
                    groupTwoData.owner = result.body._id;
                    return groupsService()
                            .post('/group')
                            .send(groupOneData);
                })
                .then(result => {
                    let { _id: groupId } = result.body;
                    return groupsService()
                            .post(`/group/${groupId}/member`)
                            .send({ memberId });
                })
                .then(result => {
                    return groupsService()
                            .post('/group')
                            .send(groupTwoData);
                })
                .then(result => {
                    let { _id: groupId } = result.body;
                    return groupsService()
                            .post(`/group/${groupId}/member`)
                            .send({ memberId });
                })
                .then(result => {
                    return groupsService()
                            .get(`/member/${memberId}/groups`);
                })
                .then(result => {
                    const groups = result.body;
                    expect(groups.length).to.be.eql(2);
                    groups.forEach(group => {
                        expect(mongoose.mongo.ObjectId(group.owner._id)).to.not.be.eql(memberId);
                    });
                    done();
                })
        });
    });

    describe('#getAllMemberEvents', () => {
        it('should return 400 if memberId is not a valid Mongo ObjectId', done => {
            groupsService()
                .get('/member/wrongId/events')
                .then(result => {
                    // Fail if we hit this spot
                    expect(false).to.be.true;
                    done();
                })
                .catch(err => {
                    expect(err.status).to.be.eql(400);
                    done();
                })
        });

        it('should return 200 if call is successful', done => {
            let memberId;

            saveTestMember()
                .then(member => {
                    memberId = member._id;

                    return groupsService()
                            .get(`/member/${memberId}/events`);
                })
                .then(result => {
                    expect(result.status).to.be.eql(200);
                    done();
                });
        });

        it('should return an empty array if the member has no events', done => {
            let memberId;

            saveTestMember()
                .then(member => {
                    memberId = member._id;

                    return groupsService()
                            .get(`/member/${memberId}/events`);
                })
                .then(result => {
                    expect(result.status).to.be.eql(200);
                    expect(result.body).to.be.eql([]);
                    done();
                });
        });

        it('should return all events that a member creates', done => {
            const newTestGroup = {
                      name: 'Test Group',
                      isPublic: true
                  },
                  newTestEvent = {
                      name: 'Test Event',
                      startDate: new Date(),
                      endDate: new Date()
                  }

            let memberId, groupId;

            saveTestMember()
                .then(member => {
                    memberId = member._id;
                    newTestGroup.owner = memberId;

                    return groupsService()
                            .post('/group')
                            .send(newTestGroup);
                })
                .then(result => {
                    groupId = result.body._id;

                    newTestEvent.memberId = memberId;
                    newTestEvent.groupId = groupId;
                    return groupsService()
                            .post('/event')
                            .send(newTestEvent);
                })
                .then(() => {
                    return groupsService()
                            .get(`/member/${memberId}/events`);
                })
                .then(result => {
                    const { body: events } = result,
                          [ event ] = events;

                    expect(event.creator._id).to.be.eql(memberId);
                    done();
                });
        });

        it('should return all events that a member has been invited to', done => {
            const newTestGroup = {
                      name: 'Test Group',
                      isPublic: true
                  },
                  newTestEvent = {
                      name: 'Test Event',
                      startDate: new Date(),
                      endDate: new Date()
                  },
                  newTestMember = {
                      name: 'Test Member',
                      email: 'Test@TestMmember.com'
                  };

            let creatorId, memberId, groupId;

            saveTestMember()
                .then(member => {
                    creatorId = member._id;
                    newTestGroup.owner = creatorId;

                    return groupsService()
                            .post('/group')
                            .send(newTestGroup);
                })
                .then(result => {
                    groupId = result.body._id;

                    return groupsService()
                            .post('/member')
                            .send(newTestMember);
                })
                .then(result => {
                    memberId = result.body._id
                    newTestEvent.memberId = creatorId;
                    newTestEvent.groupId = groupId;
                    newTestEvent.invitees = [ memberId ];
                    return groupsService()
                            .post('/event')
                            .send(newTestEvent);
                })
                .then(() => {
                    return groupsService()
                            .get(`/member/${memberId}/events`);
                })
                .then(result => {
                    const { body: events } = result,
                          [ event ] = events,
                          { invitees } = event,
                          [ invitedMember ] = invitees;

                    expect(invitedMember._id).to.be.eql(memberId);
                    done();
                });
        });

        it('should return all member events across multiple groups', done => {
            const testGroupOne = {
                      name: 'Test Group One',
                      isPublic: true
                  },
                  testGroupTwo = {
                      name: 'Test Group Two',
                      isPublic: true
                  },
                  testEventOne = {
                      name: 'Test Event One',
                      startDate: new Date(),
                      endDate: new Date()
                  },
                  testEventTwo = {
                      name: 'Test Event Two',
                      startDate: new Date(),
                      endDate: new Date()
                  };

            let memberId, groupOneId, groupTwoId;

            saveTestMember()
                .then(member => {
                    memberId = member._id;
                    testGroupOne.owner = memberId;
                    testGroupTwo.owner = memberId;
                    testEventOne.memberId = memberId;
                    testEventTwo.memberId = memberId;

                    return groupsService()
                            .post('/group')
                            .send(testGroupOne);
                })
                .then(result => {
                    groupOneId = result.body._id;
                    testEventOne.groupId = groupOneId;
                    return groupsService()
                            .post('/group')
                            .send(testGroupTwo);
                })
                .then(result => {
                    groupTwoId = result.body._id;
                    testEventTwo.groupId = groupTwoId;

                    return groupsService()
                            .post('/event')
                            .send(testEventOne);
                })
                .then(() => {
                    return groupsService()
                            .post('/event')
                            .send(testEventTwo);
                })
                .then(() => {
                    return groupsService()
                            .get(`/member/${memberId}/events`);
                })
                .then(result => {
                    const { body: events } = result,
                          [ eventOne, eventTwo ] = events;

                    expect(eventOne.creator._id).to.be.eql(memberId);
                    expect(eventTwo.creator._id).to.be.eql(memberId);
                    done();
                });
        });

        it('should return the name email and joinDate for the creator', done => {
            const newTestGroup = {
                name: 'Test Group',
                isPublic: true
            },
            newTestEvent = {
                name: 'Test Event',
                startDate: new Date(),
                endDate: new Date()
            }

            let memberId, groupId;

            saveTestMember()
                .then(member => {
                    memberId = member._id;
                    newTestGroup.owner = memberId;

                    return groupsService()
                            .post('/group')
                            .send(newTestGroup);
                })
                .then(result => {
                    groupId = result.body._id;

                    newTestEvent.memberId = memberId;
                    newTestEvent.groupId = groupId;
                    return groupsService()
                            .post('/event')
                            .send(newTestEvent);
                })
                .then(() => {
                    return groupsService()
                            .get(`/member/${memberId}/events`);
                })
                .then(result => {
                    const { body: events } = result,
                          [ event ] = events,
                          { creator } = event;

                    expect(event.creator._id).to.be.eql(memberId);
                    expect(creator.name).to.not.be.undefined;
                    expect(creator.email).to.not.be.undefined;
                    expect(creator.joinDate).to.not.be.undefined;
                    done();
                });
        });

        it('should return name, email, and joinDate for all invitees', done => {
            const newTestGroup = {
                name: 'Test Group',
                isPublic: true
            },
            newTestEvent = {
                name: 'Test Event',
                startDate: new Date(),
                endDate: new Date()
            },
              newTestMember = {
                name: 'Test Member',
                email: 'Test@TestMmember.com'
            };

            let creatorId, memberId, groupId;

            saveTestMember()
                .then(member => {
                    creatorId = member._id;
                    newTestGroup.owner = creatorId;

                    return groupsService()
                            .post('/group')
                            .send(newTestGroup);
                })
                .then(result => {
                    groupId = result.body._id;

                    return groupsService()
                            .post('/member')
                            .send(newTestMember);
                })
                .then(result => {
                    memberId = result.body._id
                    newTestEvent.memberId = creatorId;
                    newTestEvent.groupId = groupId;
                    newTestEvent.invitees = [ memberId ];
                    return groupsService()
                            .post('/event')
                            .send(newTestEvent);
                })
                .then(() => {
                    return groupsService()
                            .get(`/member/${memberId}/events`);
                })
                .then(result => {
                    const { body: events } = result,
                          [ event ] = events,
                          { invitees } = event,
                          [ invitedMember ] = invitees;

                    expect(invitedMember._id).to.be.eql(memberId);
                    expect(invitedMember.name).to.not.be.undefined;
                    expect(invitedMember.email).to.not.be.undefined;
                    expect(invitedMember.joinDate).to.not.be.undefined;
                    done();
                })
                .catch(err => console.log(err));
        });

        it('should return the name, and tags for the events group', done => {
            const newTestGroup = {
                name: 'Test Group',
                isPublic: true
            },
            newTestEvent = {
                name: 'Test Event',
                startDate: new Date(),
                endDate: new Date()
            }

            let memberId, groupId;

            saveTestMember()
                .then(member => {
                    memberId = member._id;
                    newTestGroup.owner = memberId;

                    return groupsService()
                            .post('/group')
                            .send(newTestGroup);
                })
                .then(result => {
                    groupId = result.body._id;

                    newTestEvent.memberId = memberId;
                    newTestEvent.groupId = groupId;
                    return groupsService()
                            .post('/event')
                            .send(newTestEvent);
                })
                .then(() => {
                    return groupsService()
                            .get(`/member/${memberId}/events`);
                })
                .then(result => {
                    const { body: events } = result,
                          [ event ] = events,
                          { group } = event;

                    expect(group.name).to.not.be.undefined;
                    expect(group.tags).to.not.be.undefined;
                    done();
                });
        });
    })
});
