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
        async createPost(parent, { body }, context) {
            const user = auth(context);

            if (body.trim() === '') {
                throw new UserInputError('Pusty post', {
                    errors: {
                        body: "Post nie może być pusty"
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

        async deletePost(parent, { postId }, context) {
            const user = auth(context);

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

        async plusPost(parent, { postId }, context) {
            const { username } = auth(context);

            const post = await Post.findById(postId);
            if (post) {
                // sprawdzanie czy użytkownik/czka nie dał/a juz minusa
                if (post.minusses.find(minus => minus.username === username)) {
                    post.minusses = post.minusses.filter(minus => minus.username !== username);
                }

                if (post.plusses.find(plus => plus.username === username)) { // cofanie plusa
                    post.plusses = post.plusses.filter(plus => plus.username !== username);
                } else { // plusowanie
                    post.plusses.push({
                        username,
                        plussedAt: new Date().toISOString()
                    })
                }

                await post.save();
                return post;
            } else {
                throw new UserInputError('Nie znaleziono takiego posta');
            }
        },

        async minusPost(parent, { postId }, context) {
            const { username } = auth(context);

            const post = await Post.findById(postId);
            if (post) {
                // sprawdzanie czy użytkownik/czka nie dał/a juz plusa
                if (post.plusses.find(plus => plus.username === username)) {
                    post.plusses = post.plusses.filter(plus => plus.username !== username);
                }

                if (post.minusses.find(minus => minus.username === username)) { // cofanie plusa
                    post.minusses = post.minusses.filter(minus => minus.username !== username);
                } else { // plusowanie
                    post.minusses.push({
                        username,
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