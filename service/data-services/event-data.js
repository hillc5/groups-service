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
                return result;
            });
}

module.exports = {
    saveEvent
};
