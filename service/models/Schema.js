const { Schema } = require('mongoose'),
      ObjectId = Schema.Types.ObjectId;


const MemberSchema = Schema({
    name: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    joinDate: Date
});

const PostSchema = Schema({
    name: { type: String, required: true },
    text: { type: String, required: true },
    owner:  { type: ObjectId, ref: 'Member', required: true },
    group: { type: ObjectId, ref: 'Group', required: true },
    event: { type: ObjectId, ref: 'Event' },
    replies: [ { type: ObjectId, ref: 'Post' } ],
    postDate: Date
});

const EventSchema = Schema({
    name: { type: String, required: true },
    group: { type: ObjectId, ref: 'Group', required: true },
    owner: { type: ObjectId, ref: 'Member', required: true },
    invitees: [ { type: ObjectId, ref: 'Member' } ],
    attendees: [ { type: ObjectId, ref: 'Member' } ],
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true }
});

const GroupSchema = Schema({
    name: { type: String, required: true },
    isPublic: { type: Boolean, default: true },
    description: String,
    members: [ { type: ObjectId, ref: 'Member' } ],
    tags: [ String ],
    creationDate: Date,
    lastUpdated: Date,
    owner: { type: ObjectId, ref: 'Member', required: true }
});

module.exports = {
    GroupSchema,
    MemberSchema,
    EventSchema,
    PostSchema
};
