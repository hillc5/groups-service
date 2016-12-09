const groupData = require('../data-services/group-data');

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

function findGroupById(req, res) {
    const validationSchema = {
        'id': {
            isMongoId: {
                errorMessage: 'Id must be a valid MongoDB ObjectId'
            }
        }
    };

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
                      select: 'title text owner postDate replies'
                  },
                  ownerOptions = {
                      path: 'owner',
                      select: 'name email joinDate'
                  },
                  refOptions = [ membersOptions, eventsOptions, postsOptions, ownerOptions ];

            return groupData.findGroup(query, fields, refOptions);
        })
        .then(result => res.status(200).send(result))
        .catch(sendError(res));
}

function sendError(res) {
    return (err) => {
        if (err && err.mapped) {
            res.status(400).send(err.mapped());
        } else {
            res.status(err.status).send(err);
        }
    };
}

module.exports = {
    createGroup,
    findGroupById
};
