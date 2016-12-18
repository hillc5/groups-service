const mongoose = require('mongoose'),
      { Member } = require('../../service/models/Model')

      chai = require('chai'),
      chaiHttp = require('chai-http'),

      service = require('../../service/service'),
      expect = chai.expect;

chai.use(chaiHttp);

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
                    expect(error.id).to.not.be.undefined;
                    expect(error.id.param).to.be.eql('id');
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
            const memberData = {
                      name: 'Test',
                      email: 'Test@test.com',
                      memberGroups: [],
                      memberPosts: [],
                      memberEvents: [],
                      joinDate: Date.now()
                  },
                  member = new Member(memberData);

            member.save()
                .then(result => {
                    chai.request(service)
                        .get(`/member/${result._id}`)
                        .then(res => {
                            expect(res.status).to.be.eql(200);
                            done();
                        });
                });

        });

        it('should return the correct data when member is found', done => {
            const memberData = {
                      name: 'Test',
                      email: 'Test@test.com',
                      memberGroups: [],
                      memberPosts: [],
                      memberEvents: [],
                      joinDate: Date.now()
                  },
                  member = new Member(memberData);

            let memberId;

            member.save()
                .then(result => {
                    memberId = result._id;
                    return chai.request(service).get(`/member/${memberId}`)
                })
                .then(res => {
                    const { _id, name, email, memberGroups, memberPosts, memberEvents, joinDate } = res.body
                    expect(res.status).to.be.eql(200);
                    expect(mongoose.mongo.ObjectId(_id)).to.be.eql(memberId);
                    expect(name).to.be.eql(memberData.name);
                    expect(email).to.be.eql(memberData.email);
                    expect(memberGroups).to.be.an('array');
                    expect(memberGroups.length).to.be.eql(0);
                    expect(memberPosts).to.be.an('array');
                    expect(memberPosts.length).to.be.eql(0);
                    expect(memberEvents).to.be.an('array');
                    expect(memberEvents.length).to.be.eql(0);
                    expect(new Date(joinDate)).to.be.eql(new Date(memberData.joinDate));
                    done();
                });

        });
    });
});
