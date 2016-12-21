const mongoose = require('mongoose'),
      { Member, Group } = require('../../service/models/Model'),
      { saveTestMember, saveTestGroup, testGroupData, testMemberData } = require('../util/test-helpers'),

      chai = require('chai'),
      chaiHttp = require('chai-http'),

      service = require('../../service/service'),
      expect = chai.expect;

chai.use(chaiHttp);

function callService() {
    return chai.request(service);
}

describe('group-api', () => {
    afterEach(done => {
        Member
            .remove({})
            .then(() => Group.remove({}))
            .then(done());
    });

    describe('#createGroup', () => {

        it('should return 400 for incorrect ids', done => {
            const newGroup = {
                      name: 'Test',
                      isPublic: true
                  };

            callService()
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

            callService()
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

            callService()
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
                  };

            saveTestMember()
                .then(member => {
                    return callService()
                        .post(`/member/${member._id}/group`)
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
                  };

            let ownerId;

            saveTestMember()
                .then(member => {
                    ownerId = member._id;
                    return callService()
                        .post(`/member/${ownerId}/group`)
                        .send(newGroup)
                })
                .then(res => {
                    const { owner } = res.body;
                    expect(res.status).to.be.eql(201);
                    expect(mongoose.mongo.ObjectId(owner)).to.be.eql(ownerId);
                    done();
                });
        });

        it('should add the owner to the members array', done => {
            const newGroup = {
                    name: 'Test',
                    isPublic: true
                };

            let ownerId;

            saveTestMember()
                .then(member => {
                    ownerId = member._id;
                    return callService()
                            .post(`/member/${ownerId}/group`)
                            .send(newGroup);
                })
                .then(res => {
                    const { owner, members } = res.body;
                    expect(members[0]).to.be.eql(owner);
                    done();
                })
        })

        it('should return the full group on successful creation', done => {
            const newGroup = {
                      name: 'Test',
                      isPublic: true
                  };

            let ownerId;

            saveTestMember()
                .then(member => {
                    ownerId = member._id;
                    return callService()
                        .post(`/member/${ownerId}/group`)
                        .send(newGroup);
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
                    expect(members.length).to.be.eql(1);
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

        it('should add the group id to the owner memberGroups array', done => {
            const newGroup = {
                name: 'Test',
                isPublic: true
            };

            let groupId,
                ownerId;

            saveTestMember()
                .then(member => {
                    ownerId = member._id;
                    return callService()
                            .post(`/member/${ownerId}/group`)
                            .send(newGroup);
                })
                .then(result => {
                    groupId = result.body._id;
                    return Member.findOne({ _id: ownerId }).select('memberGroups').exec();
                })
                .then(member => {
                    const memberGroupId = member.memberGroups[0],
                          foundMemberId = member._id;

                    expect(foundMemberId).to.be.eql(ownerId);
                    expect(memberGroupId).to.be.eql(mongoose.mongo.ObjectId(groupId));
                    done();
                })
        });

        it('should create an empty array for tags when no tags are supplied', done => {
            const newGroup = {
                name: 'Test',
                isPublic: true
            };

            let ownerId;

            saveTestMember()
                .then(member => {
                    ownerId = member._id;
                    return callService()
                        .post(`/member/${ownerId}/group`)
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

            let ownerId;

            saveTestMember()
                .then(member => {
                    ownerId = member._id;
                    return callService()
                        .post(`/member/${ownerId}/group`)
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
        it('should return 400 for incorrect groupId', done => {
            callService()
                .post(`/group/wrongId/member/5848ed108b3ccb3ffcc691d`)
                .then(result => {
                    // Fail if we hit this spot
                    expect(false).to.be.true;
                    done();
                })
                .catch(err => {
                    expect(err.status).to.be.eql(400);
                    done();
                });
        });

        it('should return 400 for incorrect memberId', done => {
            callService()
                .post(`/group/5848ed108b3ccb3ffcc691d/member/wrongId`)
                .then(result => {
                    // Fail if we hit this spot
                    expect(false).to.be.true;
                    done();
                })
                .catch(err => {
                    expect(err.status).to.be.eql(400);
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
                    return callService()
                            .post(`/group/${group._id}/member/${memberId}`);
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
                    return callService()
                            .post(`/group/${group._id}/member/${memberId}`);
                })
                .then(result => {
                    const { members } = result.body;
                    expect(members.length).to.be.eql(1);
                    expect(mongoose.mongo.ObjectId(members[0])).to.be.eql(memberId);
                    done();
                });
        });

        it('should add the groupId to the members memberGroups array', done => {
            let groupId,
                memberId;

            saveTestMember()
                .then(member => {
                    memberId = member._id;
                    return saveTestGroup();
                })
                .then(group => {
                    groupId = group._id;
                    return callService()
                        .post(`/group/${groupId}/member/${memberId}`);
                })
                .then(() => {
                    return Member.findOne({ _id: memberId }).exec();
                })
                .then(member => {
                    expect(member.memberGroups[0]).to.be.eql(groupId);
                    done();
                });
        });
    });

    describe('#getAllMemberGroups', () => {
        it('should return 400 when the member id is invalid', done => {
            callService()
                .post(`/member/wrongId/group`)
                .then(result => {
                     // Fail if we hit this spot
                    expect(false).to.be.true;
                    done();
                })
                .catch(err => {
                    expect(err.status).to.be.eql(400);
                    done();
                });
        });

        it('should return 200 on success', done => {
            saveTestGroup()
                .then(group => {
                    return callService()
                            .get(`/member/${group.owner}/group`);
                })
                .then(result => {
                    expect(result.status).to.be.eql(200);
                    done();
                });
        });

        it('should return all member groups', done => {
            let memberId,
                groupData = {
                    name: 'Test Group',
                    isPublic: true
                };

            saveTestMember()
                .then(member => {
                    memberId = member._id;
                    return callService()
                            .post(`/member/${memberId}/group`)
                            .send(groupData);
                })
                .then(result => {
                    return callService()
                            .post(`/member/${memberId}/group`)
                            .send(groupData);
                })
                .then(result => {
                    return callService()
                            .get(`/member/${memberId}/group`);
                })
                .then(result => {
                    const groups = result.body;
                    expect(groups.length).to.be.eql(2);
                    expect(groups[0]._id).to.not.be.eql(groups[1]._id);
                    done();
                });
        });

        it('should only return groups for the given ownerId', done => {
            let memberId,
                groupData = {
                    name: 'Test Group',
                    isPublic: true
                };

            saveTestMember()
                .then(member => {
                    memberId = member._id;
                    return callService()
                            .post(`/member/${memberId}/group`)
                            .send(groupData);
                })
                .then(result => {
                    return callService()
                            .post(`/member/${memberId}/group`)
                            .send(groupData);
                })
                .then(result => {
                    return callService()
                            .post(`/member/${memberId}/group`)
                            .send(groupData);
                })
                .then(result => {
                    return callService()
                            .get(`/member/${memberId}/group`);
                })
                .then(result => {
                    const groups = result.body;
                    expect(groups.length).to.be.eql(3);
                    groups.forEach(group => {
                        expect(mongoose.mongo.ObjectId(group.owner._id)).to.be.eql(memberId);
                    });
                    done();
                });
        });

        it('should return the number of groups the owner has in their groups array', done => {
            let memberId,
                numGroups,
                groupData = {
                    name: 'Test Group',
                    isPublic: true
                };

            saveTestMember()
                .then(member => {
                    memberId = member._id;
                    return callService()
                            .post(`/member/${memberId}/group`)
                            .send(groupData);
                })
                .then(result => {
                    return callService()
                            .post(`/member/${memberId}/group`)
                            .send(groupData);
                })
                .then(result => {
                    return callService()
                            .post(`/member/${memberId}/group`)
                            .send(groupData);
                })
                .then(result => {
                    return callService()
                            .get(`/member/${memberId}/group`);
                })
                .then(result => {
                    const groups = result.body;
                    numGroups = groups.length;
                    expect(numGroups).to.be.eql(3);
                    groups.forEach(group => {
                        expect(mongoose.mongo.ObjectId(group.owner._id)).to.be.eql(memberId);
                    });
                    return callService()
                            .get(`/member/${memberId}`);
                })
                .then(result => {
                    const { memberGroups } = result.body;
                    expect(memberGroups.length).to.be.eql(numGroups);
                    done();
                });
        });

        it('should return an empty array if a valid member has no groups', done => {
            saveTestMember()
                .then(member => {
                    return callService()
                            .get(`/member/${member._id}/group`);
                })
                .then(result => {
                    expect(result.body).to.be.an('array');
                    expect(result.body.length).to.be.eql(0);
                    done();
                });
        });

        it('should return the name, email, and joinDate of each member', done => {
            const groupData = {
                      name: 'Test',
                      isPublic: true
                  };

            let memberId;

            saveTestMember()
                .then(member => {
                    memberId = member._id;
                    return callService()
                            .post(`/member/${memberId}/group`)
                            .send(groupData);
                })
                .then(response => {
                    return callService()
                            .get(`/member/${memberId}/group`);
                })
                .then(response => {
                    const { owner } = response.body[0];
                    expect(owner.name).to.be.eql(testMemberData.name);
                    expect(owner.email).to.be.eql(testMemberData.email);
                    expect(owner.joinDate).to.not.be.undefined;
                    done();
                });
        });
    });

    describe('#findGroupById', () => {
        it('should return 400 if an invalid id is given', done => {
            callService()
                .get('/group/wrongId')
                .then(response => {
                    // Should fail if we hit here
                    expect(false).to.be.true;
                    done();
                })
                .catch(err => {
                    expect(err.status).to.be.eql(400);
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
                    return callService()
                            .post(`/member/${member._id}/group`)
                            .send(groupData);
                })
                .then(response => {
                    const { _id } = response.body;
                    return callService()
                            .get(`/group/${_id}`);
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
                    return callService()
                            .post(`/member/${member._id}/group`)
                            .send(groupData);
                })
                .then(response => {
                    const { _id } = response.body;
                    return callService()
                            .get(`/group/${_id}`);
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
                    return callService()
                            .post(`/member/${member._id}/group`)
                            .send(groupData);
                })
                .then(response => {
                    const { _id } = response.body;
                    return callService()
                            .get(`/group/${_id}`);
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
});
