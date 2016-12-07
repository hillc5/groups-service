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
        .catch(err => res.status(400).send(err));
}

module.exports = {
    createGroup
};
