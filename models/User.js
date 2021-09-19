const { model, Schema } = require('mongoose');

const userSchema = new Schema({
    username: String,
    email: String,
    password: String,
    timeCreated: String,
    avatar: String,
    info: {
        name: String,
        surname: String,
        birthDate: String,
        aboutMe: String,
        facebook: String,
        instagram: String,
        youtube: String,
        website: String
    },
    options: {
        nightTheme: Boolean,
        canReceiveMessages: Boolean
    }
});

module.exports = model('User', userSchema);