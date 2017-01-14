const groupData = require('../data-services/group-data'),
      mongoose = require('mongoose'),
      { validateRequest, sendError } = require('../util/validation'),
      validationType = 'group';

function createGroup(req, res) {
    const bodyOptions = [ 'owner', 'name', 'isPublic' ];

    validateRequest({ req, validationType, bodyOptions })
        .then(() => {
            const { owner, name, description='', tags, isPublic } = req.body,

                  newGroup = {
                     name,
                     description,
                     members: [ owner ],
                     tags: tags && tags.split(',').map(tag => tag.trim()) || [],
                     owner,
                     isPublic,
                     creationDate: Date.now()
                  };

            return groupData.saveGroup(newGroup)
        })
        .then(result => res.status(201).send(result))
        .catch(sendError(res));
}

function addMemberToGroup(req, res) {
    const paramOptions = [ 'groupId' ],
          bodyOptions = [ 'memberId' ];

    validateRequest({ req, validationType, paramOptions, bodyOptions })
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
        .catch(sendError(res));
}

function findGroupById(req, res) {
    const paramOptions = [ 'groupId' ];

    validateRequest({ req, validationType, paramOptions })
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
                          path: 'creator',
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
                throw { status: 404, message: `No group found with ${req.params.id}` };
            }

        })
        .catch(sendError(res));
}

function getAllGroupEvents (req, res) {
    const paramOptions = [ 'groupId' ];

    validateRequest({ req, paramOptions, validationType })
        .then(() => {
            const { groupId } = req.params,
                  query = { _id: groupId },
                  fields = 'events',
                  groupEventsOptions = {
                      path: 'events',
                      select: '-__v',
                      populate: [
                          {
                              path: 'creator',
                              select: 'name email joinDate'
                          },
                          {
                              path:  'invitees',
                              select: 'name email joinDate'
                          },
                          {
                              path: 'attendees',
                              select: 'name email joinDate'
                          },
                          {
                              path: 'posts',
                              select: 'title text owner postDate replies'
                          }
                      ]
                  },
                  refOptions = [ groupEventsOptions ];

            return groupData.findGroup(query, fields, refOptions);
        })
        .then(result => {
            if (result) {
                const { events=[] } = result;
                res.status(200).send(events);
            } else {
                throw { status: 404, message: `No groups found for group id: ${req.params.groupId}` };
            }

        })
        .catch(sendError(res));
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
        .catch(sendError(res));
}

module.exports = {
    createGroup,
    addMemberToGroup,
    findGroupById,
    getAllGroupEvents,
    findGroupsByTags
};
