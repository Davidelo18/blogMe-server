let userInfo = {
    username: null,
    email: null,
    avatar: null,
    info: null,
    options: null
};

function getUserObject() {
    return userInfo;
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
    userInfo, getUserObject, setUserObject
}