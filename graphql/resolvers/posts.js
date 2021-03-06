const Post = require('../../models/Post');
const auth = require('../../core/auth');
const { AuthenticationError, UserInputError } = require('apollo-server');

module.exports = {
    Query: {
        async getPosts() {
            try {
                const posts = await Post.find().sort({ publishingTime: -1 });
                return posts;
            } catch (err) {
                throw new Error(err);
            }
        },

        async getOnePost(parent, { postId }) {
            try {
                if (!postId.match(/^[0-9a-fA-F]{24}$/)) {
                    throw new Error('Niepoprawne ID posta');
                }

                const post = await Post.findById(postId);

                if (post) {
                    return post;
                } else {
                    throw new Error('Nie znaleziono takiego posta.');
                }
            } catch (err) {
                throw new Error(err);
            }
        }
    },
    Mutation: {
        async createPost(parent, { body }, { user }) {
            if (!user) throw new AuthenticationError('Dostęp zabroniony.');

            if (body.trim() === '') {
                throw new UserInputError('Pusty post', {
                    errors: {
                        body: "Post nie może być pusty"
                    }
                });
            }

            if (body.replace(/\s/g, '').length < 2000) {
                throw new UserInputError('Zbyt krótki post', {
                    errors: {
                        body: "Post musi mieć minimum 2000 znaków"
                    }
                });
            }

            const samePost = await Post.findOne({body});
            if (samePost) {
                throw new UserInputError('Już istnieje taki post ;)', {
                    errors: {
                        body: "Już istnieje taki post ;)"
                    }
                });
            }

            const newPost = new Post({
                body,
                user: user.id,
                username: user.username,
                publishingTime: new Date().toISOString()
            });

            const post = await newPost.save();

            return post;
        },

        async deletePost(parent, { postId }, { user }) {
            if (!user) throw new AuthenticationError('Dostęp zabroniony.');

            try {
                const post = await Post.findById(postId);

                if (user.username === post.username) {
                    await post.delete();
                    return 'Post został usunięty';
                } else {
                    throw new AuthenticationError('Nie kombinuj :)')
                }
            } catch (err) {
                throw new Error(err);
            }
        },

        async plusPost(parent, { postId }, { user }) {
            if (!user) throw new AuthenticationError('Dostęp zabroniony.');

            const post = await Post.findById(postId);
            if (post) {
                // sprawdzanie czy użytkownik/czka nie dał/a juz minusa
                if (post.minusses.find(minus => minus.username === user.username)) {
                    post.minusses = post.minusses.filter(minus => minus.username !== user.username);
                }

                if (post.plusses.find(plus => plus.username === user.username)) { // cofanie plusa
                    post.plusses = post.plusses.filter(plus => plus.username !== user.username);
                } else { // plusowanie
                    post.plusses.push({
                        username: user.username,
                        plussedAt: new Date().toISOString()
                    })
                }

                await post.save();
                return post;
            } else {
                throw new UserInputError('Nie znaleziono takiego posta');
            }
        },

        async minusPost(parent, { postId }, { user }) {
            if (!user) throw new AuthenticationError('Dostęp zabroniony.');

            const post = await Post.findById(postId);
            if (post) {
                // sprawdzanie czy użytkownik/czka nie dał/a juz plusa
                if (post.plusses.find(plus => plus.username === user.username)) {
                    post.plusses = post.plusses.filter(plus => plus.username !== user.username);
                }

                if (post.minusses.find(minus => minus.username === user.username)) { // cofanie plusa
                    post.minusses = post.minusses.filter(minus => minus.username !== user.username);
                } else { // plusowanie
                    post.minusses.push({
                        username: user.username,
                        minussedAt: new Date().toISOString()
                    })
                }

                await post.save();
                return post;
            } else {
                throw new UserInputError('Nie znaleziono takiego posta');
            }
        }
    }
}