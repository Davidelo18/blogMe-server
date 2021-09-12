const postsResolvers = require('./posts');
const usersResolvers = require('./users');
const commentsResolvers = require('./comments');
const messageResolvers = require('./message');

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
        ...commentsResolvers.Query,
        ...messageResolvers.Query
    },
    Mutation: {
        ...usersResolvers.Mutation,
        ...postsResolvers.Mutation,
        ...commentsResolvers.Mutation,
        ...messageResolvers.Mutation
    }
}