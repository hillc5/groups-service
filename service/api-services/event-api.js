const eventData = require('../data-services/event-data'),
      validateRequest = require('./util/api-validation'),
      handleError = require('./util/api-error-handler');

function createEvent(req, res) {
    const bodyOptions = [ 'name', 'startDate', 'endDate', 'groupId', 'memberId' ];

    validateRequest({ req, bodyOptions })
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
            // Add creator to invitees list
            newEvent.invitees.unshift(newEvent.creator);
            return eventData.saveEvent(newEvent);
        })
        .then(result => {
            res.status(201).send(result);
        })
        .catch(handleError(res));
}

function getEventById(req, res) {
    const paramOptions = [ 'eventId' ];

    validateRequest({ req, paramOptions })
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
                throw { status: 404, message: `No event found for ${req.params.eventId}` };
            }
        })
        .catch(handleError(res));
}

function memberInvite(req, res) {
    const paramOptions = [ 'eventId' ],
          bodyOptions = [ 'memberId' ];

    validateRequest({ req, paramOptions, bodyOptions })
        .then(() => {
            const { eventId } = req.params,
                  { memberId } = req.body;

            return eventData.addMemberToInvitees(eventId, memberId);
        })
        .then(result => {
            if (result) {
                res.status(200).send(result);
            } else {
                throw { status: 500, message: 'There was an error' }
            }
        })
        .catch(handleError(res));

}

function memberAttend(req, res) {
    const paramOptions = [ 'eventId' ],
          bodyOptions = [ 'memberId' ];

    validateRequest({ req, paramOptions, bodyOptions })
        .then(() => {
            const { eventId } = req.params,
                  { memberId } = req.body;

            return eventData.moveMemberToAttendees(eventId, memberId);
        })
        .then(result => {
            if (result) {
                res.status(200).send(result);
            } else {
                throw { status: 500, message: 'There was an error' };
            }
        })
        .catch(handleError(res));
}

module.exports = {
    createEvent,
    getEventById,
    memberInvite,
    memberAttend
};
