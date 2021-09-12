const Message = require('../../models/Message');
const auth = require('../../core/auth');
const User = require('../../models/User');
const { UserInputError } = require('apollo-server-errors');

module.exports = {
    Query: {
        async getMessages(parent, { messagesFrom }, context) {
            const user = auth(context);

            try {
                const recipient = await User.findOne({ username: messagesFrom });

                if (!recipient) {
                    throw new UserInputError('Nie znaleziono użytkownika/czki o takiej nazwie');
                }

                const usernames = [user.username, recipient.username];

                const messages = await Message.find({
                    $or: [
                        { sendFrom: usernames[0], sendTo: usernames[1] },
                        { sendFrom: usernames[1], sendTo: usernames[0] },
                    ]
                })

                return messages;
            } catch(err) {
                throw new Error(err);
            }
        }
    },
    Mutation: {
        async sendMessage (parent, { body, sendTo }, context) {
            const user = auth(context);
            const recipient = await User.findOne({ username: sendTo });

            if (!recipient) {
                throw new UserInputError('Nie znaleziono użytkownika o takiej nazwie');
            } else if (recipient.username === user.username) {
                throw new UserInputError('Nie możesz pisać sam/a do siebie :)');
            }

            if (body.trim() === '') {
                throw new UserInputError('Pusta wiadomość', {
                    errors: {
                        body: "Wiadomomość nie może być pusta"
                    }
                })
            }

            const message = await Message.create({
                sendFrom: user.username,
                sendTo,
                body,
                sendingTime: new Date().toISOString()
            });

            return message;
        }
    }
}