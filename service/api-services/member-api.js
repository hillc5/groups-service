const memberData = require('../data-services/member-data'),
      { sendError, validateRequest } = require('../util/validation'),
      validationType = 'member';

function createMember(req, res) {
    const bodyOptions = [ 'name', 'email' ],
          validationType = 'member';

    validateRequest({ req, validationType, bodyOptions })
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

            return memberData.saveMember(newMember);
        })
        .then(result => {
            res.status(201).send(result);
        })
        .catch(sendError(res));
}

function getAllMemberGroups(req, res) {
    const paramOptions = [ 'memberId' ],
          validationType = 'member';

    validateRequest({ req, paramOptions, validationType })
        .then(() => {
            const { memberId } = req.params,
                  query = { _id: memberId },
                  fields = 'memberGroups -_id',
                  memberGroupOptions = {
                      path: 'memberGroups',
                      select: '-__v',
                      populate: [
                          {
                              path: 'owner',
                              select: 'name email'
                          },
                          {
                              path: 'members',
                              select: 'name email'
                          },
                          {
                              path: 'posts',
                              select: 'title text postDate',
                              options: { sort: { postDate: -1 }, limit: 10 }
                          },
                          {
                              path: 'events',
                              select: 'name invitees attendees startDate endDate',
                              options: { sort: { startDate: -1 }, limit: 10 }
                          }
                      ]
                  },
                  refOptions = [ memberGroupOptions ];

            return memberData.findMember(query, fields, refOptions);
        })
        .then(result => {
            if (result) {
                const { memberGroups=[] } = result;
                res.status(200).send(memberGroups);
            } else {
                throw { status: 404, message: `No groups found for member: ${req.params.memberId}` };
            }

        })
        .catch(sendError(res));
}

function findMemberById(req, res) {
    const paramOptions = [ 'memberId' ],
          validationType = 'member';

    validateRequest({ req, paramOptions, validationType })
        .then(() => {
            const { memberId } = req.params,
                  query = { _id: memberId },
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
                              options: { sort: { postDate: -1 }, limit: 10 }
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
                      select: '-__v'
                  },
                  eventOptions = {
                      path: 'memberEvents',
                      select: '-__v'
                  },
                  refOptions = [ groupOptions, postOptions, eventOptions ];

            return memberData.findMember(query, fields, refOptions)
        })
        .then(result => {
            if (result) {

                res.status(200).send(result);
            } else {
                throw { status: 404, message: `No member found with id ${req.params.memberId}` }
            }
        })
        .catch(sendError(res));
}

module.exports = {
    createMember,
    findMemberById,
    getAllMemberGroups
}
