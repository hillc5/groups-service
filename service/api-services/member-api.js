const memberData = require('../data-services/member-data');

function createMember(req, res) {
    const { name, email } = req.body,
          newMember = {
              name,
              email,
              memberGroups: [],
              memberPosts: [],
              memberEvents: [],
              creationDate: new Date()
          };

    memberData.saveMember(newMember).then(result => res.status(201).send(result));
}

function findMemberById(req, res) {
    const { id } = req.params;

    let query = { _id: id },
        fields = '-__v',
        groupOptions = {
            path: 'Group',
            select: 'name, description, tags, creationDate'
        },
        postOptions = {
            path: 'Post',
            select: 'title, text, date'
        },
        eventOptions = {
            path: 'Event',
            select: 'name, startDate, endDate'
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
