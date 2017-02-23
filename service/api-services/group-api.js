const groupData = require('../data-services/group-data'),
      eventData = require('../data-services/event-data'),
      postData = require('../data-services/post-data'),
      mongoose = require('mongoose'),
      validateRequest = require('./util/api-validation'),
      handleError = require('./util/api-error-handler');

function createGroup(req, res) {
    const bodyOptions = [ 'memberId', 'name', 'isPublic' ];

    validateRequest({ req, bodyOptions })
        .then(() => {
            const { memberId, name, description='', tags='', isPublic } = req.body,

                  newGroup = {
                      name,
                      description,
                      owner: memberId,
                      isPublic,
                      members: [ memberId ],
                      tags: tags.split(',').filter(item => item).map(tag => tag.trim()),
                      creationDate: Date.now()
                  };

            return groupData.saveGroup(newGroup)
        })
        .then(result => res.status(201).send(result))
        .catch(handleError(res));
}

function addMemberToGroup(req, res) {
    const paramOptions = [ 'groupId' ],
          bodyOptions = [ 'memberId' ];

    validateRequest({ req, paramOptions, bodyOptions })
        .then(() => {
            const { groupId } = req.params,
                  { memberId } = req.body;

            return groupData.addMemberToGroup(groupId, memberId);
        })
        .then(result => {
            if (result) {
                res.status(200).send(result);
            } else {
                throw { status: 500, message: 'There was an error' }
            }
        })
        .catch(handleError(res));
}

function findGroupById(req, res) {
    const paramOptions = [ 'groupId' ];

    validateRequest({ req, paramOptions })
        .then(() => {
            const { groupId } = req.params,
                  query = { _id: groupId },
                  // remove __v mongoose property
                  fields = '-__v',
                  membersOptions = {
                      path: 'members',
                      select: 'name'
                  },
                  eventsOptions = {
                      path: 'events',
                      select: 'name invitees attendees startDate endDate',
                      populate: {
                          path: 'owner',
                          select: 'name'
                      }
                  },
                  postsOptions = {
                      path: 'posts',
                      select: 'title text owner postDate replies',
                      populate: {
                          path: 'owner',
                          select: 'name'
                      }
                  },
                  ownerOptions = {
                      path: 'owner',
                      select: 'name email joinDate'
                  },
                  refOptions = [ membersOptions, eventsOptions, postsOptions, ownerOptions ];

            return groupData.findGroup(query, fields, refOptions);
        })
        .then(result => {
            if (result) {
                res.status(200).send(result);
            } else {
                throw { status: 404, message: `No group found for ${req.params.groupId}` };
            }

        })
        .catch(handleError(res));
}

function getAllGroupEvents(req, res) {
    const paramOptions = [ 'groupId' ];

    validateRequest({ req, paramOptions })
        .then(() => {
            const { groupId } = req.params,
                  query = { group: groupId },
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
            res.status(200).send(result);
        })
        .catch(handleError(res));
}

function getAllGroupPosts(req, res) {
    const paramOptions = [ 'groupId' ];

    validateRequest({ req, paramOptions })
        .then(() => {
            const { groupId } = req.params,
                  query = { group: groupId },
                  fields = '-__v',
                  ownerOptions = {
                      path: 'owner',
                      select: 'name email'
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

function findGroupsByTags(req, res) {
    const { tags=[] } = req.query,
          query = { tags: { $in : Array.isArray(tags) ? tags : [ tags ] }, isPublic: true },
          // remove __v mongoose property
          fields = '-__v',
          membersOptions = {
              path: 'members',
              select: 'name'
          },
          eventsOptions = {
              path: 'events',
              select: 'name invitees attendees startDate endDate'
          },
          postsOptions = {
              path: 'posts',
              select: 'title text owner postDate replies'
          },
          ownerOptions = {
              path: 'owner',
              select: 'name email joinDate'
          },
          refOptions = [ membersOptions, eventsOptions, postsOptions, ownerOptions ];

    groupData.findGroups(query, fields, refOptions)
        .then(result => {
            if (result) {
                res.status(200).send(result);
            } else {
                throw { status: 404, message: `No group found with ${req.query.tags}` };
            }
        })
        .catch(handleError(res));
}

module.exports = {
    createGroup,
    addMemberToGroup,
    findGroupById,
    getAllGroupEvents,
    getAllGroupPosts,
    findGroupsByTags
};
