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

    });
});
