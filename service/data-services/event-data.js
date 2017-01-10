const { Event, Member, Group } = require('../models/Model'),
      logger = require('../util/logger'),

      DATA_NAME = 'MEMBER_DATA';


function saveEvent(eventData) {
    const event = new Event(eventData);

    let eventId,
        result;

    logger.info(`${DATA_NAME} = now saving event, ${eventData.name}`);
    return event.save()
            .then(event => {
                result = event;
                eventId = result._id;
                return Member.findOne({ _id: result.creator });
            })
            .then(member => {
                member.memberEvents.push({ _id: eventId });
                member.save();
                return Group.findOne({ _id: result.group });
            })
            .then(group => {
                group.events.push({ _id: eventId });
                group.save();
                return Member.find({ _id: { $in: result.invitees }});
            })
            .then(members => {
                if (members) {
                    members.forEach(member => {
                        if (!member._id.equals(result.creator)) {
                            member.memberEvents.push({ _id: eventId });
                            member.save();
                        }
                    });
                }
                return result;
            });
}

function findEvents(query, fields, refOptions) {
    let eventQuery = Event.find(query)
                            .select(fields)
                            .populate(refOptions);

    logger.info(`${DATA_NAME} - find events by ${JSON.stringify(query)}`);
    return eventQuery.exec();
}

function findEvent(query, fields, refOptions) {
    let eventQuery = Event.findOne(query)
                            .select(fields)
                            .populate(refOptions);

    logger.info(`${DATA_NAME} - find event by ${JSON.stringify(query)}`);
    return eventQuery.exec();
}

module.exports = {
    saveEvent,
    findEvents,
    findEvent
};
