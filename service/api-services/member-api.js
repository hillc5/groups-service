const memberData = require('../data-services/member-data'),
      { createValidationSchema, sendError } = require('../util/validation'),
      validationType = 'member';

function createMember(req, res) {
    const validationSchema = createValidationSchema(validationType, [ 'name', 'email' ]);

    req.sanitize('name').trim();
    req.sanitize('email').trim();

    req.checkBody(validationSchema);

    req.getValidationResult()
        .then(result => result.throw())
        .then(() => {
            const { name, email } = req.body,
            newMember = {
                name,
                email,
                memberGroups: [],
                memberPosts: [],
                memberEvents: [],
                joinDate: Date.now()
            };

            return memberData.saveMember(newMember)
        })
        .then(result => {
            res.status(201).send(result)
        })
        .catch(sendError(res));
}

function findMemberById(req, res) {
    const validationSchema = createValidationSchema(validationType, [ 'id' ]);

    req.sanitize('id').trim();
    req.checkParams(validationSchema);

    req.getValidationResult()
        // result.throw only throws error if they are on result
        .then(result => result.throw())
        .then(() => {
            const { id } = req.params,
                  query = { _id: id },
                  // remove __v mongoose property
                  fields = '-__v',
                  groupOptions = {
                      path: 'memberGroups',
                      select: '-__v',
                      populate: [
                          {
                              path: 'owner',
                              select: 'name'
                          },
                          {
                              path: 'members',
                              select: 'name'
                          },
                          {
                              path: 'posts',
                              select: 'title text postDate',
                              options: { sort: { postDate: -1}, limit: 10 }
                          },
                          {
                              path: 'events',
                              select: 'name invitees attendees startDate endDate',
                              options: { sort: { startDate: -1 }, limit: 10 }
                          }
                      ]
                  },
                  postOptions = {
                      path: 'memberPosts',
                      select: 'title text date'
                  },
                  eventOptions = {
                      path: 'memberEvents',
                      select: 'name startDate endDate'
                  },
                  refOptions = [ groupOptions, postOptions, eventOptions ];

            return memberData.findMember(query, fields, refOptions)
        })
        .then(result => {
            if (result) {
                res.status(200).send(result);
            } else {
                throw { status: 404, message: `No member found with id ${req.params.id}` }
            }
        })
        .catch(sendError(res));
}

module.exports = {
    createMember,
    findMemberById
}
