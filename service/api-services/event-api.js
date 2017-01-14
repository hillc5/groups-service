const eventData = require('../data-services/event-data'),
      { sendError, validateRequest } = require('../util/validation'),
      validationType = 'event';

function createEvent(req, res) {
    const bodyOptions = [ 'name', 'startDate', 'endDate', 'groupId', 'memberId' ],
          validationType = 'event';

    validateRequest({ req, validationType, bodyOptions })
        .then(() => {
            const { name, startDate, endDate, invitees=[], groupId, memberId } = req.body,
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
    const paramOptions = [ 'eventId' ],
          validationType = 'event';

    validateRequest({ req, paramOptions, validationType })
        .then(() => {
            const { eventId } = req.params,
                  query = { _id: eventId },
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

module.exports = {
    createEvent,
    getEventById
};
