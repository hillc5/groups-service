const groupData = require('../data-services/group-data'),
      mongoose = require('mongoose'),
      { createValidationSchema, sendError } = require('../util/validation');

function createGroup(req, res) {
    const { id: ownerId } = req.params,
          { name, description, tags, isPublic } = req.body,
          newGroup = {
              name,
              description,
              tags: tags.split(',').map(tag => tag.trim()),
              owner: ownerId,
              isPublic,
              creationDate: Date.now()
          };

    groupData.saveGroup(newGroup)
        .then(result => res.status(201).send(result))
        .catch(sendError(res));
}

function getAllMemberGroups(req, res) {
    const validationSchema = createValidationSchema([ 'id' ]);

    req.sanitize('id').trim();
    req.checkParams(validationSchema);

    req.getValidationResult()
        .then(result => result.throw())
        .then(() => {
            const { id } = req.params,
                  query = { owner: mongoose.mongo.ObjectId(id) },
                  fields = '-__v',
                  membersOptions = {
                      path: 'members'
                  },
                  eventsOptions = {
                      path: 'events'
                  },
                  postsOptions = {
                      path: 'posts'
                  },
                  ownerOptions = {
                      path: 'owner'
                  },
                  refOptions = [ membersOptions, eventsOptions, postsOptions, ownerOptions ];

            return groupData.findGroup(query, fields, refOptions);
        })
        .then(result => {
            if (result) {
                res.status(200).send(result);
            } else {
                throw { status: 404, message: `No groups found for owner: ${req.params.id}` };
            }

        })
        .catch(sendError(res));
}

function findGroupById(req, res) {
    const validationSchema = createValidationSchema([ 'id' ]);

    req.sanitize('id').trim();
    req.checkParams(validationSchema);

    req.getValidationResult()
        .then(result => result.throw())
        .then(() => {
            const { id } = req.params,
                  query = { _id: id },
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

function findGroupsByTags(req, res) {
    const { tags } = req.query,
          query = { tags: { $in : tags }},
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

    groupData.findGroup(query, fields, refOptions)
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
    findGroupById,
    findGroupsByTags,
    getAllMemberGroups
};
