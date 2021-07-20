const postsResolvers = require('./posts');
const usersResolvers = require('./users');
const commentsResolvers = require('./comments');

module.exports = {
    Post: {
        voteCount(parent) {
            return parent.plusses.length - parent.minusses.length
        }
    },
    Comment: {
        voteCount(parent) {
            return parent.plusses.length - parent.minusses.length
        }
    },
    Query: {
        ...usersResolvers.Query,
        ...postsResolvers.Query,
        ...commentsResolvers.Query
    },
    Mutation: {
        ...usersResolvers.Mutation,
        ...postsResolvers.Mutation,
        ...commentsResolvers.Mutation
    }
}