const { gql } = require('apollo-server');

module.exports = gql`
    type Post {
        id: ID!
        body: String!
        username: String!
        publishingTime: String!
        plusses: [Vote]!
        minusses: [Vote]!
        voteCount: Int!
    }
    type Comment {
        id: ID!
        body: String!
        username: String!
        publishingTime: String!
        plusses: [Vote]!
        minusses: [Vote]!
        voteCount: Int!
    }
    type Vote {
        id: ID!
        plussedAt: String!
        username: String!
    }
    type User {
        id: ID!
        username: String!
        email: String!
        token: String!
        timeCreated: String!
    }
    input RegisterInput {
        username: String!
        email: String!
        password: String!
        confirmPassword: String!
    }
    type Query {
        getUserInfo(username: String!): User
        getPosts: [Post]
        getOnePost(postId: ID!): Post
        getComments(postId: ID!): [Comment]
        getReplies(commentId: ID!): [Comment]
    }
    type Mutation {
        register(registerInput: RegisterInput): User!
        login(username: String!, password: String!): User!
        createPost(body: String!): Post!
        deletePost(postId: ID!): String!
        plusPost(postId: ID!): Post!
        minusPost(postId: ID!): Post!
        createComment(postId: ID!, body: String!): Comment!
        deleteComment(commentId: ID!): Comment!
        plusComment(commentId: ID!): Comment!
        minusComment(commentId: ID!): Comment!
        postReplyToComment(commentId: ID!, body: String!): Comment!
    }
`