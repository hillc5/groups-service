const mongoose = require('mongoose'),
      { Member } = require('../service/models/Model')

      chai = require('chai'),
      chaiHttp = require('chai-http'),

      service = require('../service/service'),
      should = chai.should()
      expect = chai.expect;

chai.use(chaiHttp);

describe('member-api', () => {

    beforeEach(done => {
        Member.remove({}).then(done());
    });

    describe('#createMember', () => {
        it('should return 200 on successful creation', done => {
            const newMember = {
                name: 'Test',
                email: 'Test@test.com'
            };

            chai.request(service)
                .post('/member')
                .send(newMember)
                .then(res => {
                    res.should.have.status(201);
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
    })
})
