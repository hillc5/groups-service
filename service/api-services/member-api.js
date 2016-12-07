const memberData = require('../data-services/member-data');

function createMember(req, res) {
    const { name, email } = req.body,
          newMember = {
              name,
              email,
              memberGroups: [],
              memberPosts: [],
              memberEvents: [],
              joinDate: Date.now()
          };

    memberData.saveMember(newMember).then(result => res.status(201).send(result));
}

function findMemberById(req, res) {
    const { id } = req.params;

    let query = { _id: id },
        // remove __v mongoose property
        fields = '-__v',
        groupOptions = {
            path: 'memberGroups',
            select: 'name description tags creationDate'
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

    memberData.findMember(query, fields, refOptions)
        .then(result => {
            res.status(200).send(result)
        })
        .catch(err => res.status(404).send(err));
}

module.exports = {
    createMember,
    findMemberById
}
