const memberData = require('../data-services/member-data'),
      groupData = require('../data-services/group-data'),
      eventData = require('../data-services/event-data'),
      postData = require('../data-services/post-data'),
      validateRequest = require('./util/api-validation'),
      handleError = require('./util/api-error-handler');

function createMember(req, res) {
    const bodyOptions = [ 'name', 'email' ];

    validateRequest({ req, bodyOptions })
        .then(() => {
            const { name, email } = req.body,
            newMember = {
                name,
                email,
                joinDate: Date.now()
            };

            return memberData.saveMember(newMember);
        })
        .then(result => {
            res.status(201).send(result);
        })
        .catch(handleError(res));
}

function getAllMemberGroups(req, res) {
    const paramOptions = [ 'memberId' ];

    validateRequest({ req, paramOptions})
        .then(() => {
            const { memberId } = req.params,
                  query = { members: memberId },
                  fields = '-__v',
                  ownerOptions = {
                      path: 'owner',
                      select: 'name'
                  }
                  membersOptions = {
                      path: 'members',
                      select: 'name'
                  },
                  eventsOptions = {
                      path: 'events',
                      select: 'name invitees attendees startDate endDate',
                      options: { sort: { startDate: -1 }, limit: 10 }
                  },
                  postsOptions = {
                      path: 'posts',
                      select: 'title text postDate',
                      options: { sort: { postDate: -1 }, limit: 10 }
                  },
                  refOptions = [ ownerOptions, membersOptions, eventsOptions, postsOptions ];

            return groupData.findGroups(query, fields, refOptions);
        })
        .then((result=[]) => {
            if (result) {
                res.status(200).send(result);
            }

        })
        .catch(handleError(res));
}

function getAllMemberEvents(req, res) {
    const paramOptions = [ 'memberId' ];

    validateRequest({ req, paramOptions })
        .then(() => {
            const { memberId } = req.params,
                  query = {
                      $or:
                          [
                              { creator: memberId },
                              { invitees: memberId },
                              { attendees: memberId }
                          ]
                  },
                  fields = '-__v',
                  groupOptions = {
                     path: 'group',
                     select: 'name _id tags'
                  },
                  ownerOptions = {
                     path: 'owner',
                     select: 'name email joinDate'
                  },
                  inviteesOptions = {
                     path: 'invitees',
                     select: 'name email joinDate'
                  },
                  attendeesOptions = {
                     path: 'attendees',
                     select: 'name email joinDate'
                  },
                  postOptions = {
                     path: 'posts',
                     select: 'title text owner replies postDate',
                     populate: {
                        path: 'replies',
                        select: 'title text owner replies postDate'
                     }
                  },
                  refOptions = [ groupOptions, ownerOptions, inviteesOptions, attendeesOptions, postOptions ];

            return eventData.findEvents(query, fields, refOptions);
        })
        .then((result=[]) => {
            if (result) {
                res.status(200).send(result);
            }

        })
        .catch(handleError(res));
}

function getAllMemberPosts(req, res) {
    const paramOptions = [ 'memberId' ];

    validateRequest({ req, paramOptions })
        .then(() => {
            const { memberId } = req.params,
                  query = { owner: memberId },
                  fields = '-__v',
                  ownerOptions = {
                      path: 'owner',
                      select: 'name email fields'
                  },
                  groupOptions = {
                      path: 'group',
                      select: 'name'
                  },
                  eventOptions = {
                      path: 'event',
                      select: 'name'
                  },
                  refOptions = [ ownerOptions, groupOptions, eventOptions ];

            return postData.findPosts(query, fields, refOptions);

        })
        .then((result=[]) => {
            res.status(200).send(result);
        })
        .catch(handleError(res));
}

function findMemberById(req, res) {
    const paramOptions = [ 'memberId' ];

    validateRequest({ req, paramOptions })
        .then(() => {
            const { memberId } = req.params,
                  query = { _id: memberId },
                  // remove __v mongoose property
                  fields = '-__v';

            return memberData.findMember(query, fields)
        })
        .then(result => {
            if (result) {
                res.status(200).send(result);
            } else {
                throw { status: 404, message: `No member found with id ${req.params.memberId}` }
            }
        })
        .catch(handleError(res));
}

module.exports = {
    createMember,
    findMemberById,
    getAllMemberGroups,
    getAllMemberEvents,
    getAllMemberPosts
}
