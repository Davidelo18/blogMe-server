const User = require('../../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const auth = require('../../core/auth');
const { UserInputError } = require('apollo-server');
const { SECRET_KEY } = require('../../config');
const { validateRegisterInput, validateLoginInput } = require('../../core/validators');

function generateToken(user) {
    return jwt.sign({
        id: user.id,
        email: user.email,
        username: user.username
    }, SECRET_KEY, { expiresIn: '1h' });
}

module.exports = {
    Query: {
        async getUserInfo(parent, { username }, context) {
            const userAuth = auth(context);

            try {
                const user = await User.findOne({ username });
                if (user) {
                    return user;
                } else {
                    throw new Error('Nie znaleziono takiego użytkownika');
                }
            } catch (err) {
                throw new Error(err);
            }
        }
    },
    Mutation: {
        async login (parent, { username, password }) {

            // walidacja inputów
            const { valid, errors } = validateLoginInput(username, password);

            // sprawdzenie czy istnieje taki użytkownik/czka
            const user = await User.findOne({ username });

            if (!user) {
                errors.general = 'Nie znaleziono użytkownika/czki o takiej nazwie';
                throw new UserInputError('Nie znaleziono użytkownika/czki o takiej nazwie', { errors });
            }

            // sprawdzenie poprawności hasła
            const match = await bcrypt.compare(password, user.password);

            if (!match) {
                errors.general = 'Niepoprawne hasło';
                throw new UserInputError('Niepoprawne hasło', { errors });
            }

            const token = generateToken(user);

            return {
                ...user._doc,
                id: user._id,
                token
            }
        },

        async register (parent, { registerInput: { username, email, password, confirmPassword } }) {

            // walidacja inputów
            const { valid, errors } = validateRegisterInput(username, email, password, confirmPassword);
            if (!valid) {
                throw new UserInputError('Wystąpił błąd', { errors });
            }

            // sprawdzenie czy nazwa jest już zajęta
            const user = await User.findOne({ username  });

            if (user) {
                throw new UserInputError('Ta nazwa jest zajęta.', {
                    errors: {
                        username: 'Ta nazwa jest zajęta.'
                    }
                });
            }

            // hashowanie hasła
            password = await bcrypt.hash(password, 12);

            const newUser = new User({
                email,
                username,
                password,
                timeCreated: new Date().toISOString()
            });

            const result = await newUser.save();

            const token = generateToken(result);

            return {
                ...result._doc,
                id: result._id,
                token
            };
        }
    }
}