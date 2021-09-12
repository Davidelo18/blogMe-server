const { model, Schema } = require('mongoose');

const messageSchema = new Schema({
    body: String,
    sendFrom: String,
    sendTo: String,
    sendingTime: String,
    user: {
        type: Schema.Types.ObjectId,
        ref: 'users'
    }
});

module.exports = model('Message', messageSchema);