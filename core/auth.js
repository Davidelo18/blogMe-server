const jwt = require('jsonwebtoken');
const { SECRET_KEY } = require('../config');
const { AuthenticationError } = require('apollo-server');

module.exports = (context) => {
    const authHeader = context.req.headers.authorization;

    if (authHeader) {
        const token = authHeader.split('Token ')[1];

        if (token) {
            try {
                const user = jwt.verify(token, SECRET_KEY);
                return user;
            } catch (err) {
                throw new AuthenticationError('Niepoprawny lub wygaśnięty token');
            }
        }

        throw new Error('Token powinien być w postaci \'Token [token]' );
    }

    throw new Error('Brak tokenu');
}