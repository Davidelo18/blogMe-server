const User = require('../../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const auth = require('../../core/auth');
const { UserInputError } = require('apollo-server');
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

function testImage(url, timeout) {
    timeout = timeout || 5000;
    var timedOut = false, timer;
    var img = new Image();
    let ok = false;
    img.onerror = img.onabort = function() {
        console.log('NOT OK');
        if (!timedOut) {
            clearTimeout(timer);
            ok = true;
        }
    };
    img.onload = function() {
        if (!timedOut) {
            clearTimeout(timer);
            ok = false;
        }
    };
    img.src = url;
    timer = setTimeout(function() {
        timedOut = true;
        img.src = "//!!!!/test.jpg";
        if (ok) return true;
        else return false;
    }, timeout);
}

module.exports = {
    Query: {
        async getUsers(parent, vars, context) {
            const userAuth = auth(context);
            try {
                const users = await User.find();
                return users;
            } catch (err) {
                throw new Error(err);
            }
        },
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
            setUserObject(user);

            return {
                ...user._doc,
                id: user._id,
                token,
                options: userInfo.options
            }
        },

        async register (parent, { registerInput: { username, email, password, confirmPassword } }) {

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

            const emailCheck = await User.findOne({ email });

            if (emailCheck) {
                throw new UserInputError('Ten email jest już przypisany do innego konta.', {
                    errors: {
                        email: 'Ten email jest już przypisany do innego konta.'
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

        async setAvatar(parent, { photoUrl }, context) {
            const user = auth(context);

            if (!validUrl.isUri(photoUrl)) {
                throw new Error('Niepoprawny link');
            }

            var image = new Image();
            image.onerror = function() {
                throw new Error('Niepoprawny obraz');
            }
            image.src = photoUrl;

            await User.updateOne({ username: user.username }, { $set: { avatar: photoUrl } });

            const currentUser = await User.findOne({ username: user.username });
            setUserObject(currentUser);

            return User.findOne({ username: user.username });
        },

        async setUserInfo(parent, { name, surname, birthDate, aboutMe, facebook, instagram, youtube, website }, context) {
            const user = auth(context);

            if (name) await User.updateOne({ username: user.username }, { $set: { "info.name": name } });
            if (surname) await User.updateOne({ username: user.username }, { $set: { "info.surname": surname } });
            if (birthDate) await User.updateOne({ username: user.username }, { $set: { "info.birthDate": birthDate } });
            if (aboutMe) await User.updateOne({ username: user.username }, { $set: { "info.aboutMe": aboutMe } });
            if (facebook) await User.updateOne({ username: user.username }, { $set: { "info.facebook": facebook } });
            if (instagram) await User.updateOne({ username: user.username }, { $set: { "info.instagram": instagram } });
            if (youtube) await User.updateOne({ username: user.username }, { $set: { "info.youtube": youtube } });
            if (website) await User.updateOne({ username: user.username }, { $set: { "info.website": website } });

            const currentUser = await User.findOne({ username: user.username });
            setUserObject(currentUser);

            return User.findOne({ username: user.username });
        },

        async setUserOptions(parent, { nightTheme, canReceiveMessages }, context) {
            const user = auth(context);

            if (nightTheme) await User.updateOne({ username: user.username }, { $set: { "options.nightTheme": nightTheme } });
            if (canReceiveMessages) await User.updateOne({ username: user.username }, { $set: { "options.canReceiveMessages": canReceiveMessages } });

            const currentUser = await User.findOne({ username: user.username });
            setUserObject(currentUser);

            return User.findOne({ username: user.username });
        }
    }
}