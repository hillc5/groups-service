const eventData = require('../data-services/event-data'),
      { sendError, validateRequest } = require('../util/validation'),
      validationType = 'event';

function createEvent(req, res) {
    const paramOptions = [ 'groupId', 'memberId' ],
          bodyOptions = [ 'name', 'startDate', 'endDate' ],
          validationType = 'event';

    validateRequest({ req, validationType, paramOptions, bodyOptions })
        .then(() => {
            const { groupId, memberId } = req.params,
                  { name, startDate, endDate, invitees=[] } = req.body,
                  newEvent = {
                      name,
                      group: groupId,
                      creator: memberId,
                      startDate: new Date(startDate),
                      endDate: new Date(endDate),
                      invitees: invitees.map(invitee => invitee.trim())
                  };

            return eventData.saveEvent(newEvent);
        })
        .then(result => {
            res.status(201).send(result);
        })
        .catch(sendError(res));
}

function getEventById(req, res) {
    const paramOptions = [ 'id' ],
          validationType = 'event';

    validateRequest({ req, paramOptions, validationType })
        .then(() => {
            const { id } = req.params,
                  query = { _id: id },
                  // remove __v mongoose property
                  fields = '-__v',
                  groupOptions = {
                     path: 'group',
                     select: 'name _id'
                  },
                  creatorOptions = {
                     path: 'creator',
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
                  refOptions = [ groupOptions, creatorOptions, inviteesOptions, attendeesOptions, postOptions ];

            return eventData.findEvent(query, fields, refOptions);
        })
        .then(result => {
            if (result) {
                res.status(200).send(result);
            } else {
                throw { status: 404, message: `No event found for id: ${req.params.id}` };
            }
        })
        .catch(sendError(res));
}

function getAllMemberCreatedEvents(req, res) {
    const paramOptions = [ 'memberId' ],
          validationType = 'event';

    validateRequest({ req, validationType, paramOptions })
        .then(() => {
            const { memberId } = req.params,
                  query = { creator: memberId },
                  // remove __v mongoose property
                  fields = '-__v',
                  groupOptions = {
                      path: 'group',
                      select: 'name'
                  },
                  creatorOptions = {
                      path: 'creator',
                      select: 'name email'
                  },
                  inviteesOptions = {
                      path: 'invitees',
                      select: 'name email'
                  },
                  attendeesOptions = {
                      path: 'attendees',
                      select: 'name email'
                  },
                  postOptions = {
                      path: 'posts',
                      select: '-__v'
                  },
                  refOptions = [ groupOptions, creatorOptions, inviteesOptions, attendeesOptions, postOptions ];

            return eventData.findEvents(query, fields, refOptions);

        })
        .then(result => {
            if (result) {
                res.status(200).send(result);
            } else {
                throw { status: 404, message: `No events found for member: ${req.params.memberId}` };
            }

        })
        .catch(sendError(res));
}

function getAllGroupEvents(req, res) {
    const paramOptions = [ 'groupId' ],
          validationType = 'event';

    validateRequest({ req, validationType, paramOptions })
        .then(() => {
            const { groupId } = req.params,
                  query = { group: groupId },
                  // remove __v mongoose property
                  fields = '-__v',
                  groupOptions = {
                      path: 'group',
                      select: 'name'
                  },
                  creatorOptions = {
                      path: 'creator',
                      select: 'name email'
                  },
                  inviteesOptions = {
                      path: 'invitees',
                      select: 'name email'
                  },
                  attendeesOptions = {
                      path: 'attendees',
                      select: 'name email'
                  },
                  postOptions = {
                      path: 'posts',
                      select: '-__v'
                  },
                  refOptions = [ groupOptions, creatorOptions, inviteesOptions, attendeesOptions, postOptions ];

            return eventData.findEvents(query, fields, refOptions);
        })
        .then(result => {
            if (result) {
                res.status(200).send(result);
            } else {
                throw { status: 404, message: `No events found for member: ${req.params.memberId}` };
            }

        })
        .catch(sendError(res));
}

module.exports = {
    createEvent,
    getAllMemberCreatedEvents,
    getAllGroupEvents,
    getEventById
};
