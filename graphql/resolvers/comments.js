const Comment = require('../../models/Comment');
const Post = require('../../models/Post');
const { AuthenticationError, UserInputError } = require('apollo-server');

module.exports = {
    Query: {
        async getComments(parent, { postId }) {
            try {
                const comments = await Comment.find({ referTo: postId });
                return comments;
            } catch (err) {
                throw new Error(err);
            }
        },

        async getReplies(parent, { commentId }) {
            try {
                const comments = await Comment.find({ referTo: commentId });
                return comments;
            } catch (err) {
                throw new Error(err);
            }
        },
    },
    Mutation: {
        async createComment(parent, { postId, body }, { user }) {
            if (!user) throw new AuthenticationError('Dostęp zabroniony.');

            if (body.trim() === '') {
                throw new UserInputError('Pusty komentarz', {
                    errors: {
                        body: "Komentarz nie może być pusty"
                    }
                })
            }

            if (body.trim().length < 200) {
                throw new UserInputError('Krótki komentarz', {
                    errors: {
                        body: "Komentarz musi mieć minimum 200 znaków"
                    }
                })
            }

            const sameComment = await Comment.findOne({
                $and: [
                       {body},
                       {referTo: postId}
                    ]
            });
            if (sameComment) {
                throw new UserInputError('Już istnieje taki komentarz ;)', {
                    errors: {
                        body: "Już istnieje taki komentarz ;)"
                    }
                });
            }

            try {
                const post = await Post.findById(postId);
                if (post) {
                    const newComment = new Comment({
                        body,
                        referTo: postId,
                        user: user.id,
                        username: user.username,
                        publishingTime: new Date().toISOString()
                    });

                    const comment = await newComment.save();

                    return comment;
                } else {
                    throw new UserInputError('Nie znaleziono takiego posta');
                }
            } catch (err) {
                throw new Error(err);
            }
        },

        async deleteComment(parent, { commentId }, { user }) {
            if (!user) throw new AuthenticationError('Dostęp zabroniony.');

            try {
                const comment = await Comment.findById(commentId);

                if (user.username === comment.username) {
                    await comment.delete();
                    return "Komentarz został usunięty";
                } else {
                    throw new AuthenticationError('Nie kombinuj :)')
                }
            } catch (err) {
                throw new Error(err);
            }
        },

        async plusComment(parent, { commentId }, { user }) {
            if (!user) throw new AuthenticationError('Dostęp zabroniony.');

            const comment = await Comment.findById(commentId);
            if (comment) {
                // sprawdzanie czy użytkownik/czka nie dał/a juz minusa
                if (comment.minusses.find(minus => minus.username === user.username)) {
                    comment.minusses = comment.minusses.filter(minus => minus.username !== user.username);
                }

                if (comment.plusses.find(plus => plus.username === user.username)) { // cofanie plusa
                    comment.plusses = comment.plusses.filter(plus => plus.username !== user.username);
                } else { // plusowanie
                    comment.plusses.push({
                        username: user.username,
                        plussedAt: new Date().toISOString()
                    })
                }

                await comment.save();
                return comment;
            } else {
                throw new UserInputError('Nie znaleziono takiego komentarza');
            }
        },

        async minusComment(parent, { commentId }, { user }) {
            if (!user) throw new AuthenticationError('Dostęp zabroniony.');

            const comment = await Comment.findById(commentId);
            if (comment) {
                // sprawdzanie czy użytkownik/czka nie dał/a juz plusa
                if (comment.plusses.find(plus => plus.username === user.username)) {
                    comment.plusses = comment.plusses.filter(plus => plus.username !== user.username);
                }

                if (comment.minusses.find(minus => minus.username === user.username)) { // cofanie minusa
                    comment.minusses = comment.minusses.filter(minus => minus.username !== user.username);
                } else { // minusowanie
                    comment.minusses.push({
                        username: user.username,
                        minussedAt: new Date().toISOString()
                    })
                }

                await comment.save();
                return comment;
            } else {
                throw new UserInputError('Nie znaleziono takiego komentarza');
            }
        },

        async postReplyToComment(parent, { commentId, body }, { user }) {
            if (!user) throw new AuthenticationError('Dostęp zabroniony.');

            if (body.trim() === '') {
                throw new UserInputError('Pusty komentarz', {
                    errors: {
                        body: "Komentarz nie może być pusty"
                    }
                })
            }

            if (body.trim().length < 200) {
                throw new UserInputError('Krótki komentarz', {
                    errors: {
                        body: "Komentarz musi mieć minimum 200 znaków"
                    }
                })
            }

            const comment = await Comment.findById(commentId);
            if (comment) {
                const newReply = new Comment({
                    body,
                    referTo: commentId,
                    user: user.id,
                    username: user.username,
                    publishingTime: new Date().toISOString()
                });

                const reply = await newReply.save();
                return reply;
            } else {
                throw new UserInputError('Nie znaleziono takiego komentarza');
            }
        }
    }
}