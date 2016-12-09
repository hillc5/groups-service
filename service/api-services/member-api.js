const memberData = require('../data-services/member-data');

function createMember(req, res) {
    const validationSchema = {
        'name': {
            notEmpty: true,
            errorMessage: 'Member name is required'

        },
        'email': {
            isEmail: {
                errorMessage: 'A valid email address is required'
            }
        }
    }

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
        // result.throw only throws error if they are on result
        .then(result => result.throw())
        .then(() => {
            const { id } = req.params,
                  query = { _id: id },
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

            return memberData.findMember(query, fields, refOptions)
        })
        .then(result => {
            res.status(200).send(result)
        })
        .catch(sendError(res));
}

function sendError(res) {
    return (err) => {
         if (err && err.mapped) {
            res.status(400).send(err.mapped());
        } else {
            res.status(err.status).send(err);
        }
    }
}

module.exports = {
    createMember,
    findMemberById
}
