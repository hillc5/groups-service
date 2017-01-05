const mongoose = require('mongoose'),
      { Member, Group, Event } = require('../../service/models/Model'),
      { saveTestMember, saveTestGroup, testGroupData } = require('../util/test-helpers')

      chai = require('chai'),
      chaiHttp = require('chai-http'),

      service = require('../../service/service')
      expect = chai.expect;

chai.use(chaiHttp);

function callService() {
    return chai.request(service);
}

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
                  endDate: Date.now()
              };

            callService()
                .post(`/group/wrongId/member/${testGroupData.owner}/event`)
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
                      endDate: Date.now()
                  };

            callService()
                .post(`/group/${testGroupData.owner}/member/wrongId/event`)
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
                      endDate: Date.now()
                  };

            callService()
                .post(`/group/${testGroupData.owner}/member/${testGroupData.owner}/event`)
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
                      endDate: Date.now()
                  };

            callService()
                .post(`/group/${testGroupData.owner}/member/${testGroupData.owner}/event`)
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
                      startDate: Date.now()
                  };

            callService()
                .post(`/group/${testGroupData.owner}/member/${testGroupData.owner}/event`)
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

            saveTestMember()
                .then(member => {
                    memberId = member._id;
                    return saveTestGroup();
                })
                .then(group => {
                    groupId = group._id;
                    return callService()
                            .post(`/group/${groupId}/member/${memberId}/event`)
                            .send(newEvent);
                })
                .then(result => {
                    const { body: event } = result;
                    expect(result.status).to.be.eql(201);
                    expect(mongoose.mongo.ObjectId(event.group)).to.be.eql(groupId);
                    expect(mongoose.mongo.ObjectId(event.creator)).to.be.eql(memberId);
                    done();
                });
        });

        it('should return the full event on success', done => {
            const newEvent = {
                      name: 'Test Event',
                      startDate: new Date(),
                      endDate: new Date()
                  };

            let memberId, groupId;

            saveTestMember()
                .then(member => {
                    memberId = member._id;
                    return saveTestGroup();
                })
                .then(group => {
                    groupId = group._id;
                    return callService()
                            .post(`/group/${groupId}/member/${memberId}/event`)
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

        it('should store eventId in the creating members memberEvents array', done => {
            const newEvent = {
                      name: 'Test Event',
                      startDate: new Date(),
                      endDate: new Date()
                  };

            let memberId, groupId, eventId;

            saveTestMember()
                .then(member => {
                    memberId = member._id;
                    return saveTestGroup();
                })
                .then(group => {
                    groupId = group._id;
                    return callService()
                            .post(`/group/${groupId}/member/${memberId}/event`)
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

            saveTestMember()
                .then(member => {
                    memberId = member._id;
                    return saveTestGroup();
                })
                .then(group => {
                    groupId = group._id;
                    return callService()
                            .post(`/group/${groupId}/member/${memberId}/event`)
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

            saveTestMember()
                .then(member => {
                    memberOneId = member._id;
                    return callService()
                            .post(`/member`)
                            .send(newMember);
                })
                .then(result => {
                    memberTwoId = mongoose.mongo.ObjectId(result.body._id);
                    return saveTestGroup();
                })
                .then(group => {
                    newEvent.invitees.push(memberOneId);
                    newEvent.invitees.push(memberTwoId);
                    return callService()
                            .post(`/group/${group._id}/member/${memberOneId}/event`)
                            .send(newEvent);
                })
                .then(result => {
                    const { body: event } = result,
                          { invitees } = event;

                    expect(mongoose.mongo.ObjectId(invitees[0])).to.be.eql(memberOneId);
                    expect(mongoose.mongo.ObjectId(invitees[1])).to.be.eql(memberTwoId);
                    done();
                })
                .catch(err => console.log(err));
        });

    });


    describe('#getAllMemberEvents', () => {
        it('should return 400 if an invalid memberId is given', done => {

           callService()
                .get('/member/wrongId/event')
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

        it('should return 200 on success', done => {
            saveTestMember()
                .then(member => {
                    let memberId = member._id;
                    return callService()
                            .get(`/member/${memberId}/event`);
                })
                .then(result => {
                    expect(result.status).to.be.eql(200);
                    done();
                });
        });

        it('should return an empty array when no events are found for given member', done => {
            saveTestMember()
                .then(member => {
                    let memberId = member._id;
                    return callService()
                            .get(`/member/${memberId}/event`);
                })
                .then(result => {
                    const { body: events } = result
                    expect(result.status).to.be.eql(200);
                    expect(events.length).to.be.eql(0);
                    expect(events).to.be.eql([]);
                    done();
                });
        });

        it('should return a single event that a member has created', done => {
            const newGroup = {
                      name: 'Test Group',
                      isPublic: true
                  },
                  newEvent = {
                      name: 'Test Event',
                      startDate: new Date(),
                      endDate: new Date()
                  };

            let memberId;

            saveTestMember()
                .then(member => {
                    memberId = member._id;
                    return callService()
                            .post(`/member/${memberId}/group`)
                            .send(newGroup);
                })
                .then(result => {
                    const { _id: groupId } = result.body;

                    return callService()
                            .post(`/group/${groupId}/member/${memberId}/event`)
                            .send(newEvent);
                })
                .then(() => {
                    return callService()
                            .get(`/member/${memberId}/event`);
                })
                .then(result => {
                    const events = result.body,
                          event = events[0];

                    expect(result.status).to.be.eql(200);
                    expect(events.length).to.be.eql(1);
                    expect(event.name).to.be.eql(newEvent.name);
                    done();
                });
        });

        it('should return all events that a member has created for a single group', done => {
            const newGroup = {
                      name: 'Test Group',
                      isPublic: true
                  },
                  newEventOne = {
                      name: 'Test Event 1',
                      startDate: new Date(),
                      endDate: new Date()
                  },
                  newEventTwo = {
                      name: 'Test Event 2',
                      startDate: new Date(),
                      endDate: new Date()
                  };

            let memberId, groupId;

            saveTestMember()
                .then(member => {
                    memberId = member._id;
                    return callService()
                            .post(`/member/${memberId}/group`)
                            .send(newGroup);
                })
                .then(result => {
                    groupId = result.body._id;

                    return callService()
                            .post(`/group/${groupId}/member/${memberId}/event`)
                            .send(newEventOne);
                })
                .then(() => {
                    return callService()
                            .post(`/group/${groupId}/member/${memberId}/event`)
                            .send(newEventTwo);
                })
                .then(() => {
                    return callService()
                            .get(`/member/${memberId}/event`);
                })
                .then(result => {
                    const events = result.body,
                          eventOne = events[0],
                          eventTwo = events[1];

                    expect(result.status).to.be.eql(200);
                    expect(events.length).to.be.eql(2);
                    expect(eventOne.name).to.be.eql(newEventOne.name);
                    expect(eventTwo.name).to.be.eql(newEventTwo.name);
                    expect(eventOne.group._id).to.be.eql(groupId);
                    expect(eventTwo.group._id).to.be.eql(groupId);
                    done();
                });
        });

        it('should return all events that a member has created across multiple groups', done => {
            const newGroupOne = {
                      name: 'Test Group One',
                      isPublic: true
                  },
                  newGroupTwo = {
                      name: 'Test Group Two',
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

            let memberId, groupIdOne, groupIdTwo;


            saveTestMember()
                .then(member => {
                    memberId = member._id;
                    return callService()
                            .post(`/member/${memberId}/group`)
                            .send(newGroupOne);
                })
                .then(result => {
                    groupIdOne = result.body._id;

                    return callService()
                            .post(`/group/${groupIdOne}/member/${memberId}/event`)
                            .send(newEventOne);
                })
                .then(() => {
                    return callService()
                            .post(`/member/${memberId}/group`)
                            .send(newGroupTwo);
                })
                .then(result => {
                    groupIdTwo = result.body._id;

                    return callService()
                            .post(`/group/${groupIdTwo}/member/${memberId}/event`)
                            .send(newEventTwo);
                })
                .then(() => {
                    return callService()
                            .get(`/member/${memberId}/event`);
                })
                .then(result => {
                    const { body: events } = result,
                          eventOne = events[0],
                          eventTwo = events[1];

                    expect(result.status).to.be.eql(200);
                    expect(events.length).to.be.eql(2);
                    expect(eventOne.name).to.be.eql(newEventOne.name);
                    expect(eventOne.group._id).to.be.eql(groupIdOne);
                    expect(eventTwo.name).to.be.eql(newEventTwo.name);
                    expect(eventTwo.group._id).to.be.eql(groupIdTwo);
                    expect(mongoose.mongo.ObjectId(eventOne.creator._id)).to.be.eql(memberId);
                    expect(mongoose.mongo.ObjectId(eventTwo.creator._id)).to.be.eql(memberId);
                    done();
                });
        });

        it('should return the full event', done => {
            const newGroup = {
                      name: 'Test Group',
                      isPublic: true
                  },
                  newEvent = {
                      name: 'Test Event',
                      startDate: new Date(),
                      endDate: new Date()
                  };

            let memberId;

            saveTestMember()
                .then(member => {
                    memberId = member._id;
                    return callService()
                            .post(`/member/${memberId}/group`)
                            .send(newGroup);
                })
                .then(result => {
                    const { _id: groupId } = result.body;

                    return callService()
                            .post(`/group/${groupId}/member/${memberId}/event`)
                            .send(newEvent);
                })
                .then(() => {
                    return callService()
                            .get(`/member/${memberId}/event`);
                })
                .then(result => {
                    const events = result.body,
                          event = events[0];

                    expect(result.status).to.be.eql(200);
                    expect(event.name).to.be.eql(newEvent.name);
                    expect(new Date(event.startDate)).to.be.eql(newEvent.startDate);
                    expect(new Date(event.endDate)).to.be.eql(newEvent.endDate);
                    expect(event.creator).to.not.be.undefined;
                    expect(event.group).to.not.be.undefined;
                    expect(event.invitees).to.be.eql([]);
                    expect(event.attendees).to.be.eql([]);
                    expect(event.posts).to.be.eql([]);
                    done();
                });
        })

        it('should return the creator with name, _id, and email', done => {
            const newGroup = {
                      name: 'Test Group',
                      isPublic: true
                  },
                  newEvent = {
                      name: 'Test Event',
                      startDate: new Date(),
                      endDate: new Date()
                  };

            let memberId;

            saveTestMember()
                .then(member => {
                    memberId = member._id;
                    return callService()
                            .post(`/member/${memberId}/group`)
                            .send(newGroup);
                })
                .then(result => {
                    const { _id: groupId } = result.body;

                    return callService()
                            .post(`/group/${groupId}/member/${memberId}/event`)
                            .send(newEvent);
                })
                .then(() => {
                    return callService()
                            .get(`/member/${memberId}/event`);
                })
                .then(result => {
                    const events = result.body,
                          event = events[0],
                          creator = event.creator;

                    expect(result.status).to.be.eql(200);
                    expect(creator.name).to.not.be.undefined;
                    expect(creator.email).to.not.be.undefined;
                    expect(creator._id).to.not.be.undefined;
                    done();
                });
        });

        it('should return the group with name, and _id', done => {
            const newGroup = {
                      name: 'Test Group',
                      isPublic: true
                  },
                  newEvent = {
                      name: 'Test Event',
                      startDate: new Date(),
                      endDate: new Date()
                  };

            let memberId;

            saveTestMember()
                .then(member => {
                    memberId = member._id;
                    return callService()
                            .post(`/member/${memberId}/group`)
                            .send(newGroup);
                })
                .then(result => {
                    const { _id: groupId } = result.body;

                    return callService()
                            .post(`/group/${groupId}/member/${memberId}/event`)
                            .send(newEvent);
                })
                .then(() => {
                    return callService()
                            .get(`/member/${memberId}/event`);
                })
                .then(result => {
                    const events = result.body,
                          event = events[0],
                          group = event.group;

                    expect(result.status).to.be.eql(200);
                    expect(group.name).to.not.be.undefined;
                    expect(group._id).to.not.be.undefined;
                    done();
                });
        });
    });

    describe('#findEventById', () => {
        it('should return 400 if malformed id is given', done => {
            callService()
                .get('/event/wrongId')
                .then(() => {
                    // Fail test if we hit this block
                    expect(false).to.be.true;
                })
                .catch(err => {
                    const error = JSON.parse(err.response.text);
                    expect(err.status).to.be.eql(400);
                    expect(error.id.param).to.not.be.undefined;
                    expect(error.id.param).to.be.eql('id');
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

                    return callService()
                            .post(`/member/${memberId}/group`)
                            .send(newGroup);
                })
                .then(result => {
                    groupId = result.body._id;

                    return callService()
                            .post(`/group/${groupId}/member/${memberId}/event`)
                            .send(newEvent);
                })
                .then(result => {
                    const eventId = result.body._id;
                    return callService()
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

                    return callService()
                            .post(`/member/${memberId}/group`)
                            .send(newGroup);
                })
                .then(result => {
                    groupId = result.body._id;

                    return callService()
                            .post(`/group/${groupId}/member/${memberId}/event`)
                            .send(newEvent);
                })
                .then(result => {
                    const eventId = result.body._id;
                    return callService()
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

                    return callService()
                            .post(`/member/${savedMember._id}/group`)
                            .send(newGroup);
                })
                .then(result => {
                    groupId = result.body._id;

                    return callService()
                            .post(`/group/${groupId}/member/${savedMember._id}/event`)
                            .send(newEvent);
                })
                .then(result => {
                    const eventId = result.body._id;
                    return callService()
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

                    return callService()
                            .post(`/member/${savedMember._id}/group`)
                            .send(newGroup);
                })
                .then(result => {
                    groupId = result.body._id;
                    return callService()
                            .post('/member')
                            .send(newMember);
                })
                .then(result => {
                    const invitee = result.body;
                    newEvent.invitees = [];
                    newEvent.invitees.push(invitee._id);
                    return callService()
                            .post(`/group/${groupId}/member/${savedMember._id}/event`)
                            .send(newEvent);
                })
                .then(result => {
                    const eventId = result.body._id;
                    return callService()
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
});
