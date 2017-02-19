const { Event, Member, Group } = require('../models/Model'),
      verifyEntitiesExist = require('./util/data-utils'),
      logger = require('../util/logger'),

      DATA_NAME = 'MEMBER_DATA';

function saveEvent(eventData) {
    const { owner, group, invitees } = eventData,
          entities = [
              { type: 'member', id: owner },
              { type: 'group', id: group }
          ];

    if (invitees && invitees.length) {
        invitees.forEach(invitee => {
            entities.push({ type: 'member', id: invitee });
        });
    }

    return verifyEntitiesExist(entities)
            .then(() => {
                const event = new Event(eventData);

                logger.info(`${DATA_NAME} - now saving event, ${eventData.name}`);
                return event.save();
            });
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
    const entities = [
        { type: 'event', id: eventId },
        { type: 'member', id: memberId }
    ];

    return verifyEntitiesExist(entities)
            .then(() => {
                const query = { _id: eventId },
                      update = { $addToSet: { invitees: memberId }},
                      options = { new: true };

                return Event.findOneAndUpdate(query, update, options).exec();
            });
}

function moveMemberToAttendees(eventId, memberId) {
    const entities = [
        { type: 'event', id: eventId },
        { type: 'member', id: memberId }
    ];

    return verifyEntitiesExist(entities)
            .then(() => {
                const query = { _id: eventId };

                return Event.findOne(query)
            })
            .then(event => {
                let index = event.invitees.findIndex(invitee => invitee.equals(memberId));

                if (index < 0) {
                    throw { status: 404, message: `No member found in invitees for ${memberId}` };
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
