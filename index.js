const { ApolloServer, PubSub } = require('apollo-server');
const mongoose = require('mongoose');
const typeDefs = require('./graphql/typeDefs');
const { MONGODB } = require('./config.js');
const resolvers = require('./graphql/resolvers');

const pubsub = new PubSub();

const port = process.env.PORT || 5000;
const server = new ApolloServer({ 
    typeDefs, 
    resolvers, 
    context: ({ req }) => ({ req, pubsub }),
    playground: true,
    introspection: true
});

mongoose.connect(MONGODB, { useNewUrlParser: true })
    .then(() => {
        return server.listen({ port: port });
    })
    .then(res => {
        console.log(`Server running at ${res.url}`);
    })
    .catch(err => {
        console.error(err);
    });