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

        it('should return 400 for incorrect owner id', done => {
            const newGroup = {
                      name: 'Test',
                      owner: 'wrongId',
                      isPublic: true
                  };

            callService()
                .post('/group')
                .send(newGroup)
                .then(res => {
                    // Fail if we hit this spot
                    expect(false).to.be.true;
                    done();
                })
                .catch(err => {
                    const error = JSON.parse(err.response.text);
                    expect(err.status).to.be.eql(400);
                    expect(error.owner).to.not.be.undefined;
                    expect(error.owner.param).to.be.eql('owner');
                    done();
                });
        });

        it('should return 400 if a name is not supplied', done => {
            const newGroup = {
                      name: '',
                      owner: '585d851c1b865511bb0543d2',
                      isPublic: true
                  };

            callService()
                .post('/group')
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
                      owner: '585d851c1b865511bb0543d2'
                  };

            callService()
                .post('/group')
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
                    newGroup.owner = member._id;
                    return callService()
                        .post('/group')
                        .send(newGroup)
                })
                .then(res => {
                    expect(res.status).to.be.eql(201);
                    done();
                });
        });

        it('should add the owner to the members array', done => {
            const newGroup = {
                    name: 'Test',
                    isPublic: true
                };

            saveTestMember()
                .then(member => {
                    newGroup.owner = member._id;
                    return callService()
                            .post('/group')
                            .send(newGroup);
                })
                .then(res => {
                    const { owner, members } = res.body,
                          member = mongoose.mongo.ObjectId(members[0]);

                    expect(member).to.be.eql(newGroup.owner);
                    done();
                })
        })

        it('should return the full group on successful creation', done => {
            const newGroup = {
                      name: 'Test',
                      owner: '585d851c1b865511bb0543d2',
                      isPublic: true
                  };

            saveTestMember()
                .then(member => {
                    newGroup.owner = member._id;
                    return callService()
                        .post('/group')
                        .send(newGroup);
                })
                .then(res => {
                    const { _id, __v, owner, name, isPublic, description, members, events, posts, tags, creationDate } = res.body;
                    expect(res.status).to.be.eql(201);
                    expect(_id).to.not.be.undefined;
                    expect(__v).to.be.eql(0);
                    expect(mongoose.mongo.ObjectId(owner)).to.be.eql(newGroup.owner);
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
                    newGroup.owner = member._id;
                    return callService()
                            .post('/group')
                            .send(newGroup);
                })
                .then(result => {
                    groupId = result.body._id;
                    return Member.findOne({ _id: newGroup.owner }).select('memberGroups').exec();
                })
                .then(member => {
                    const memberGroupId = member.memberGroups[0],
                          foundMemberId = member._id;

                    expect(foundMemberId).to.be.eql(newGroup.owner);
                    expect(memberGroupId).to.be.eql(mongoose.mongo.ObjectId(groupId));
                    done();
                })
        });

        it('should create an empty array for tags when no tags are supplied', done => {
            const newGroup = {
                name: 'Test',
                isPublic: true
            };

            saveTestMember()
                .then(member => {
                    newGroup.owner = member._id;
                    return callService()
                        .post('/group')
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

            saveTestMember()
                .then(member => {
                    newGroup.owner = member._id;
                    return callService()
                        .post('/group')
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
                .get(`/group/member/wrongId`)
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
                            .get(`/group/member/${group.owner}`);
                })
                .then(result => {
                    expect(result.status).to.be.eql(200);
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
                            .get(`/group/member/${groupData.owner}`);
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
                            .post(`/group/${groupId}/member/${memberId}`);
                })
                .then(result => {
                    return callService()
                            .post('/group')
                            .send(groupTwoData);
                })
                .then(result => {
                    let { _id: groupId } = result.body;
                    return callService()
                            .post(`/group/${groupId}/member/${memberId}`);
                })
                .then(result => {
                    return callService()
                            .get(`/group/member/${memberId}`);
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

        it('should return an empty array if a valid member is in no groups', done => {
            saveTestMember()
                .then(member => {
                    return callService()
                            .get(`/group/member/${member._id}`);
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

            saveTestMember()
                .then(member => {
                    groupData.owner = member._id;
                    return callService()
                            .post('/group')
                            .send(groupData);
                })
                .then(response => {
                    return callService()
                            .get(`/group/member/${groupData.owner}`);
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
                    groupData.owner = member._id;
                    return callService()
                            .post('/group')
                            .send(groupData);
                })
                .then(response => {
                    const { _id: groupId } = response.body;
                    return callService()
                            .get(`/group/${groupId}`);
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
                    groupData.owner = member._id
                    return callService()
                            .post('/group')
                            .send(groupData);
                })
                .then(response => {
                    const { _id: groupId } = response.body;
                    return callService()
                            .get(`/group/${groupId}`);
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
                    groupData.owner = member._id;
                    return callService()
                            .post('/group')
                            .send(groupData);
                })
                .then(response => {
                    const { _id: groupId } = response.body;
                    return callService()
                            .get(`/group/${groupId}`);
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

    describe('#findGroupByTags', () => {
        it('should return an empty array if no tags are supplied', done => {
            saveTestGroup()
                .then(group => {
                    return callService()
                            .get('/group/?tags');
                })
                .then(response => {
                    expect(response.status).to.be.eql(200);
                    expect(response.body).to.be.an('array');
                    expect(response.body.length).to.be.eql(0);
                    done();
                });
        });

        it('should return an empty array if no groups have the given tags', done => {
            // testGroup tags = 'test' and 'testing'
            saveTestGroup()
                .then(group => {
                    return callService()
                            .get('/group/?tags=foo&tags=bar');
                })
                .then(response => {
                    expect(response.status).to.be.eql(200);
                    expect(response.body).to.be.an('array');
                    expect(response.body.length).to.be.eql(0);
                    done();
                });
        });

        it('should return an array with a single group if only 1 group matches any of the tags', done => {
            const groupOneData = {
                      name: 'Test',
                      isPublic: true,
                      tags: 'test, testing'
                  },
                  groupTwoData = {
                      name: 'Test Again',
                      isPublic: true,
                      tags: 'notest, testing'
                  };

            saveTestMember()
                .then(member => {
                    groupOneData.owner = member._id;
                    groupTwoData.owner = member._id;
                    return callService()
                            .post('/group')
                            .send(groupOneData);
                })
                .then(() => {
                    return callService()
                            .post('/group')
                            .send(groupTwoData);
                })
                .then(() => {
                    return callService()
                            .get('/group/?tags=test&tags=bar');
                })
                .then(response => {
                    expect(response.status).to.be.eql(200);
                    expect(response.body).to.be.an('array');
                    expect(response.body.length).to.be.eql(1);
                    done();
                });
        });

        it('should return an array with all groups matching a tag', done => {
            const groupOneData = {
                      name: 'Test',
                      isPublic: true,
                      tags: 'test, testing'
                  },
                  groupTwoData = {
                      name: 'Test Again',
                      isPublic: true,
                      tags: 'notest, testing'
                  };

            saveTestMember()
                .then(member => {
                    groupOneData.owner = member._id;
                    groupTwoData.owner = member._id;
                    return callService()
                            .post('/group')
                            .send(groupOneData);
                })
                .then(() => {
                    return callService()
                            .post('/group')
                            .send(groupTwoData);
                })
                .then(() => {
                    return callService()
                            .get('/group/?tags=testing&tags=bar');
                })
                .then(response => {
                    expect(response.status).to.be.eql(200);
                    expect(response.body).to.be.an('array');
                    expect(response.body.length).to.be.eql(2);
                    done();
                });
        });

        it('should return an array with all groups matching any of the tags listed', done => {
            const groupOneData = {
                      name: 'Test',
                      isPublic: true,
                      tags: 'test, testing'
                  },
                  groupTwoData = {
                      name: 'Test Again',
                      isPublic: true,
                      tags: 'notest, testing'
                  },
                  groupThreeData = {
                      name: 'Test Thrice',
                      isPublic: true,
                      tags: 'test, notesting'
                  };

            saveTestMember()
                .then(member => {
                    groupOneData.owner = member._id;
                    groupTwoData.owner = member._id;
                    groupThreeData.owner = member._id;
                    return callService()
                            .post('/group')
                            .send(groupOneData);
                })
                .then(() => {
                    return callService()
                            .post('/group')
                            .send(groupTwoData);
                })
                .then(() => {
                    return callService()
                            .post('/group')
                            .send(groupThreeData);
                })
                .then(() => {
                    return callService()
                            .get('/group/?tags=testing&tags=test');
                })
                .then(response => {
                    expect(response.status).to.be.eql(200);
                    expect(response.body).to.be.an('array');
                    expect(response.body.length).to.be.eql(3);
                    done();
                });
        });

        it('should only return public groups matching any of the tags listed', done => {
            const groupOneData = {
                      name: 'Test',
                      isPublic: true,
                      tags: 'test, testing'
                  },
                  groupTwoData = {
                      name: 'Test Again',
                      isPublic: true,
                      tags: 'notest, testing'
                  },
                  groupThreeData = {
                      name: 'Test Thrice',
                      isPublic: false,
                      tags: 'test, notesting'
                  };

            saveTestMember()
                .then(member => {
                    groupOneData.owner = member._id;
                    groupTwoData.owner = member._id;
                    groupThreeData.owner = member._id;
                    return callService()
                            .post('/group')
                            .send(groupOneData);
                })
                .then(() => {
                    return callService()
                            .post('/group')
                            .send(groupTwoData);
                })
                .then(() => {
                    return callService()
                            .post('/group')
                            .send(groupThreeData);
                })
                .then(() => {
                    return callService()
                            .get('/group/?tags=testing&tags=test');
                })
                .then(response => {
                    expect(response.status).to.be.eql(200);
                    expect(response.body).to.be.an('array');
                    expect(response.body.length).to.be.eql(2);
                    done();
                });
        });

    });
});
