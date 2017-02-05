const { Event, Member, Group } = require('../models/Model'),
      logger = require('../util/logger'),

      DATA_NAME = 'MEMBER_DATA';

function saveEvent(eventData) {
    const event = new Event(eventData);

    logger.info(`${DATA_NAME} - now saving event, ${eventData.name}`);
    return event.save()
}

function findEvents(query={}, fields='', refOptions=[]) {
    let eventQuery = Event.find(query)
                            .select(fields)
                            .populate(refOptions);

    logger.info(`${DATA_NAME} - find events by ${JSON.stringify(query)}`);
    return eventQuery.exec();
}

function findEvent(query={}, fields='', refOptions=[]) {
    let eventQuery = Event.findOne(query)
                            .select(fields)
                            .populate(refOptions);

    logger.info(`${DATA_NAME} - find event by ${JSON.stringify(query)}`);
    return eventQuery.exec();
}

function addMemberToInvitees(eventId, memberId) {
    const query = { _id: eventId },
          update = { $addToSet: { invitees: memberId }},
          options = { new: true };

    let result;

    return Event.findOneAndUpdate(query, update, options)
            .exec()
            .then(event => {
                if (!event) {
                    throw { status: 404, message: `No event found for id: ${eventId}` };
                }
                return event;
            });
}

function moveMemberToAttendees(eventId, memberId) {
    const query = { _id: eventId };

    return Event.findOne(query)
            .then(event => {
                let index;

                if (!event) {
                    throw { status: 404, message: `No event found for id: ${eventId}` };
                }

                index = event.invitees.findIndex(invitee => invitee.equals(memberId));

                if (index < 0) {
                    throw { status: 404, message: `No member found for id: ${memberId}` };
                }

                event.invitees.splice(index, 1);
                event.attendees.push(memberId);
                event.save();

                return event;
            });
}

module.exports = {
    saveEvent,
    findEvents,
    findEvent,
    addMemberToInvitees,
    moveMemberToAttendees
};
