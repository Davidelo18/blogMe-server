const { model, Schema } = require('mongoose');

const commentSchema = new Schema({
    referTo: {
        type: Schema.Types.ObjectId,
        ref: 'posts'
    },
    body: String,
    username: String,
    publishingTime: String,
    plusses: [
        {
            username: String,
            plussedAt: String
        }
    ],
    minusses: [
        {
            username: String,
            minussedAt: String
        }
    ],
    user: {
        type: Schema.Types.ObjectId,
        ref: 'users'
    }
});

module.exports = model('Comment', commentSchema);