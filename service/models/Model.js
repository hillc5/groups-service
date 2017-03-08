const mongoose = require('mongoose'),
      { GroupSchema, MemberSchema, EventSchema, PostSchema } = require('./Schema');

mongoose.Promise = global.Promise;

const Member = mongoose.model('Member', MemberSchema),
      Post = mongoose.model('Post', PostSchema),
      Event = mongoose.model('Event', EventSchema),
      Group = mongoose.model('Group', GroupSchema);

module.exports = {
    Post,
    Event,
    Group,
    Member
};
