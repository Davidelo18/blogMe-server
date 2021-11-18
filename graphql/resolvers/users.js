const User = require('../../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { UserInputError, AuthenticationError } = require('apollo-server');
const { SECRET_KEY } = require('../../config');
const { validateRegisterInput, validateLoginInput } = require('../../core/validators');
const validUrl = require('valid-url');
const Canvas = require("canvas");

global.Image = Canvas.Image;

function generateToken(user) {
    return jwt.sign({
        id: user.id,
        email: user.email,
        username: user.username
    }, SECRET_KEY, { expiresIn: '6h' });
}

let userInfo = {
    username: null,
    email: null,
    avatar: null,
    info: null,
    options: null
}

function setUserObject(user) {
    userInfo = {
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        info: user.info,
        options: user.options
    }

    return userInfo;
}

module.exports = {
    Query: {
        async getUsers(parent, vars, { user }) {
            if (!user) throw new AuthenticationError('Dostęp zabroniony.');
            try {
                const users = await User.find();
                return users;
            } catch (err) {
                throw new Error(err);
            }
        },
        async getUserInfo(parent, { username }, { user }) {
            if (!user) throw new AuthenticationError('Dostęp zabroniony.');

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
        async login(parent, { username, password }) {

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
            setUserObject(user);

            return {
                ...user._doc,
                id: user._id,
                token,
                options: userInfo.options
            }
        },

        async register(parent, { registerInput: { username, email, password, confirmPassword } }) {

            // walidacja inputów
            const { valid, errors } = validateRegisterInput(username, email, password, confirmPassword);
            if (!valid) {
                throw new UserInputError('Wystąpił błąd', { errors });
            }

            // sprawdzenie czy nazwa jest już zajęta
            const user = await User.findOne({ username });

            if (user) {
                throw new UserInputError('Ta nazwa jest zajęta.', {
                    errors: {
                        username: 'Ta nazwa jest zajęta.'
                    }
                });
            }

            const usernameLength = username.length;

            if (usernameLength < 5 || usernameLength > 16) {
                throw new UserInputError('Nazwa musi mieć od 5 do 16 znaków.', {
                    errors: {
                        username: 'Nazwa musi mieć od 5 do 16 znaków.'
                    }
                });
            }

            const emailCheck = await User.findOne({ email });

            if (emailCheck) {
                throw new UserInputError('Ten email jest już przypisany do innego konta.', {
                    errors: {
                        email: 'Ten email jest już przypisany do innego konta.'
                    }
                });
            }

            const passwordLength = password.length;
            if (passwordLength < 5 || passwordLength > 20) {
                throw new UserInputError('Hasło musi mieć od 5 do 20 znaków.', {
                    errors: {
                        username: 'Hasło musi mieć od 5 do 20 znaków.'
                    }
                });
            }

            // hashowanie hasła
            password = await bcrypt.hash(password, 12);

            const newUser = new User({
                email,
                username,
                password,
                timeCreated: new Date().toISOString(),
                avatar: 'https://blogme.pl/avatar.png',
                info: {
                    name: '',
                    surname: '',
                    birthDate: '',
                    aboutMe: '',
                    facebook: '',
                    instagram: '',
                    youtube: '',
                    website: ''
                },
                options: {
                    nightTheme: false,
                    canReceiveMessages: true
                }
            });

            const result = await newUser.save();

            const token = generateToken(result);

            return {
                ...result._doc,
                id: result._id,
                token
            };
        },

        async setAvatar(parent, { photoUrl }, { user }) {
            if (!user) throw new AuthenticationError('Dostęp zabroniony.');

            if (!validUrl.isUri(photoUrl)) {
                throw new UserInputError('Niepoprawny link');
            }

            var image = new Image();
            image.src = photoUrl;

            await User.updateOne({ username: user.username }, { $set: { avatar: photoUrl } });

            const currentUser = await User.findOne({ username: user.username });
            setUserObject(currentUser);

            return User.findOne({ username: user.username });
        },

        async setUserInfo(parent, { name, surname, birthDate, aboutMe, facebook, instagram, youtube, website }, { user }) {
            if (!user) throw new AuthenticationError('Dostęp zabroniony.');

            if (name !== null) await User.updateOne({ username: user.username }, { $set: { "info.name": name } });
            if (surname !== null) await User.updateOne({ username: user.username }, { $set: { "info.surname": surname } });
            if (birthDate !== null) await User.updateOne({ username: user.username }, { $set: { "info.birthDate": birthDate } });
            if (aboutMe !== null) await User.updateOne({ username: user.username }, { $set: { "info.aboutMe": aboutMe } });
            if (facebook !== null) await User.updateOne({ username: user.username }, { $set: { "info.facebook": facebook } });
            if (instagram !== null) await User.updateOne({ username: user.username }, { $set: { "info.instagram": instagram } });
            if (youtube !== null) await User.updateOne({ username: user.username }, { $set: { "info.youtube": youtube } });
            if (website !== null) await User.updateOne({ username: user.username }, { $set: { "info.website": website } });

            const currentUser = await User.findOne({ username: user.username });
            setUserObject(currentUser);

            return User.findOne({ username: user.username });
        },

        async setUserOptions(parent, { nightTheme, canReceiveMessages }, context) {
            const user = auth(context);

            if (nightTheme !== null) await User.updateOne({ username: user.username }, { $set: { "options.nightTheme": nightTheme } });
            if (canReceiveMessages !== null) await User.updateOne({ username: user.username }, { $set: { "options.canReceiveMessages": canReceiveMessages } });

            const currentUser = await User.findOne({ username: user.username });
            setUserObject(currentUser);

            return User.findOne({ username: user.username });
        }
    }
}