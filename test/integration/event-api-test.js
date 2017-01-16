const mongoose = require('mongoose'),
      { Member, Group, Event } = require('../../service/models/Model'),
      { groupsService, saveTestMember, saveTestGroup, testGroupData } = require('../util/test-helpers')

      chai = require('chai'),

      service = require('../../service/service'),
      expect = chai.expect;

chai.use(chaiHttp);

describe('event-api', () => {
    afterEach(done => {
        Member.remove({})
            .then(() => Group.remove({}))
            .then(() => Event.remove({}))
            .then(done());
    });

    describe('#createEvent', () => {
        it('should return 400 if groupId is not a valid mongo ObjectId', done => {
            const newEvent = {
                  name: 'Test Event',
                  startDate: Date.now(),
                  endDate: Date.now(),
                  memberId: testGroupData.owner,
                  groupId: 'wrongId'
              };

            groupsService()
                .post('/event')
                .send(newEvent)
                .then(() => {
                    // Fail test if we hit this block
                    expect(false).to.be.true;
                })
                .catch(err => {
                    const error = JSON.parse(err.response.text);
                    expect(err.status).to.be.eql(400);
                    expect(error.groupId.param).to.not.be.undefined;
                    expect(error.groupId.param).to.be.eql('groupId');
                    done();
                });
        });

        it('should return 400 if memberId is not a valid mongo ObjectId', done => {
            const newEvent = {
                      name: 'Test Event',
                      startDate: Date.now(),
                      endDate: Date.now(),
                      groupId: testGroupData.owner,
                      memberId: 'wrongId'
                  };

            groupsService()
                .post('/event')
                .send(newEvent)
                .then(() => {
                    // Fail test if we hit this block
                    expect(false).to.be.true;
                })
                .catch(err => {
                    const error = JSON.parse(err.response.text);
                    expect(err.status).to.be.eql(400);
                    expect(error.memberId.param).to.not.be.undefined;
                    expect(error.memberId.param).to.be.eql('memberId');
                    done();
                });
        });

        it('should return 400 if event name is missing', done => {
            const newEvent = {
                      startDate: Date.now(),
                      endDate: Date.now(),
                      groupId: testGroupData.owner,
                      memberId: testGroupData.owner
                  };

            groupsService()
                .post('/event')
                .send(newEvent)
                .then(() => {
                    // Fail test if we hit this block
                    expect(false).to.be.true;
                })
                .catch(err => {
                    const error = JSON.parse(err.response.text);
                    expect(err.status).to.be.eql(400);
                    expect(error.name.param).to.not.be.undefined;
                    expect(error.name.param).to.be.eql('name');
                    done();
                });
        });

        it('should return 400 if event startDate is missing', done => {
            const newEvent = {
                      name: 'Test Event',
                      endDate: Date.now(),
                      groupId: testGroupData.owner,
                      memberId: testGroupData.owner
                  };

            groupsService()
                .post('/event')
                .send(newEvent)
                .then(() => {
                    // Fail test if we hit this block
                    expect(false).to.be.true;
                })
                .catch(err => {
                    const error = JSON.parse(err.response.text);
                    expect(err.status).to.be.eql(400);
                    expect(error.startDate.param).to.not.be.undefined;
                    expect(error.startDate.param).to.be.eql('startDate');
                    done();
                });
        });

        it('should return 400 if event endDate is missing', done => {
            const newEvent = {
                      name: 'Test Event',
                      startDate: Date.now(),
                      groupId: testGroupData.owner,
                      memberId: testGroupData.owner
                  };

            groupsService()
                .post('/event')
                .send(newEvent)
                .then(() => {
                    // Fail test if we hit this block
                    expect(false).to.be.true;
                })
                .catch(err => {
                    const error = JSON.parse(err.response.text);
                    expect(err.status).to.be.eql(400);
                    expect(error.endDate.param).to.not.be.undefined;
                    expect(error.endDate.param).to.be.eql('endDate');
                    done();
                });
        });

        it('should return 201 if event is created successfully', done => {
            const newEvent = {
                      name: 'Test Event',
                      startDate: new Date(),
                      endDate: new Date()
                  };

            let memberId, groupId;

            saveTestGroup()
                .then(group => {
                    groupId = group._id;
                    memberId = group.owner;

                    newEvent.groupId = groupId;
                    newEvent.memberId = memberId;
                    return groupsService()
                            .post('/event')
                            .send(newEvent);
                })
                .then(result => {
                    const { body: event } = result;
                    expect(result.status).to.be.eql(201);
                    expect(event.group).to.be.eql(groupId);
                    expect(event.creator).to.be.eql(memberId);
                    done();
                })
                .catch(err => console.log(err));
        });

        it('should return the full event on success', done => {
            const newEvent = {
                      name: 'Test Event',
                      startDate: new Date(),
                      endDate: new Date()
                  };

            let memberId, groupId;

            saveTestGroup()
                .then(group => {
                    memberId = group.owner
                    groupId = group._id;

                    newEvent.memberId = memberId;
                    newEvent.groupId = groupId;
                    return groupsService()
                            .post('/event')
                            .send(newEvent);
                })
                .then(result => {
                    const { body: event } = result;
                    expect(event.name).to.be.a('string');
                    expect(event.name).to.be.eql(newEvent.name);
                    expect(event.startDate).to.be.a('string');
                    expect(new Date(event.startDate)).to.be.an.instanceOf(Date);
                    expect(event.endDate).to.be.a('string');
                    expect(new Date(event.endDate)).to.be.an.instanceOf(Date);
                    expect(mongoose.mongo.ObjectId(event.creator)).to.be.an.instanceOf(mongoose.mongo.ObjectId);
                    expect(mongoose.mongo.ObjectId(event.group)).to.be.an.instanceOf(mongoose.mongo.ObjectId);
                    expect(event.posts).to.be.an('array');
                    expect(event.posts.length).to.be.eql(0);
                    expect(event.invitees).to.be.an('array');
                    expect(event.invitees.length).to.be.eql(0);
                    expect(event.attendees).to.be.an('array');
                    expect(event.attendees.length).to.be.eql(0);
                    done();
                });
        });

        it('should allow invitees to be added on creation', done => {
            const newEvent = {
                      name: 'Test Event',
                      startDate: new Date(),
                      endDate: new Date(),
                      invitees: []
                  },
                  newMember = {
                      name: 'Test',
                      email: 'Bill@Bob.com'
                  };

            let memberOneId, memberTwoId;

            saveTestGroup()
                .then(group => {
                    memberOneId = group.owner;
                    newEvent.memberId = memberOneId;
                    newEvent.groupId = group._id;
                    return groupsService()
                            .post(`/member`)
                            .send(newMember);
                })
                .then(result => {
                    memberTwoId = result.body._id;
                    newEvent.invitees.push(memberOneId);
                    newEvent.invitees.push(memberTwoId);
                    return groupsService()
                            .post('/event')
                            .send(newEvent);
                })
                .then(result => {
                    const { body: event } = result,
                          { invitees } = event;

                    expect(invitees[0]).to.be.eql(memberOneId);
                    expect(invitees[1]).to.be.eql(memberTwoId);
                    done();
                });
        });

        it('should store eventId in the creating members memberEvents array', done => {
            const newEvent = {
                      name: 'Test Event',
                      startDate: new Date(),
                      endDate: new Date()
                  };

            let memberId, groupId, eventId;

            saveTestGroup()
                .then(group => {
                    memberId = group.owner;
                    newEvent.memberId = memberId;
                    groupId = group._id;
                    newEvent.groupId = groupId;
                    return groupsService()
                            .post('/event')
                            .send(newEvent);
                })
                .then(result => {
                    eventId = result.body._id;
                    return Member.findOne({ _id: memberId });
                })
                .then(member => {
                    expect(member.memberEvents).to.include(eventId);
                    done();
                });
        });

        it('should store eventId in the owning groups events array', done => {
            const newEvent = {
                      name: 'Test Event',
                      startDate: new Date(),
                      endDate: new Date()
                  };

            let memberId, groupId, eventId;

            saveTestGroup()
                .then(group => {
                    memberId = group.owner;
                    newEvent.memberId = memberId;
                    groupId = group._id;
                    newEvent.groupId = groupId;
                    return groupsService()
                            .post('/event')
                            .send(newEvent);
                })
                .then(result => {
                    eventId = result.body._id;
                    return Group.findOne({ _id: groupId });
                })
                .then(group => {
                    expect(group.events).to.include(eventId);
                    done();
                });
        });

        it('should store eventId in memberEvents array for all invitees', done => {
            const newEvent = {
                      name: 'Test Event',
                      startDate: new Date(),
                      endDate: new Date(),
                      invitees: []
                  },
                  newMember = {
                      name: 'Test',
                      email: 'Bill@Bob.com'
                  };

            let memberOneId, memberTwoId, eventId;

            saveTestGroup()
                .then(group => {
                    memberOneId = group.owner;
                    newEvent.groupId = group._id;
                    newEvent.memberId = memberOneId;
                    return groupsService()
                            .post(`/member`)
                            .send(newMember);
                })
                .then(result => {
                    memberTwoId = result.body._id;
                    newEvent.invitees.push(memberOneId);
                    newEvent.invitees.push(memberTwoId);
                    return groupsService()
                            .post('/event')
                            .send(newEvent);
                })
                .then(result => {
                    const { body: event } = result,
                          { invitees } = event;

                    eventId = event._id;

                    expect(invitees[0]).to.be.eql(memberOneId);
                    expect(invitees[1]).to.be.eql(memberTwoId);

                    return groupsService()
                            .get(`/member/${memberOneId}`);
                })
                .then(result => {
                    const { memberEvents } = result.body,
                          [ event ] = memberEvents,
                          { _id: memberEventId } = event;

                    expect(memberEventId).to.be.eql(eventId);

                    return groupsService()
                            .get(`/member/${memberTwoId}`);
                })
                .then(result => {
                    const { memberEvents } = result.body,
                          [ event ] = memberEvents,
                          { _id: memberEventId } = event;

                    expect(memberEventId).to.be.eql(eventId);
                    done();
                });
        });

    });

    describe('#findEventById', () => {
        it('should return 400 if malformed id is given', done => {
            groupsService()
                .get('/event/wrongId')
                .then(() => {
                    // Fail test if we hit this block
                    expect(false).to.be.true;
                })
                .catch(err => {
                    const error = JSON.parse(err.response.text);
                    expect(err.status).to.be.eql(400);
                    expect(error.eventId.param).to.not.be.undefined;
                    expect(error.eventId.param).to.be.eql('eventId');
                    done();
                });
        });

        it('should return 200 if an event is found successfully', done => {
            const newGroup = {
                      name: 'Test Group',
                      isPublic: true
                  },
                  newEvent = {
                      name: 'Test Event',
                      startDate: new Date(),
                      endDate: new Date()
                  };

            let memberId, groupId;

            saveTestMember()
                .then(member => {
                    memberId = member._id;
                    newGroup.owner = memberId;
                    newEvent.memberId = memberId;
                    return groupsService()
                            .post('/group')
                            .send(newGroup);
                })
                .then(result => {
                    groupId = result.body._id;
                    newEvent.groupId = groupId;
                    return groupsService()
                            .post('/event')
                            .send(newEvent);
                })
                .then(result => {
                    const eventId = result.body._id;
                    return groupsService()
                            .get(`/event/${eventId}`);
                })
                .then(result => {
                    expect(result.status).to.be.eql(200);
                    done();
                });
        });

        it('should return name, and id for the events group', done => {
            const newGroup = {
                      name: 'Test Group',
                      isPublic: true
                  },
                  newEvent = {
                      name: 'Test Event',
                      startDate: new Date(),
                      endDate: new Date()
                  };

            let memberId, groupId;

            saveTestMember()
                .then(member => {
                    memberId = member._id;
                    newGroup.owner = memberId;
                    newEvent.memberId = memberId;
                    return groupsService()
                            .post('/group')
                            .send(newGroup);
                })
                .then(result => {
                    groupId = result.body._id;
                    newEvent.groupId = groupId;
                    return groupsService()
                            .post('/event')
                            .send(newEvent);
                })
                .then(result => {
                    const eventId = result.body._id;
                    return groupsService()
                            .get(`/event/${eventId}`);
                })
                .then(result => {
                    const { body: event } = result;
                    expect(event.group).to.not.be.undefined;
                    expect(event.group.name).to.be.eql(newGroup.name);
                    expect(event._id).to.not.be.undefined;
                    done();
                });
        });

        it('should return name, email, and joinDate for the events creator', done => {
            const newGroup = {
                      name: 'Test Group',
                      isPublic: true
                  },
                  newEvent = {
                      name: 'Test Event',
                      startDate: new Date(),
                      endDate: new Date()
                  };

            let savedMember, groupId;

            saveTestMember()
                .then(member => {
                    savedMember = member;
                    newGroup.owner = savedMember._id;
                    newEvent.memberId = savedMember._id;
                    return groupsService()
                            .post('/group')
                            .send(newGroup);
                })
                .then(result => {
                    groupId = result.body._id;
                    newEvent.groupId = groupId;
                    return groupsService()
                            .post('/event')
                            .send(newEvent);
                })
                .then(result => {
                    const eventId = result.body._id;
                    return groupsService()
                            .get(`/event/${eventId}`);
                })
                .then(result => {
                    const { body: event } = result;
                    expect(event.creator).to.not.be.undefined;
                    expect(event.creator.name).to.be.eql(savedMember.name);
                    expect(event.creator.email).to.be.eql(savedMember.email);
                    expect(event._id).to.not.be.undefined;
                    expect(new Date(event.creator.joinDate)).to.be.eql(new Date(savedMember.joinDate));
                    done();
                });
        });

        it('should return name, email, and joinDate for the events invitees', done => {
            const newGroup = {
                      name: 'Test Group',
                      isPublic: true
                  },
                  newEvent = {
                      name: 'Test Event',
                      startDate: new Date(),
                      endDate: new Date()
                  },
                  newMember = {
                      name: 'Test',
                      email: 'Bill@Bob.com'
                  };

            let savedMember, invitee, groupId;

            saveTestMember()
                .then(member => {
                    savedMember = member;
                    newGroup.owner = savedMember._id;
                    newEvent.memberId = savedMember._id;
                    return groupsService()
                            .post('/group')
                            .send(newGroup);
                })
                .then(result => {
                    groupId = result.body._id;
                    newEvent.groupId = groupId;
                    return groupsService()
                            .post('/member')
                            .send(newMember);
                })
                .then(result => {
                    const invitee = result.body;
                    newEvent.invitees = [];
                    newEvent.invitees.push(invitee._id);
                    return groupsService()
                            .post('/event')
                            .send(newEvent);
                })
                .then(result => {
                    const eventId = result.body._id;
                    return groupsService()
                            .get(`/event/${eventId}`);
                })
                .then(result => {
                    const { body: event } = result;

                    expect(event.invitees).to.not.be.undefined;

                    const [ invitee ] = event.invitees;

                    expect(invitee.name).to.be.eql(newMember.name);
                    expect(invitee.email).to.be.eql(newMember.email);
                    expect(invitee._id).to.not.be.undefined;
                    expect(invitee.joinDate).to.not.be.undefined;
                    done();
                });
        });
    });

    describe('#inviteMember', () => {
        it('should return 400 if the eventId is invalid', done => {
            const memberId = testGroupData.owner;
            groupsService()
                .post('/event/wrongId/invite')
                .send({ memberId })
                .then(result => {
                    // Fail test if we hit this block
                    expect(false).to.be.true;
                })
                .catch(err => {
                    expect(err.status).to.be.eql(400);
                    done();
                })
        });

        it('should return 400 if the memberId is invalid', done => {
            groupsService()
                .post('/event/585d851c1b865511bb0543d2/invite')
                .send({ memberId: 'wrongId' })
                .then(result => {
                    // Fail test if we hit this block
                    expect(false).to.be.true;
                })
                .catch(err => {
                    expect(err.status).to.be.eql(400);
                    done();
                })
        });

        it('should return 404 if the event is not found', done => {
            groupsService()
                .post('/event/585d851c1b865511bb0543d2/event')
                .send({ memberId: '585d851c1b865511bb0543d2' })
                .then(result => {
                    // Fail test if we hit this block
                    expect(false).to.be.true;
                })
                .catch(err => {
                    expect(err.status).to.be.eql(404);
                    done();
                })
        })

        it('should return 200 on success', done => {
            const newEvent = {
                      name: 'Test Event',
                      startDate: new Date(),
                      endDate: new Date()
                  };

            let memberToAddId, eventId;

            saveTestGroup()
                .then(group => {
                    newEvent.groupId = group._id;
                    newEvent.memberId = group.owner;
                    return groupsService()
                            .post('/event')
                            .send(newEvent);
                })
                .then(result => {
                    eventId = result.body._id;
                    return saveTestMember()
                })
                .then(member => {
                    memberToAddId = member._id;
                    return groupsService()
                            .post(`/event/${eventId}/invite`)
                            .send({ memberId: memberToAddId });
                })
                .then(result => {
                    expect(result.status).to.be.eql(200);
                    done();
                })
        });

        it('should return the event with the member added to the invitees array', done => {
            const newEvent = {
                      name: 'Test Event',
                      startDate: new Date(),
                      endDate: new Date()
                  };

            let memberToAddId, eventId;

            saveTestGroup()
                .then(group => {
                    newEvent.groupId = group._id;
                    newEvent.memberId = group.owner;
                    return groupsService()
                            .post('/event')
                            .send(newEvent);
                })
                .then(result => {
                    eventId = result.body._id;
                    return saveTestMember()
                })
                .then(member => {
                    memberToAddId = member._id;
                    return groupsService()
                            .post(`/event/${eventId}/invite`)
                            .send({ memberId: memberToAddId });
                })
                .then(result => {
                    const { body: event } = result;
                    expect(event.invitees).to.include(memberToAddId);
                    done();
                });
        });

        it('should add a member to an invitees array that has other members in it', done => {
            const newEvent = {
                      name: 'Test Event',
                      startDate: new Date(),
                      endDate: new Date()
                  };

            let memberToAddId, eventId;

            saveTestGroup()
                .then(group => {
                    newEvent.groupId = group._id;
                    newEvent.memberId = group.owner;
                    newEvent.invitees = [ group.owner ];
                    return groupsService()
                            .post('/event')
                            .send(newEvent);
                })
                .then(result => {
                    eventId = result.body._id;
                    return saveTestMember()
                })
                .then(member => {
                    memberToAddId = member._id;
                    return groupsService()
                            .post(`/event/${eventId}/invite`)
                            .send({ memberId: memberToAddId });
                })
                .then(result => {
                    const { body: event } = result;
                    expect(event.invitees.length).to.be.eql(2);
                    expect(event.invitees).to.include(newEvent.memberId);
                    expect(event.invitees).to.include(memberToAddId);
                    done();
                });
        });

        it('should not add a duplicate memberId', done => {
            const newEvent = {
                      name: 'Test Event',
                      startDate: new Date(),
                      endDate: new Date()
                  };

            let memberToAddId, eventId;

            saveTestGroup()
                .then(group => {
                    newEvent.groupId = group._id;
                    newEvent.memberId = group.owner;
                    return groupsService()
                            .post('/event')
                            .send(newEvent);
                })
                .then(result => {
                    eventId = result.body._id;
                    return saveTestMember()
                })
                .then(member => {
                    memberToAddId = member._id;
                    return groupsService()
                            .post(`/event/${eventId}/invite`)
                            .send({ memberId: memberToAddId });
                })
                .then(result => {
                    return groupsService()
                            .post(`/event/${eventId}/invite`)
                            .send({ memberId: memberToAddId });
                })
                .then(result => {
                    const { body: event } = result;
                    expect(event.invitees.length).to.be.eql(1);
                    expect(event.invitees).to.include(memberToAddId);
                    done();
                })
        })
    })
});
