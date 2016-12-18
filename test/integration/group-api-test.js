const mongoose = require('mongoose'),
      { Member, Group } = require('../../service/models/Model'),

      chai = require('chai'),
      chaiHttp = require('chai-http'),

      service = require('../../service/service'),
      expect = chai.expect;

chai.use(chaiHttp);

describe('group-api', () => {
    afterEach(done => {
        Member.remove({})
            .then(() => Group.remove({}))
            .then(done());
    });

    describe('#createGroup', () => {

        it('should return 400 for incorrect ids', done => {
            const newGroup = {
                      name: 'Test',
                      isPublic: true
                  };

            chai.request(service)
                .post('/member/wrongId/group')
                .send(newGroup)
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

        it('should return 400 if a name is not supplied', done => {
            const newGroup = {
                      name: '',
                      isPublic: true
                  };

            chai.request(service)
                .post('/member/wrongId/group')
                .send(newGroup)
                .then(res => {
                    // Fail if we hit this spot
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

        it('should return 400 if a isPublic is not supplied', done => {
            const newGroup = {
                      name: 'Test',
                  };

            chai.request(service)
                .post('/member/wrongId/group')
                .send(newGroup)
                .then(res => {
                    // Fail if we hit this spot
                    expect(false).to.be.true;
                    done();
                })
                .catch(err => {
                    const error = JSON.parse(err.response.text);
                    expect(err.status).to.be.eql(400);
                    expect(error.isPublic).to.not.be.undefined;
                    expect(error.isPublic.param).to.be.eql('isPublic');
                    done();
                });
        });

        it('should return 201 on success', done => {
            const newGroup = {
                      name: 'Test',
                      isPublic: true
                  },
                  memberData = {
                      name: 'Test',
                      email: 'Test@test.com',
                      memberGroups: [],
                      memberPosts: [],
                      memberEvents: [],
                      tags: 'test, testing, fun',
                      joinDate: Date.now()
                  },
                  member = new Member(memberData);

            member.save()
                .then(result => {
                    return chai.request(service)
                        .post(`/member/${result._id}/group`)
                        .send(newGroup)
                })
                .then(res => {
                    expect(res.status).to.be.eql(201);
                    done();
                });
        });

        it('should set the owner to be the id parameter', done => {
            const newGroup = {
                      name: 'Test',
                      isPublic: true
                  },
                  memberData = {
                      name: 'Test',
                      email: 'Test@test.com',
                      memberGroups: [],
                      memberPosts: [],
                      memberEvents: [],
                      tags: 'test, testing, fun',
                      joinDate: Date.now()
                  },
                  member = new Member(memberData);

            let ownerId;

            member.save()
                .then(result => {
                    ownerId = result._id;
                    return chai.request(service)
                        .post(`/member/${result._id}/group`)
                        .send(newGroup)
                })
                .then(res => {
                    const { owner } = res.body;
                    expect(res.status).to.be.eql(201);
                    expect(mongoose.mongo.ObjectId(owner)).to.be.eql(ownerId);
                    done();
                });
        });

        it('should return the full group on successful creation', done => {
            const newGroup = {
                      name: 'Test',
                      isPublic: true
                  },
                  memberData = {
                      name: 'Test',
                      email: 'Test@test.com',
                      memberGroups: [],
                      memberPosts: [],
                      memberEvents: [],
                      joinDate: Date.now()
                  },
                  member = new Member(memberData);

            let ownerId;

            member.save()
                .then(result => {
                    ownerId = result._id;
                    return chai.request(service)
                        .post(`/member/${result._id}/group`)
                        .send(newGroup)
                })
                .then(res => {
                    const { _id, __v, owner, name, isPublic, description, members, events, posts, tags, creationDate } = res.body;
                    expect(res.status).to.be.eql(201);
                    expect(_id).to.not.be.undefined;
                    expect(__v).to.be.eql(0);
                    expect(mongoose.mongo.ObjectId(owner)).to.be.eql(ownerId);
                    expect(isPublic).to.be.eql(newGroup.isPublic);
                    expect(description).to.be.a('string');
                    expect(members).to.be.an('array');
                    expect(members.length).to.be.eql(0);
                    expect(posts).to.be.an('array');
                    expect(posts.length).to.be.eql(0);
                    expect(events).to.be.an('array');
                    expect(events.length).to.be.eql(0);
                    expect(tags).to.be.an('array');
                    expect(tags.length).to.be.eql(0);
                    expect(creationDate).to.be.a('string');
                    done();
                });
        });

        it('should create an empty array for tags when no tags are supplied', done => {
            const newGroup = {
                name: 'Test',
                isPublic: true
            },
            memberData = {
                name: 'Test',
                email: 'Test@test.com',
                memberGroups: [],
                memberPosts: [],
                memberEvents: [],
                joinDate: Date.now()
            },
            member = new Member(memberData);

            let ownerId;

            member.save()
                .then(result => {
                    ownerId = result._id;
                    return chai.request(service)
                        .post(`/member/${result._id}/group`)
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
            },
            memberData = {
                name: 'Test',
                email: 'Test@test.com',
                memberGroups: [],
                memberPosts: [],
                memberEvents: [],
                joinDate: Date.now()
            },
            member = new Member(memberData);

            let ownerId;

            member.save()
                .then(result => {
                    ownerId = result._id;
                    return chai.request(service)
                        .post(`/member/${result._id}/group`)
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
});
