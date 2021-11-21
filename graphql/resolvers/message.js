const Message = require('../../models/Message');
const User = require('../../models/User');
const { UserInputError, AuthenticationError } = require('apollo-server-errors');
const { withFilter } = require('apollo-server');

let userInfo = {
    username: null,
    email: null,
    avatar: null,
    info: null,
    options: null
}

function setUserObject(user) {
    userInfo = {
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        info: user.info,
        options: user.options
    }

    return userInfo;
}

module.exports = {
    Query: {
        async checkUnreadMessages(parent, vars, { user }) {
            if (!user) throw new AuthenticationError('Dostęp zabroniony.');

            try {
                const unreadMessages = await Message.find({
                    $and: [
                        { sendTo: user.username },
                        { isRead: false }
                    ]
                });

                return unreadMessages;
            } catch(err) {
                throw new Error(err);
            }
        },
        async getMessages(parent, { messagesFrom }, { user }) {
            if (!user) throw new AuthenticationError('Dostęp zabroniony.');

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
                });

                await Message.updateMany({
                    sendFrom: usernames[1], sendTo: usernames[0]
                }, { $set: { isRead: true } });

                return messages;
            } catch(err) {
                throw new Error(err);
            }
        }
    },
    Mutation: {
        async sendMessage (parent, { body, sendTo }, { user, pubsub }) {
            if (!user) throw new AuthenticationError('Dostęp zabroniony.');
            const recipient = await User.findOne({ username: sendTo });

            if (!recipient) {
                throw new UserInputError('Nie znaleziono użytkownika o takiej nazwie');
            } else if (recipient.username === user.username) {
                throw new UserInputError('Nie możesz pisać sam/a do siebie :)');
            }

            setUserObject(recipient);
            if (!userInfo.options.canReceiveMessages) {
                throw new UserInputError('Nie możesz wysyłać prywatnych wiadomości do tego użytkownika');
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
                sendingTime: new Date().toISOString(),
                isRead: false
            });

            pubsub.publish('NEW_MESSAGE', { newMessage: message });

            return message;
        }
    },
    Subscription: {
        newMessage: {
            subscribe: withFilter((parent, vars, { user, pubsub }) => {
                if (!user) throw new AuthenticationError('Dostęp zabroniony');
                return pubsub.asyncIterator(['NEW_MESSAGE']);
            }, ({ newMessage }, args, { user }) => {
                if (newMessage.sendFrom === user.username) {
                    return true;
                } else {
                    return false;
                }
            }),
        }
    }
}