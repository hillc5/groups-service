const mongoose = require('mongoose'),
      Schema = mongoose.Schema,
      ObjectId = Schema.Types.ObjectId;

const PostSchema = Schema({
    title: { type: String, required: true },
    text: { type: String, required: true },
    owner:  { type: ObjectId, ref: 'Member' },
    replies: [ { type: ObjectId, ref: 'Post' } ],
    date: Date
});

const EventSchema = Schema({
    name: { type: String, required: true },
    group: { type: ObjectId, ref: 'Group' },
    invitees: [ { type: ObjectId, ref: 'Member' } ],
    attendees: [ { type: ObjectId, ref: 'Member' } ],
    posts: [ { type: ObjectId ref: 'Post' } ],
    startDate: Date,
    endDate: Date,
});

const GroupSchema = Schema({
    name: { type: String, required: true },
    isPublic: { type: Boolean, required: true },
    description: String,
    members: [ { type: ObjectId, ref: 'Member' } ],
    events: [ { type: ObjectId, ref: 'Event' } ],
    posts: [ { id: ObjectId, ref: 'Post' } ],
    tags: [ String ],
    creationDate: Date,
    lastUpdated: Date,
    owner: { type: ObjectId, ref: 'Member' }
});

const MemberSchema = new mongoose.Schema({
    name: { type: String, required: true },
    memberGroups: [ { type: ObjectId, ref: 'Group' } ],
    memberPosts: [ { type:  ObjectId, ref: 'Post' } ],
    memberEvents: [ { type: ObjectId, ref: 'Event' } ],
    joinDate: Date
});

modules.export = {
    GroupSchema,
    MemberSchema,
    EventSchema,
    PostSchema
};