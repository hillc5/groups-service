const mongoose = require('mongoose'),
      { Member } = require('../../service/models/Model'),
      { saveTestMember, testMemberData } = require('../util/test-helpers'),

      chai = require('chai'),
      chaiHttp = require('chai-http'),

      service = require('../../service/service'),
      expect = chai.expect;

chai.use(chaiHttp);

function callService() {
    return chai.request(service);
}

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

            chai.request(service)
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

            chai.request(service)
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

            chai.request(service)
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

            chai.request(service)
                .post('/member')
                .send(newMember)
                .then(res => {
                    const { _id, __v, name, email, memberGroups, memberPosts, memberEvents, joinDate } = res.body;
                    expect(res.status).to.be.eql(201);
                    expect(_id).to.not.be.undefined;
                    // initial create version === 0
                    expect(__v).to.be.eql(0);
                    expect(name).to.be.eql(newMember.name);
                    expect(email).to.be.eql(newMember.email);
                    expect(memberGroups).to.be.an('array');
                    expect(memberEvents).to.be.an('array');
                    expect(memberPosts).to.be.an('array');
                    expect(joinDate).to.be.a('string');
                    expect(new Date(joinDate)).to.be.an.instanceOf(Date);
                    // make sure test fails if Member schema is updated
                    expect(Object.keys(res.body).length).to.be.eql(8);
                    done();
            });
        });
    });

    describe('#findMemberById', () => {
        it('should return 400 if invalid id sent', done => {
            chai.request(service)
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
            chai.request(service)
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
                    chai.request(service)
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
                    return chai.request(service).get(`/member/${memberId}`)
                })
                .then(res => {
                    const { _id, name, email, memberGroups, memberPosts, memberEvents, joinDate } = res.body
                    expect(res.status).to.be.eql(200);
                    expect(mongoose.mongo.ObjectId(_id)).to.be.eql(memberId);
                    expect(name).to.be.eql(testMemberData.name);
                    expect(email).to.be.eql(testMemberData.email);
                    expect(memberGroups).to.be.an('array');
                    expect(memberGroups.length).to.be.eql(0);
                    expect(memberPosts).to.be.an('array');
                    expect(memberPosts.length).to.be.eql(0);
                    expect(memberEvents).to.be.an('array');
                    expect(memberEvents.length).to.be.eql(0);
                    expect(new Date(joinDate)).to.be.eql(new Date(testMemberData.joinDate));
                    done();
                });

        });
    });

    describe('#getAllMemberGroups', () => {
        it('should return 400 if incorrect memberId is given', done => {
            callService()
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
            saveTestMember()
                .then(member => {
                    return callService()
                            .get(`/member/${member._id}/groups`);
                })
                .then(result => {
                    expect(result.status).to.be.eql(200);
                    done();
                });
        });

        it('should return an empty array if the member has no groups', done => {
            saveTestMember()
                .then(member => {
                    return callService()
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
                    return callService()
                            .post('/group')
                            .send(groupData);
                })
                .then(result => {
                    return callService()
                            .post('/group')
                            .send(groupData);
                })
                .then(result => {
                    return callService()
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
                    return callService()
                            .post('/member')
                            .send(ownerData);
                })
                .then(result => {
                    groupOneData.owner = result.body._id;
                    groupTwoData.owner = result.body._id;
                    return callService()
                            .post('/group')
                            .send(groupOneData);
                })
                .then(result => {
                    let { _id: groupId } = result.body;
                    return callService()
                            .post(`/group/${groupId}/member`)
                            .send({ memberId });
                })
                .then(result => {
                    return callService()
                            .post('/group')
                            .send(groupTwoData);
                })
                .then(result => {
                    let { _id: groupId } = result.body;
                    return callService()
                            .post(`/group/${groupId}/member`)
                            .send({ memberId });
                })
                .then(result => {
                    return callService()
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
});
