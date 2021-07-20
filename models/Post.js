const { model, Schema } = require('mongoose');

const postSchema = new Schema({
    body: String,
    username: String,
    publishingTime: String,
    comments: [
        {
            type: Schema.Types.ObjectId,
            ref: 'comments'
        }
    ],
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

module.exports = model('Post', postSchema);