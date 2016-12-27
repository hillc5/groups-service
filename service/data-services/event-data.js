const { Event } = require('../models/Model'),
      logger = require('../util/logger'),

      DATA_NAME = 'MEMBER_DATA';


function saveEvent(eventData) {
    const event = new Event(eventData);

    logger.info(`${DATA_NAME} = now saving event, ${eventData.name}`);
    return event.save();
}

module.exports = {
    saveEvent
};
