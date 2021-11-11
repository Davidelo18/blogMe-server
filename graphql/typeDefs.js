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
    type Message {
        id: ID!
        body: String!
        sendFrom: String!
        sendTo: String!
        sendingTime: String!
        isRead: Boolean!
    }
    type User {
        id: ID!
        username: String!
        email: String!
        token: String!
        timeCreated: String!
        avatar: String!
        info: Info!
        options: Options!
    }
    type Info {
        name: String
        surname: String
        birthDate: String
        aboutMe: String
        facebook: String
        instagram: String
        youtube: String
        website: String
    }
    type Options {
        nightTheme: Boolean!
        canReceiveMessages: Boolean!
    }
    input RegisterInput {
        username: String!
        email: String!
        password: String!
        confirmPassword: String!
    }
    type Query {
        getUsers: [User]
        getUserInfo(username: String!): User
        getPosts: [Post]
        getOnePost(postId: ID!): Post
        getComments(postId: ID!): [Comment]
        getReplies(commentId: ID!): [Comment]
        getMessages(messagesFrom: String!): [Message]
    }
    type Mutation {
        register(registerInput: RegisterInput): User!
        login(username: String!, password: String!): User!
        createPost(body: String!): Post!
        deletePost(postId: ID!): String!
        plusPost(postId: ID!): Post!
        minusPost(postId: ID!): Post!
        createComment(postId: ID!, body: String!): Comment!
        deleteComment(commentId: ID!): String!
        plusComment(commentId: ID!): Comment!
        minusComment(commentId: ID!): Comment!
        postReplyToComment(commentId: ID!, body: String!): Comment!
        sendMessage(body: String!, sendTo: String!): Message!
        setAvatar(photoUrl: String!): User!
        setUserInfo(name: String, surname: String, birthDate: String, aboutMe: String, facebook: String, instagram: String, youtube: String, website: String): User!
        setUserOptions(nightTheme: Boolean, canReceiveMessages: Boolean): User!
    }
    type Subscription {
        newMessage: Message!
        readMessage: Message!
    }
`