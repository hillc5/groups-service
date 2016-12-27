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
                    expect(result.status).to.be.eql(201);
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

    });
});
