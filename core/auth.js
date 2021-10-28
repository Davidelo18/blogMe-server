const jwt = require('jsonwebtoken');
const { SECRET_KEY } = require('../config');
const { PubSub } = require('apollo-server');

const pubsub = new PubSub();

module.exports = (context) => {
    let token;

    if (context.req && context.req.headers.authorization) {
        token = context.req.headers.authorization.split('Token ')[1];
    } else if (context.connection && context.connection.context.Authorization) {
        token = context.connection.context.Authorization.split('Token ')[1];
    }

    if (token) {
        jwt.verify(token, SECRET_KEY, (err, decodedToken) => {
            context.user = decodedToken;
        });
    }

    context.pubsub = pubsub;

    return context;
}