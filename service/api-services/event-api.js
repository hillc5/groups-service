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
                  { name, startDate, endDate, invitees } = req.body,
                  newEvent = {
                      name,
                      group: groupId,
                      creator: memberId,
                      startDate: new Date(startDate),
                      endDate: new Date(endDate),
                      invitees: invitees && invitees.split(',').map(invitee => invitee.trim()) || []
                  };

            return eventData.saveEvent(newEvent);
        })
        .then(result => {
            res.status(201).send(result);
        })
        .catch(sendError(res));
}

module.exports = {
    createEvent
};
